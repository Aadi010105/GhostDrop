const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const {
  getObjectKey,
  presignPutObject,
  createMultipart,
  presignPart,
  completeMultipart,
  abortMultipart,
  s3 // Add s3 here
} = require('../services/s3Services');
const { validate, presignSchema, completeUploadSchema } = require('../utils/validation');

const presign = async (req, res, next) => {
  try {
    const { value, errors } = validate(req.body, presignSchema);
    if (errors) return res.status(400).json({ errors });

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { fileName, mimeType, multipart, parts, expiresIn } = value;
    const uuid = uuidv4();
    const key = getObjectKey({ userId, fileName, uuid });

    if (!multipart) {
      const { url } = await presignPutObject({ key, mimeType, expiresIn });
      return res.json({
        uploadType: 'single',
        s3Key: key,
        url,
        expiresIn: expiresIn || undefined,
      });
    }

    const { uploadId } = await createMultipart({ key, mimeType });
    const partNumbers = Array.from({ length: parts }, (_, i) => i + 1);
    const presignedParts = await Promise.all(
      partNumbers.map(partNumber => presignPart({ key, uploadId, partNumber, expiresIn }))
    );

    return res.json({
      uploadType: 'multipart',
      s3Key: key,
      uploadId,
      parts: presignedParts,
    });
  } catch (err) {
    logger.error('presign failed: %s', err.message, { stack: err.stack });
    next(err);
  }
};

const complete = async (req, res, next) => {
  let aborted = false;
  try {
    const { value, errors } = validate(req.body, completeUploadSchema);
    if (errors) return res.status(400).json({ errors });

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      s3Key,
      multipart,
      uploadId,
      parts,
      fileName,
      mimeType,
      size,
      encryptedKeyMetadata,
      folderId,
      expiry,
    } = value;

    if (multipart) {
      try {
        await completeMultipart({ key: s3Key, uploadId, parts });
      } catch (err) {
        // If multipart fails, abort to clean up
        await abortMultipart({ key: s3Key, uploadId });
        aborted = true;
        throw new Error(`Multipart upload failed and aborted: ${err.message}`);
      }
    }

    const file = await prisma.file.create({
      data: {
        s3Key,
        fileName,
        mimeType,
        size: BigInt(size),
        isEncrypted: true,
        encryptedKeyMetadata: encryptedKeyMetadata || null,
        expiry: expiry || null,
        uploadStatus: 'COMPLETED',
        ownerId: userId,
        folderId: folderId || null,
      },
    });

    await prisma.activity.create({
      data: {
        type: 'FILE_UPLOADED',
        message: `File uploaded: ${fileName}`,
        userId,
        fileId: file.id,
        metadata: { size },
      },
    });

    return res.status(201).json({
      file: {
        ...file,
        size: file.size.toString(), // Convert BigInt to String for JSON serialization
      },
    });
  } catch (err) {
    logger.error('complete failed: %s', err.message, { stack: err.stack });
    if (!aborted && req.body.multipart && req.body.uploadId) {
      // Safety net: abort multipart if any unexpected error occurs
      try {
        await abortMultipart({ key: req.body.s3Key, uploadId: req.body.uploadId });
        logger.info('Multipart upload aborted due to unexpected error.');
      } catch (_) {}
    }
    next(err);
  }
};

// Controller to securely generate a temporary download link for a file.
const download = async (req, res, next) => {
    try {
      // Extract file ID from the URL (e.g., /files/:id/download).
      const { id } = req.params;

      const userId = req.auth?.userId;
  
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
      // 2. AUTHORIZATION: Find the file in the DB *and* verify the user owns it.
      const file = await prisma.file.findUnique({
        where: { id: id, ownerId: userId }, // Crucial security check!
      });
  
      // If no file is found (or user is not the owner), deny access.
      if (!file) {
        return res.status(404).json({ error: 'File not found or unauthorized' });
      }
  
      // 3. GENERATE LINK: Create a temporary, secure URL to the private S3 object.
      const downloadUrl = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWS_S3_BUCKET, // S3 bucket name.
        Key: file.s3Key, // unique file path in S3.
        Expires: 300, // Link valid for 300 sec (5 min).
        ResponseContentType: file.mimeType, // file type (e.g., 'image/jpeg').
        // This header tells the browser to prompt a "Save As..." download dialog.
        ResponseContentDisposition: `attachment; filename="${file.fileName}"`,
      });
  
      // 4. SEND RESPONSE: Send the temporary URL back to the client.
      return res.json({ downloadUrl });
  
    } catch (err) {
      // If anything above fails, log the error and pass it to an error handler.
      logger.error('download failed: %s', err.message, { stack: err.stack });
      next(err);
    }
  };
module.exports = { presign, complete, download };
