const express = require('express');
const router = express.Router();
const { createAdmin, getAllAdmins } = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { validateCreateAdmin } = require('../middleware/validate.middleware');

// All routes here require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

// Create new admin (auto-generates random password and returns it)
router.post('/create', validateCreateAdmin, createAdmin);

// Get list of existing admins
router.get('/list', getAllAdmins);

module.exports = router;
