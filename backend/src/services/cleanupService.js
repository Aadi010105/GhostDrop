import { PrismaClient, DeletionStatus } from '@prisma/client'; // Import DeletionStatus enum
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
const { logger } = require('../utils/logger'); 


const prisma = new PrismaClient();
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BATCH_SIZE = 100; // Number of files to delete in one S3 operation
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

const SOFT_DELETE_RETENTION_MINUTES = parseInt(process.env.SOFT_DELETE_RETENTION_MINUTES || '10');

async function deleteS3Objects(keys) {
  if (keys.length === 0) return { deleted: [], errors: [] };

  const deleteParams = {
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
      Quiet: true, // Tell S3 not to return deleted objects in the response
    },
  };

  try {
    const command = new DeleteObjectsCommand(deleteParams);
    const data = await s3.send(command);
    // S3 DeleteObjectsCommand only returns errors if any, otherwise an empty array for Deleted
    // We assume success if no errors are reported by S3
    if (data.Errors && data.Errors.length > 0) {
      logger.error('S3 deleteObjects encountered errors: %o', data.Errors);
      return { deleted: [], errors: data.Errors.map(err => err.Key) };
    }
    logger.info('Successfully sent delete command to S3 for %d objects.', keys.length);
    return { deleted: keys, errors: [] };
  } catch (error) {
    logger.error('Error deleting S3 objects: %s', error.message, { stack: error.stack, keys });
    return { deleted: [], errors: keys };
  }
}

async function logDeletionActivity(file, reason, status, error = null) {
  try {
    await prisma.deletionActivity.create({
      data: {
        fileId: file.id,
        userId: file.ownerId || null, // Assuming file has ownerId
        s3Key: file.s3Key,
        fileName: file.fileName,
        reason,
        status,
        error: error ? error.message : null,
      },
    });
  } catch (logError) {
    logger.error('Failed to log deletion activity for file %s: %s', file.s3Key, logError.message);
  }
}


async function softDeleteExpiredFiles() {
  logger.info('Starting Stage 1: Marking expired files for soft deletion...');
  const now = new Date();
  let filesProcessed = 0;

  try {
    while (true) {
      // Find files that have expired and are not yet soft-deleted
      const expiredFiles = await prisma.file.findMany({
        where: {
          expiry: {
            lt: now, // Files whose expiry is less than now
          },
          deletedAt: null, // Only process files not yet soft-deleted
        },
        take: BATCH_SIZE,
        orderBy: {
          id: 'asc' // Order by ID to help with consistent batching and potential for "SELECT ... FOR UPDATE" if needed
        }
      });

      if (expiredFiles.length === 0) {
        logger.info('No more expired files found for soft deletion. Stage 1 finished.');
        break;
      }

      logger.info('Found %d expired files to soft-delete.', expiredFiles.length);

      for (const file of expiredFiles) {
        try {
          // Use transaction for atomicity if needed, or rely on `deletedAt: null` where clause for race condition safety
          await prisma.file.update({
            where: { id: file.id, deletedAt: null }, // Ensure we only update if not already soft-deleted
            data: { deletedAt: now },
          });
          await logDeletionActivity(file, 'expired', DeletionStatus.SUCCESS_SOFT_DELETE);
          logger.info('Soft-deleted file record: %s (s3Key: %s)', file.fileName, file.s3Key);
          filesProcessed++;
        } catch (dbError) {
          if (dbError.code === 'P2025') { // Prisma's "Record not found" error, implies another process might have updated it
            logger.warn('File %s already soft-deleted by another process, skipping.', file.s3Key);
          } else {
            logger.error('Error marking file %s as soft-deleted: %s', file.s3Key, dbError.message);
            await logDeletionActivity(file, 'expired', DeletionStatus.FAILED_DB, dbError);
          }
        }
      }
    }
  } catch (outerError) {
    logger.error('Error in softDeleteExpiredFiles stage: %s', outerError.message, { stack: outerError.stack });
    // This top-level catch logs unexpected errors that are not per-file DB update issues
  }
  return { softDeletedCount: filesProcessed };
}

/**
 * Stage 2: Identifies soft-deleted files that have passed their retention period and performs hard deletion from S3 and DB.
 */
async function hardDeleteSoftDeletedFiles() {
  logger.info('Starting Stage 2: Hard deleting files past retention period...');
  const now = new Date();
  let filesProcessed = 0;

  // Calculate the cutoff date for hard deletion based on SOFT_DELETE_RETENTION_MINUTES
  const hardDeleteCutoff = new Date(now.getTime() - SOFT_DELETE_RETENTION_MINUTES * 60 * 1000);

  try {
    while (true) {
      // Find files that were soft-deleted before the cutoff period
      const filesToHardDelete = await prisma.file.findMany({
        where: {
          deletedAt: {
            lt: hardDeleteCutoff, // Files soft-deleted before the cutoff
            not: null, // Ensure it was actually soft-deleted
          },
        },
        take: BATCH_SIZE,
        orderBy: {
          id: 'asc' // Order by ID for consistent batching
        }
      });

      if (filesToHardDelete.length === 0) {
        logger.info('No more files found for hard deletion. Stage 2 finished.');
        break;
      }

      logger.info('Found %d soft-deleted files to hard-delete.', filesToHardDelete.length);

      const s3KeysToAttemptDelete = filesToHardDelete.map(file => file.s3Key);
      let s3DeletionResult = { deleted: [], errors: s3KeysToAttemptDelete }; // Initialize for retry loop

      // --- S3 Deletion with Retry Logic ---
      for (let i = 0; i < RETRY_ATTEMPTS; i++) {
        s3DeletionResult = await deleteS3Objects(s3DeletionResult.errors);
        if (s3DeletionResult.errors.length === 0) {
          break; // All S3 deletions successful
        }
        logger.warn('S3 hard deletion retry %d/%d for %d objects. Retrying in %dms...',
          i + 1, RETRY_ATTEMPTS, s3DeletionResult.errors.length, RETRY_DELAY_MS);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      const s3SuccessfullyDeletedKeys = new Set(s3DeletionResult.deleted);

      // --- Database Cleanup and Logging ---
      for (const file of filesToHardDelete) {
        if (s3SuccessfullyDeletedKeys.has(file.s3Key)) {
          // SUCCESS PATH: S3 object deleted, now permanently remove from DB.
          try {
            await prisma.file.delete({ where: { id: file.id } });
            await logDeletionActivity(file, 'hard_delete', DeletionStatus.SUCCESS_HARD_DELETE);
            logger.info('Hard deleted file record from DB and logged: %s (s3Key: %s)', file.fileName, file.s3Key);
            filesProcessed++;
          } catch (dbError) {
            logger.error('Error hard deleting DB record for file %s: %s', file.s3Key, dbError.message);
            await logDeletionActivity(file, 'hard_delete', DeletionStatus.FAILED_DB, dbError);
          }
        } else {
          // FAILURE PATH: S3 object could not be deleted after all retries.
          logger.warn('S3 hard deletion failed for %s. Skipping DB deletion and logging as failed.', file.s3Key);
          await logDeletionActivity(file, 'hard_delete', DeletionStatus.FAILED_S3, new Error('S3 deletion failed after retries'));
        }
      }
    }
  } catch (outerError) {
    logger.error('Error in hardDeleteSoftDeletedFiles stage: %s', outerError.message, { stack: outerError.stack });
  }
  return { hardDeletedCount: filesProcessed };
}


/**
 * Main cleanup service function to be called by the cron job or manually.
 */
export async function runCleanup() {
  logger.info('Starting full cleanup service run...');
  let softDeletedCount = 0;
  let hardDeletedCount = 0;

  try {
    const softDeleteResult = await softDeleteExpiredFiles();
    softDeletedCount = softDeleteResult.softDeletedCount;
  } catch (error) {
    logger.error('Unhandled error during soft delete stage of cleanup: %s', error.message, { stack: error.stack });
  }

  try {
    const hardDeleteResult = await hardDeleteSoftDeletedFiles();
    hardDeletedCount = hardDeleteResult.hardDeletedCount;
  } catch (error) {
    logger.error('Unhandled error during hard delete stage of cleanup: %s', error.message, { stack: error.stack });
  }

  logger.info('Full cleanup service finished. Soft-deleted: %d, Hard-deleted: %d',
    softDeletedCount, hardDeletedCount);
  return {
    message: 'Cleanup service executed',
    softDeleted: softDeletedCount,
    hardDeleted: hardDeletedCount,
  };
}