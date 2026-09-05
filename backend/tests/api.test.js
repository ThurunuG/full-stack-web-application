const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

let customerToken = '';
let customerRefreshToken = '';
let adminToken = '';
let adminRefreshToken = '';
let testSubmissionId = '';

// Prepare a clean database and seed the administrator used by protected-route tests.
beforeAll(async () => {
  // Clear any existing test records
  await prisma.submission.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed baseline Admin
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  await prisma.user.create({
    data: {
      email: 'admin@evotec.software',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });
});

afterAll(async () => {
  // Close Prisma so the test process can exit cleanly.
  await prisma.$disconnect();
});

// Verify that the API is running before exercising application features.
describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 OK and health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// Cover registration, role-specific login, and token refresh behavior.
describe('2. Authentication & Authorization Flow', () => {
  it('POST /api/auth/register should fail on validation error (short password)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      password: '123',
      confirmPassword: '123',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register should fail when passwords do not match', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register should successfully register a customer', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.body.user.role).toBe('CUSTOMER');
    expect(res.body.user.password).toBeUndefined();
  });

  it('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/customer/login should login valid customer and return JWT access and refresh tokens', async () => {
    const res = await request(app).post('/api/auth/customer/login').send({
      email: 'john@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.role).toBe('CUSTOMER');

    customerToken = res.body.accessToken;
    customerRefreshToken = res.body.refreshToken;
  });

  it('POST /api/auth/customer/login should reject an ADMIN user from customer login', async () => {
    const res = await request(app).post('/api/auth/customer/login').send({
      email: 'admin@evotec.software',
      password: 'Admin@12345',
    });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/admin/login should login valid admin and return tokens', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({
      email: 'admin@evotec.software',
      password: 'Admin@12345',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');

    adminToken = res.body.accessToken;
    adminRefreshToken = res.body.refreshToken;
  });

  it('POST /api/auth/admin/login should reject a CUSTOMER user from admin login', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({
      email: 'john@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/refresh-token should generate a new access token', async () => {
    const res = await request(app).post('/api/auth/refresh-token').send({
      refreshToken: customerRefreshToken,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });
});

// Ensure only authenticated administrators can create other administrators.
describe('3. Admin Creation (Protected Route)', () => {
  it('POST /api/admin/create should be rejected without auth token', async () => {
    const res = await request(app).post('/api/admin/create').send({
      email: 'subadmin@evotec.software',
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/admin/create should be rejected with CUSTOMER token (RBAC check)', async () => {
    const res = await request(app)
      .post('/api/admin/create')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        email: 'subadmin@evotec.software',
      });
    expect(res.statusCode).toBe(403);
  });

  it('POST /api/admin/create should succeed with ADMIN token and return auto-generated password', async () => {
    const res = await request(app)
      .post('/api/admin/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'subadmin@evotec.software',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.admin.email).toBe('subadmin@evotec.software');
    expect(res.body.admin.role).toBe('ADMIN');
    expect(res.body.autoGeneratedPassword).toBeDefined();
    expect(res.body.autoGeneratedPassword.length).toBeGreaterThanOrEqual(8);
  });
});

// Validate customer access, request validation, creation, and duplicate handling.
describe('4. Form Submission (Customer Protected Route)', () => {
  it('POST /api/submissions should fail without token', async () => {
    const res = await request(app).post('/api/submissions').send({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.sub@example.com',
      gender: 'FEMALE',
      mobileNumber: '+1 555-010-2233',
      address: '123 Main St',
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/submissions should fail if requested by ADMIN (Customer only route)', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.sub@example.com',
        gender: 'FEMALE',
        mobileNumber: '+1 555-010-2233',
        address: '123 Main St',
      });
    expect(res.statusCode).toBe(403);
  });

  it('POST /api/submissions should fail on invalid fields', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        firstName: '',
        lastName: '',
        email: 'not-an-email',
        gender: 'UNKNOWN_GENDER',
        mobileNumber: '123',
        address: '',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/submissions should create submission and store audit userCreated/dateCreated', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice.wonderland@example.com',
        gender: 'FEMALE',
        mobileNumber: '+1 555-987-6543',
        address: '100 Rabbit Hole Lane, Oxford',
        feedback: 'Wonderful application experience!',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.submission.id).toBeDefined();
    expect(res.body.submission.userCreated).toBe('john@example.com');
    expect(res.body.submission.dateCreated).toBeDefined();

    testSubmissionId = res.body.submission.id;
  });

  it('POST /api/submissions should enforce unique email per submission', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        firstName: 'Another',
        lastName: 'Person',
        email: 'alice.wonderland@example.com', // Duplicate
        gender: 'MALE',
        mobileNumber: '+1 555-111-2233',
        address: '200 Another Street',
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/submissions/my should return customer submissions', async () => {
    const res = await request(app)
      .get('/api/submissions/my')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.submissions.length).toBe(1);
    expect(res.body.submissions[0].email).toBe('alice.wonderland@example.com');
  });
});

// Exercise administrator listing, filtering, searching, updating, and deletion.
describe('5. Admin Dashboard CRUD, Filtering, and Search', () => {
  beforeAll(async () => {
    // Add a second submission with MALE gender to test filtering and search.
    await prisma.submission.create({
      data: {
        firstName: 'Robert',
        lastName: 'Baratheon',
        email: 'robert.b@example.com',
        gender: 'MALE',
        mobileNumber: '+1 555-444-5555',
        address: 'Storms End Castle',
        feedback: 'Needs more boar hunting.',
        userCreated: 'john@example.com',
        dateCreated: new Date(),
      },
    });
  });

  it('GET /api/submissions should retrieve all submissions for admin', async () => {
    const res = await request(app)
      .get('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submissions.length).toBe(2);
    expect(res.body.stats.total).toBe(2);
    expect(res.body.stats.female).toBe(1);
    expect(res.body.stats.male).toBe(1);
  });

  it('GET /api/submissions?gender=MALE should filter by gender', async () => {
    const res = await request(app)
      .get('/api/submissions?gender=MALE')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.submissions.length).toBe(1);
    expect(res.body.submissions[0].firstName).toBe('Robert');
  });

  it('GET /api/submissions?search=alice should search case-insensitively by name', async () => {
    const res = await request(app)
      .get('/api/submissions?search=alice')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.submissions.length).toBe(1);
    expect(res.body.submissions[0].firstName).toBe('Alice');
  });

  it('PUT /api/submissions/:id should update submission and store userModified/dateModified', async () => {
    const res = await request(app)
      .put(`/api/submissions/${testSubmissionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Alice (Updated)',
        address: 'Updated Address 999',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submission.firstName).toBe('Alice (Updated)');
    expect(res.body.submission.address).toBe('Updated Address 999');
    expect(res.body.submission.userModified).toBe('admin@evotec.software');
    expect(res.body.submission.dateModified).toBeDefined();
  });

  it('DELETE /api/submissions/:id should delete a submission', async () => {
    const res = await request(app)
      .delete(`/api/submissions/${testSubmissionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const checkRes = await request(app)
      .get('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(checkRes.body.submissions.find((s) => s.id === testSubmissionId)).toBeUndefined();
  });
});
