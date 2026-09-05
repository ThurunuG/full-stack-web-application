const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Create a Prisma client for database operations during seeding.
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Remove existing records so the seed can be run repeatedly.
  await prisma.submission.deleteMany({});
  await prisma.user.deleteMany({});

  // Store only hashed passwords for the seeded accounts.
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  // Create the administrator account.
  const admin = await prisma.user.create({
    data: {
      email: 'admin@evotec.software',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('Created Admin:', admin.email);

  // Create a sample customer account for the submissions below.
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });
  console.log('Created Customer:', customer.email);

  // Prepare sample feedback submissions with dates spread across recent days.
  const submissions = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      gender: 'FEMALE',
      mobileNumber: '+1 555-019-2831',
      address: '742 Evergreen Terrace, Springfield, OR',
      feedback: 'The onboarding was extremely intuitive and straightforward.',
      userCreated: customer.email,
      dateCreated: new Date(Date.now() - 3 * 86400000),
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      gender: 'MALE',
      mobileNumber: '+1 555-014-9921',
      address: '221B Baker Street, London, NW1 6XE',
      feedback: 'Looking forward to integrating this system with our internal CRM.',
      userCreated: customer.email,
      dateCreated: new Date(Date.now() - 2 * 86400000),
    },
    {
      firstName: 'Morgan',
      lastName: 'Taylor',
      email: 'morgan.taylor@example.com',
      gender: 'OTHER',
      mobileNumber: '+1 555-018-7744',
      address: '42 Wallaby Way, Sydney, NSW 2000',
      feedback: 'Clean API design and responsive feedback forms.',
      userCreated: customer.email,
      dateCreated: new Date(Date.now() - 1 * 86400000),
    },
    {
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      gender: 'MALE',
      mobileNumber: '+1 555-012-3456',
      address: '10 Downing St, Westminster, London',
      feedback: 'Great response time from the support team.',
      userCreated: customer.email,
      dateCreated: new Date(),
    },
    {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@example.com',
      gender: 'FEMALE',
      mobileNumber: '+1 555-017-8899',
      address: '350 5th Ave, New York, NY 10118',
      feedback: 'The multi-role access control works seamlessly.',
      userCreated: customer.email,
      dateCreated: new Date(),
    },
  ];

  // Insert each submission into the database.
  for (const sub of submissions) {
    await prisma.submission.create({ data: sub });
  }

  console.log(`Successfully seeded ${submissions.length} sample submissions.`);
}

main()
  .catch((e) => {
    // Log the error and return a failure exit code if seeding fails.
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Always close the database connection when seeding is complete.
    await prisma.$disconnect();
  });
