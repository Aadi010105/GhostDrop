//----------------------------------------------------------------------------------------------------------------------------
// req.params: For identifying specific resources within the URL path (e.g., /products/456). 
// req.query: For adding filter criteria or optional parameters to the URL (e.g., /products?color=blue&sort=asc). 
// req.body: For sending larger, often sensitive or structured, data from the client to the server, typically in POST or PUT requests. 
//----------------------------------------------------------------------------------------------------------------------------


const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { validate, createFolderSchema, updateFolderSchema } = require('../utils/validation');

const createFolder = async (req, res, next) => {
  try {
    const { value, errors } = validate(req.body, createFolderSchema);
    if (errors) return res.status(400).json({ errors });

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, parentId, workspaceId } = value;

    // Ensure parent folder belongs to the user or workspace
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
        select: { ownerId: true, workspaceId: true },
      });

      if (!parentFolder || (parentFolder.ownerId !== userId && parentFolder.workspaceId !== workspaceId)) {
        return res.status(403).json({ error: 'Unauthorized to create folder in this parent' });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        ownerId: userId,
        parentId: parentId || null,
        workspaceId: workspaceId || null,
      },
    });

    logger.info(`Folder created: ${folder.name} by user ${userId}`);
    res.status(201).json(folder);
  } catch (err) {
    logger.error('createFolder failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

// Controller to get a list of folders. The logic is dynamic based on query parameters.
const getFolders = async (req, res, next) => {
    try {
      // 1. AUTHENTICATION: Get the user's ID from the request (added by auth middleware).
      const userId = req.auth?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
      // Get optional filters from the URL's query string (e.g., /folders?parentId=abc).
      const { parentId, workspaceId } = req.query;
  
      // 2. DYNAMIC QUERY BUILDING: Start building the Prisma query filter.
      // The base rule is to always fetch folders owned by the current user.
      const whereClause = { ownerId: userId };
  
      // This block chooses ONE of three paths based on the query parameters.
      if (parentId) {
        // PATH 1: If a parentId is provided, get the contents of that specific folder.
        whereClause.parentId = parentId;
  
      } else if (workspaceId) {
        // PATH 2: If a workspaceId is provided, get the folders in that workspace.
        whereClause.workspaceId = workspaceId;
        
        // -- Authorization Check --
        // Before fetching, ensure the user is actually a member of this workspace.
        const workspaceMember = await prisma.workspaceMember.findUnique({
          where: { userId_workspaceId: { userId, workspaceId } },
        });
        if (!workspaceMember) {
          return res.status(403).json({ error: 'Not a member of this workspace' });
        }
  
      } else {
        // PATH 3 (DEFAULT): If no params are given, get the user's top-level personal folders.
        whereClause.parentId = null; 
      }
  
      // 3. DATABASE QUERY: Execute the findMany query using the dynamically built whereClause.
      const folders = await prisma.folder.findMany({
        where: whereClause,
        // Use 'include' to also fetch related files and sub-folders in one efficient query.
        include: {
          files: { select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true } },
          children: { select: { id: true, name: true, createdAt: true } },
        },
      });
  
      // 4. SEND RESPONSE: Send the array of found folders back to the client.
      res.json(folders);
  
    } catch (err) {
      // If any step in the 'try' block fails, log the error and pass it to an error handler.
      logger.error('getFolders failed: %s', err.message, { stack: err.stack });
      next(err);
    }
  };

// Controller to get a single folder by its ID, with robust security checks.
const getFolderById = async (req, res, next) => {
    try {
      // Get the folder ID from the URL and the user ID from the auth token.
      const { id } = req.params;
      const userId = req.auth?.userId;
  
      // 1. AUTHENTICATION: Stop if the user is not logged in.
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
      // 2. FETCH DATA: Get the folder and its related data (owner, files, etc.) in one query.
      const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
          owner: { select: { id: true, email: true } },
          files: { select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true } },
          children: { select: { id: true, name: true, createdAt: true } },
          workspace: { select: { id: true, name: true } },
        },
      });
  
      // If the database query returns nothing, the folder doesn't exist.
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
  
      // 3. AUTHORIZATION: Check if the user has permission to view this folder.
      // First, check if the user is NOT the owner.
      if (folder.ownerId !== userId) {
        // If not the owner, check if the folder is in a workspace.
        if (folder.workspaceId) {
          // If it is, check if the user is a member of that workspace.
          const workspaceMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId, workspaceId: folder.workspaceId } },
          });
          // If they are not a member, deny access.
          if (!workspaceMember) {
            return res.status(403).json({ error: 'Unauthorized to access this folder' });
          }
        } else {
          // If not the owner AND it's not a workspace folder, it's a private folder. Deny access.
          return res.status(403).json({ error: 'Unauthorized to access this folder' });
        }
      }
  
      // 4. SUCCESS: If all checks pass, send the folder data.
      res.json(folder);
  
    } catch (err) {
      // If any server error occurs, log it and pass to an error handler.
      logger.error('getFolderById failed: %s', err.message, { stack: err.stack });
      next(err);
    }
  };

const updateFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, errors } = validate(req.body, updateFolderSchema);
    if (errors) return res.status(400).json({ errors });

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify user is the owner of the folder
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingFolder || existingFolder.ownerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this folder' });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: value,
    });

    logger.info(`Folder updated: ${updatedFolder.name} by user ${userId}`);
    res.json(updatedFolder);
  } catch (err) {
    logger.error('updateFolder failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify user is the owner of the folder
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
      select: { ownerId: true, files: { select: { id: true } }, shares: { select: { id: true } } },
    });

    if (!existingFolder || existingFolder.ownerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this folder' });
    }

    // Prevent deletion if folder contains files or shares
    if (existingFolder.files.length > 0 || existingFolder.shares.length > 0) {
      return res.status(400).json({ error: 'Folder contains files or shares and cannot be deleted' });
    }

    await prisma.folder.delete({
      where: { id },
    });

    logger.info(`Folder deleted: ${id} by user ${userId}`);
    res.status(204).send(); // No content for successful deletion
  } catch (err) {
    logger.error('deleteFolder failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

module.exports = { createFolder, getFolders, getFolderById, updateFolder, deleteFolder };