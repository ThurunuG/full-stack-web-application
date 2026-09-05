const express = require('express');
const router = express.Router();
const { createAdmin, getAllAdmins } = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { validateCreateAdmin } = require('../middleware/validate.middleware');

// Apply authentication and authorization to every admin route.
router.use(authenticateToken, requireRole('ADMIN'));

// Create a new admin with a generated password.
router.post('/create', validateCreateAdmin, createAdmin);

// Return all existing administrator accounts.
router.get('/list', getAllAdmins);

module.exports = router;
