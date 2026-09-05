// Import the Prisma client constructor.
const { PrismaClient } = require('@prisma/client');

// Create a shared Prisma client instance for database access.
const prisma = new PrismaClient();

// Export the client for use throughout the application.
module.exports = prisma;
