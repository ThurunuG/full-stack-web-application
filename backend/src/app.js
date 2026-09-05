// Load environment variables before initializing the application.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const submissionRoutes = require('./routes/submission.routes');

const app = express();

// Configure cross-origin requests and parse incoming request bodies.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Provide a simple endpoint for service availability checks.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend API is operating normally.',
    timestamp: new Date().toISOString(),
  });
});

// Mount the application's API route groups.
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);

// Handle requests that do not match any registered route.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Handle unexpected errors from routes and middleware centrally.
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
