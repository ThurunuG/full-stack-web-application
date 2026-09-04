const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  refreshToken,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validate.middleware');

// Customer registration
router.post('/register', validateRegister, registerCustomer);

// Customer login
router.post('/customer/login', validateLogin, loginCustomer);

// Admin login
router.post('/admin/login', validateLogin, loginAdmin);

// Refresh token
router.post('/refresh-token', refreshToken);

module.exports = router;
