const express = require('express');
const router = express.Router();

// Import handlers for creating, reading, updating, and deleting submissions.
const {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  updateSubmission,
  deleteSubmission,
} = require('../controllers/submission.controller');

// Authentication verifies the token, while role authorization restricts access.
const {
  authenticateToken,
  requireRole,
} = require('../middleware/auth.middleware');

// Validate request bodies before passing them to the controllers.
const {
  validateSubmissionCreate,
  validateSubmissionUpdate,
} = require('../middleware/validate.middleware');

// --- Customer Protected Routes ---
// Submit a new application form
router.post(
  '/',
  authenticateToken,
  requireRole('CUSTOMER'),
  validateSubmissionCreate,
  createSubmission
);

// View submissions created by the logged-in customer
router.get(
  '/my',
  authenticateToken,
  requireRole('CUSTOMER'),
  getMySubmissions
);

// --- Admin Protected Routes ---
// Retrieve all submissions with optional gender filter and name search
router.get(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  getAllSubmissions
);

// Update any field of a submission
router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  validateSubmissionUpdate,
  updateSubmission
);

// Delete a submission by its ID
router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  deleteSubmission
);

module.exports = router;
