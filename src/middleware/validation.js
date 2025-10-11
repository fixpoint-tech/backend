import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for creating a user
 */
export const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),

  handleValidationErrors
];

/**
 * Validation rules for updating a user
 */
export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),

  // Don't allow these fields to be updated
  body('email').not().exists().withMessage('Email cannot be updated'),
  body('role').not().exists().withMessage('Role cannot be updated'),
  body('isActive').not().exists().withMessage('isActive cannot be updated'),

  handleValidationErrors
];

/**
 * Validation for user ID parameter
 */
export const validateUserId = [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),

  handleValidationErrors
];
