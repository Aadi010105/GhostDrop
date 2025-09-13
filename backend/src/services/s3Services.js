// Import the AWS SDK for JavaScript
// const AWS = require('aws-sdk'); // Old v2 import

const { S3Client, PutObjectCommand, GetObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  // For v3, signatureVersion is handled internally, no need to specify.
  // maxRetries can be configured in the client if needed, but it has different options in v3.
  // maxRetries: 3,
});

const BUCKET = process.env.AWS_S3_BUCKET;
// Default expiration time for pre-signed URLs in seconds (defaults to 15 minutes)
const DEFAULT_EXPIRES = parseInt(process.env.AWS_S3_PRESIGN_EXPIRES || '900', 10);


const getObjectKey = ({ userId, fileName, uuid }) => {
  // Sanitize the filename to remove characters that might be problematic in a URL or path
  const safeName = fileName.replace(/[^\w.-]/g, '_');
  return `uploads/${userId}/${uuid}-${safeName}`;
};


// Generates a pre-signed URL for a small, single-part file upload.
const presignPutObject = async ({ key, mimeType, expiresIn = DEFAULT_EXPIRES }) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
    // Access Control List: ensures the uploaded file is not publicly accessible
    ACL: 'private',
  });               //Function that takes your command and generates the secure, temporary URL !!!
  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return { url, key, expiresIn };
};

// Generates a pre-signed URL for downloading a file.
const getPresignedDownloadUrl = async ({ key, expiresIn = DEFAULT_EXPIRES }) => {
  const command = new GetObjectCommand({ //I want to download this specific file
    Bucket: BUCKET,
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return { url, key, expiresIn };
};

// --- Multipart Upload Helpers (for large files) ---


// Initiates a multipart upload, returning a unique ID for the session.

const createMultipart = async ({ key, mimeType }) => {
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
    ACL: 'private',
  });
  const res = await s3Client.send(command);
  // The UploadId is required for all subsequent multipart operations
  return { uploadId: res.UploadId };
};

/**
 * Generates a pre-signed URL for uploading one specific chunk (part) of a large file.
 * The client will request one of these for each part it needs to upload.
 */
const presignPart = async ({ key, uploadId, partNumber, expiresIn = DEFAULT_EXPIRES }) => {
  const command = new UploadPartCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return { partNumber, url, expiresIn };
};

/**
 * Finalizes a multipart upload after all parts have been uploaded successfully.
 * This tells S3 to assemble the uploaded parts into a single file.
 */
const completeMultipart = async ({ key, uploadId, parts }) => {
  // S3 requires the parts list to be sorted by PartNumber
  const sorted = parts.sort((a, b) => a.partNumber - b.partNumber);
  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    // Provide S3 with the list of parts and their ETags to assemble
    MultipartUpload: {
      Parts: sorted.map(p => ({ ETag: p.eTag, PartNumber: p.partNumber })),
    },
  });
  return s3Client.send(command);
};

/**
 * Cancels a multipart upload if it fails or is aborted by the user.
 * This cleans up any uploaded parts to avoid storage costs for incomplete files.
 */
const abortMultipart = async ({ key, uploadId }) => {
  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
    });
    await s3Client.send(command);
    console.log(`Aborted multipart upload: ${uploadId} for key: ${key}`);
  } catch (err) {
    console.error(`Failed to abort multipart upload ${uploadId}:`, err);
    // Re-throw the error so the calling function knows the abort failed
    throw err;
  }
};

// Export all the helper functions to be used in other parts of the application
module.exports = {
  getObjectKey,
  presignPutObject,
  getPresignedDownloadUrl,
  createMultipart,
  presignPart,
  completeMultipart,
  abortMultipart,
  // s3, // Old v2 s3 object no longer needed
};