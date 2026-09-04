const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Customer Registration Validation
const validateRegister = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors,
];

// Login Validation (common format check)
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Admin Creation Validation
const validateCreateAdmin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Admin email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  handleValidationErrors,
];

// Form Submission Creation Validation
const validateSubmissionCreate = [
  body('firstName').trim().notEmpty().withMessage('First name is required and cannot be empty'),
  body('lastName').trim().notEmpty().withMessage('Last name is required and cannot be empty'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .toUpperCase()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Gender must be one of: MALE, FEMALE, OTHER'),
  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Invalid mobile number format. Must contain 7-15 valid digits'),
  body('address').trim().notEmpty().withMessage('Address is required and cannot be empty'),
  body('feedback').optional().isString().trim(),
  handleValidationErrors,
];

// Form Submission Update Validation
const validateSubmissionUpdate = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty when provided'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty when provided'),
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('gender')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Gender must be one of: MALE, FEMALE, OTHER'),
  body('mobileNumber')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Invalid mobile number format. Must contain 7-15 valid digits'),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty when provided'),
  body('feedback').optional().isString().trim(),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateAdmin,
  validateSubmissionCreate,
  validateSubmissionUpdate,
};
