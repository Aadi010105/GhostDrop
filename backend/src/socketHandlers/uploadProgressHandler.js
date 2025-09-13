const logger = require('../utils/logger');

/**
 * Handles all real-time events for a single connected user (e.g., Alex).
 * This function is registered for every user who connects.
 */
module.exports = (io, socket) => {
  // Listen for 'uploadProgress' event from a client (e.g., Alex's browser).
  socket.on('uploadProgress', (data) => {
    const { workspaceId, fileName, progress, uploaderId } = data;

    if (!workspaceId || progress === undefined) {
      logger.warn(`[Socket] Invalid upload progress data: ${JSON.stringify(data)}`);
      return; // Stop if data is bad.
    }

    // Log for debugging, e.g., "Progress from Alex in Project Dragon: 42%..."
    logger.info(
      `[Socket] Progress from user ${uploaderId} in workspace ${workspaceId}: ${progress}% for ${fileName}`
    );

    // Broadcast a *new* event 'progressUpdate' to a specific room.
    // NOTE: socket.to(room) sends to everyone in the room EXCEPT the original sender.
    // So, this goes to Ben and Chloe, but not back to Alex.
    socket.to(workspaceId).emit('progressUpdate', {
      fileName,
      progress,
      uploaderId,
    });
  });

  // Listen for when a user wants to join a workspace room.
  // This is how we group Alex, Ben, and Chloe together.
  socket.on('joinWorkspace', (workspaceId) => {
    // This command subscribes the user's socket to the given room name.
    socket.join(workspaceId);
    logger.info(`[Socket] User ${socket.id} joined workspace: ${workspaceId}`);
  });

  // Built-in event that fires when a user closes the tab or loses connection.
  socket.on('disconnect', () => {
    logger.info(`[Socket] User disconnected: ${socket.id}`);
  });
};