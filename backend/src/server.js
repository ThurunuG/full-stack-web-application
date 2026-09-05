const app = require('./app');

// Use the configured port, or default to port 5000 for local development.
const PORT = process.env.PORT || 5000;

// Start the backend server and log the available endpoints.
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
