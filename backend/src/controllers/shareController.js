//----------------------------------------------------------------------------------------------------------------------------
// req.params: For identifying specific resources within the URL path (e.g., /products/456). 
// req.query: For adding filter criteria or optional parameters to the URL (e.g., /products?color=blue&sort=asc). 
// req.body: For sending larger, often sensitive or structured, data from the client to the server, typically in POST or PUT requests. 
//----------------------------------------------------------------------------------------------------------------------------

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { validate, createShareSchema, getShareSchema } = require('../utils/validation');
const bcrypt = require('bcrypt');

const createShare = async (req, res, next) => {
  try {
    const { value, errors } = validate(req.body, createShareSchema);
    if (errors) return res.status(400).json({ errors });

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { fileId, folderId, accessType, password, otp, expiry, recipientEmail } = value;

    if (!fileId && !folderId) {
      return res.status(400).json({ error: 'Either fileId or folderId must be provided' });
    }
    if (fileId && folderId) {
      return res.status(400).json({ error: 'Cannot share both a file and a folder in one request' });
    } 

    // Block ensures that a user cannot create a share link for a file or folder that they do not own.
    if (fileId) {
      const file = await prisma.file.findUnique({ where: { id: fileId } });
      if (!file || file.ownerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to share this file' });
      }
    } else if (folderId) {
      const folder = await prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder || folder.ownerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to share this folder' });
      }
    }

// This block securely hashes the password using bcrypt's one-way algorithm.
// It automatically generates a unique "salt" (random data) for each password.
// This salting ensures two identical passwords result in different final hashes.
// The `saltRounds` (e.g., 10) makes the process intentionally slow to resist attacks.
// `await` is used because this is a computationally intensive, asynchronous operation.
    const saltRounds = 5; 

    let hashedPassword = null;
    if (password) {
      // Use the constant defined above.
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    let hashedOtp = null;
    if (otp) {
      // Use the same constant here as well.
      hashedOtp = await bcrypt.hash(otp, saltRounds);
    }


    const shareToken = require('crypto').randomBytes(16).toString('hex'); // Generate a random token

    const share = await prisma.share.create({
      data: {
        fileId,
        folderId,
        creatorId: userId,
        shareToken,
        accessType,
        password: hashedPassword,
        otp: hashedOtp,
        expiry,
        recipientEmail,
      },
    });

    logger.info(`Share created: ${share.id} for user ${userId}`);
    res.status(201).json(share);
  } catch (err) {
    logger.error('createShare failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

const getShareDetails = async (req, res, next) => {
  try {
    const { shareToken } = req.params;
    const { value, errors } = validate(req.query, getShareSchema); // For OTP or password validation
    if (errors) return res.status(400).json({ errors });

    const share = await prisma.share.findUnique({
      where: { shareToken },
      include: {
        file: { select: { id: true, fileName: true, mimeType: true, size: true, s3Key: true, isEncrypted: true, encryptedKeyMetadata: true } },
        folder: { select: { id: true, name: true, ownerId: true } },
        creator: { select: { id: true, email: true } },
      },
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check expiry
    if (share.expiry && new Date(share.expiry) < new Date()) {
      return res.status(410).json({ error: 'Share link expired' });
    }

    // Check password/OTP if required
    if (share.accessType === 'PASSWORD' && share.password) {
      if (!value.password || !(await bcrypt.compare(value.password, share.password))) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else if (share.accessType === 'OTP' && share.otp) {
      if (!value.otp || !(await bcrypt.compare(value.otp, share.otp))) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
    }

    // Convert BigInt to String for JSON serialization if file data is included
    if (share.file && typeof share.file.size === 'bigint') {
      share.file.size = share.file.size.toString();
    }

    res.json(share);
  } catch (err) {
    logger.error('getShareDetails failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

const revokeShare = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify user is the creator of the share
    const existingShare = await prisma.share.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existingShare || existingShare.creatorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to revoke this share' });
    }

    await prisma.share.delete({
      where: { id },
    });

    logger.info(`Share revoked: ${id} by user ${userId}`);
    res.status(204).send();
  } catch (err) {
    logger.error('revokeShare failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

module.exports = { createShare, getShareDetails, revokeShare };
