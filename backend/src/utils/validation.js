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

module.exports = {
  validate,
  idSchema,
  paginationSchema,
  createFileSchema,
  updateFileSchema,
  registerSchema,
  loginSchema,
};
