const express = require('express');
const router = express.Router();

// Import authentication controller handlers for each endpoint.
const {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  refreshToken,
} = require('../controllers/auth.controller');

// Import request validation middleware for registration and login payloads.
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validate.middleware');

// Register a new customer after validating the request body.
router.post('/register', validateRegister, registerCustomer);

// Authenticate a customer and issue authentication tokens.
router.post('/customer/login', validateLogin, loginCustomer);

// Authenticate an administrator and issue authentication tokens.
router.post('/admin/login', validateLogin, loginAdmin);

// Exchange a valid refresh token for a new access token.
router.post('/refresh-token', refreshToken);

module.exports = router;
