const Joi = require('joi');

/**
 * A utility function to validate request data against a Joi schema.
 * @param {object} data - The data to validate (e.g., req.body, req.query, req.params).
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against.
 * @returns {object} - An object containing either the validated data or an error.
 */
const validate = (data, schema) => {
  const { error, value } = schema.validate(data, { abortEarly: false, allowUnknown: true });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.context.key,
      message: detail.message,
    }));
    return { errors };
  }

  return { value };
};

// --- Common Schemas (Examples) ---

const idSchema = Joi.string().uuid().required();

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// --- File Schemas (Examples for future routes) ---

const createFileSchema = Joi.object({
  fileName: Joi.string().min(1).max(255).required(),
  mimeType: Joi.string().required(),
  size: Joi.number().integer().min(0).required(),
  isEncrypted: Joi.boolean().default(true),
  encryptedKeyMetadata: Joi.string().optional(),
  folderId: Joi.string().uuid().optional().allow(null),
  expiry: Joi.date().iso().optional().allow(null),
});

const updateFileSchema = Joi.object({
  fileName: Joi.string().min(1).max(255).optional(),
  mimeType: Joi.string().optional(),
  size: Joi.number().integer().min(0).optional(),
  isEncrypted: Joi.boolean().optional(),
  encryptedKeyMetadata: Joi.string().optional(),
  folderId: Joi.string().uuid().optional().allow(null),
  expiry: Joi.date().iso().optional().allow(null),
}).min(1); // At least one field must be provided for update

// --- Authentication Schemas (Examples for future routes) ---

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  name: Joi.string().min(3).max(50).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// --- File Upload Flow Schemas ---
const presignSchema = Joi.object({
  fileName: Joi.string().min(1).max(255).required(),
  mimeType: Joi.string().min(1).required(),
  multipart: Joi.boolean().default(false),
  parts: Joi.number().integer().min(1).max(10000).when('multipart', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  expiresIn: Joi.number().integer().min(60).max(3600).optional(),
  folderId: Joi.string().uuid().optional().allow(null),
  expiry: Joi.date().iso().optional().allow(null),
  encryptedKeyMetadata: Joi.string().optional().allow(null),
});

const completeUploadSchema = Joi.object({
  s3Key: Joi.string().required(),
  multipart: Joi.boolean().default(false),
  uploadId: Joi.string().when('multipart', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  parts: Joi.array().items(
    Joi.object({
      partNumber: Joi.number().integer().min(1).required(),
      eTag: Joi.string().required(),
    })
  ).when('multipart', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  fileName: Joi.string().min(1).max(255).required(),
  mimeType: Joi.string().min(1).required(),
  size: Joi.number().integer().min(0).required(),
  encryptedKeyMetadata: Joi.string().optional().allow(null),
  folderId: Joi.string().uuid().optional().allow(null),
  expiry: Joi.date().iso().optional().allow(null),
});

const createFolderSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  parentId: Joi.string().uuid().optional().allow(null),
  workspaceId: Joi.string().uuid().optional().allow(null),
});

const updateFolderSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  parentId: Joi.string().uuid().optional().allow(null),
  workspaceId: Joi.string().uuid().optional().allow(null),
}).min(1); // At least one field must be provided for update

const createShareSchema = Joi.object({
  fileId: Joi.string().uuid().optional().allow(null),
  folderId: Joi.string().uuid().optional().allow(null),
  accessType: Joi.string().valid('OTP', 'EMAIL', 'QR', 'LINK', 'PASSWORD').default('LINK').required(),
  password: Joi.string().min(6).when('accessType', {
    is: 'PASSWORD',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).when('accessType', {
    is: 'OTP',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  expiry: Joi.date().iso().optional().allow(null),
  recipientEmail: Joi.string().email().optional().allow(null),
}).or('fileId', 'folderId'); // Must have either fileId or folderId

const getShareSchema = Joi.object({
  password: Joi.string().min(6).optional(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).optional(),
});

module.exports = {
  validate,
  idSchema,
  paginationSchema,
  createFileSchema,
  updateFileSchema,
  registerSchema,
  loginSchema,
  presignSchema,
  completeUploadSchema,
  createFolderSchema,
  updateFolderSchema,
  createShareSchema,
  getShareSchema,
};
