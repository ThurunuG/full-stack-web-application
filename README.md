# Full-Stack Web Application (Auth, RBAC & Submissions Management)

A full-stack web application designed with a secure and scalable architecture, featuring JWT-based authentication, role-based access control (RBAC), server-side data validation, and audit logging. The application enables customers to submit and manage forms while providing administrators with a comprehensive dashboard for CRUD operations, live search, gender-based filtering, and user management. Built with a focus on security, maintainability, responsive UI, and clean API design.

---

## 🚀 Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Customer Registration**:
  - Validates email format, unique email, minimum 4-character password, and password confirmation.
  - Passwords are salt-hashed using `bcryptjs` (10 rounds).
  - Automatically assigns the `CUSTOMER` role.
- **Customer Login**:
  - Strict role guard: only accounts with `CUSTOMER` role can log in through the customer portal.
  - Returns a JWT **Access Token** (15m expiry) and a JWT **Refresh Token** (7d expiry).
- **Admin Login**:
  - Separate login portal with role enforcement (`ADMIN` only).
  - Customers attempting to log in here are rejected with a clear 403 Forbidden message.
- **Admin Creation (Protected)**:
  - Accessible only by authenticated administrators.
  - Auto-generates a strong random password for the new admin and returns it in the response for one-time sharing.
  - Ensures admin emails are unique.
- **Token Refresh**:
  - Automatic silent refresh via Axios response interceptors upon token expiration.

### 2. Form Submission (Customer Protected Route)
- Authenticated customers can submit details with fields:
  - `firstName` (String, required, non-empty)
  - `lastName` (String, required, non-empty)
  - `email` (String, required, valid format, unique per submission)
  - `gender` (Enum: `MALE`, `FEMALE`, `OTHER`, required)
  - `mobileNumber` (String, required, validated against phone formats)
  - `address` (String, required, non-empty)
  - `feedback` (String, optional)
- All fields validated server-side using `express-validator`.
- Audit tracking: Automatically records `userCreated` (email of creator) and `dateCreated` (timestamp).
- Customer portal includes a personal submission history card.

### 3. Admin Dashboard (Admin Protected Routes)
- **KPI Metrics**: Real-time counts for Total, Male, Female, and Other submissions.
- **Filter by Gender**: Instant filtering by `MALE`, `FEMALE`, or `OTHER`.
- **Search by Name**: Case-insensitive partial matching across first name, last name, or email.
- **Update Submission**:
  - Edit any field with validation.
  - Audit tracking: Automatically records `userModified` (email of modifier) and `dateModified` (timestamp).
- **Delete Submission**: Safe deletion with a confirmation dialog.
- **Admin Provisioning**: Modal to create new admin users and copy generated passwords.

---

## 🛠 Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide React icons, Axios, React Router DOM v6.
- **Backend**: Node.js, Express.js, CORS, bcryptjs, jsonwebtoken, express-validator.
- **Database & ORM**: SQLite with Prisma ORM (`@prisma/client` + `prisma`).
- **Testing**: Jest, Supertest.
- **API Tooling**: Postman collection (`postman_collection.json`).

---

## 📋 Pre-Seeded Evaluation Credentials

The database is pre-seeded with ready-to-test accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| **Super Admin** | `admin@evotec.software` | `Admin@12345` | Admin Dashboard (`/admin/dashboard`), Admin Creation |
| **Customer** | `customer@example.com` | `Customer@123` | Application Form (`/apply`), My Submissions |

---

## ⚙️ Setup & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; verified with v22.18.0)
- npm (v9 or higher; verified with 10.9.3)

### Quick Start (Automated)

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd fullstack-assignment
   ```

2. **Run One-Step Setup**:
   ```bash
   npm run setup
   ```
   *(This installs dependencies for both frontend and backend, sets up the SQLite database schema via Prisma, and seeds the initial admin and sample data).*

3. **Start Development Servers (Concurrently)**:
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
   - **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Manual Step-by-Step Setup

If you prefer to run backend and frontend separately:

#### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
Backend runs on port `5000`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on port `5173`.

---

## 🧪 Running Automated Tests

Run backend unit and integration tests using Jest and Supertest:

```bash
npm test
# Or from backend directory:
cd backend && npm test
```

Test coverage includes:
- Customer registration validation and duplicate rejection.
- Role enforcement: Customer login rejecting admins; Admin login rejecting customers.
- Token refresh mechanics.
- RBAC protection on admin routes.
- Form submissions validation, email uniqueness, and audit field creation (`userCreated`, `dateCreated`).
- Admin submission retrieval, gender filtering, name search, update auditing (`userModified`, `dateModified`), and deletion.

---

## 🔑 Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="super-secret-access-token-key-2026"
JWT_REFRESH_SECRET="super-secret-refresh-token-key-2026"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
CORS_ORIGIN="http://localhost:5173"
```

A template is also provided at `backend/.env.example`.

---

## 📚 API Endpoint Documentation

Base URL: `http://localhost:5000/api`

### Authentication (`/api/auth`)

#### 1. Register Customer
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Customer@123",
    "confirmPassword": "Customer@123"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "Customer registered successfully. You can now log in.",
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "role": "CUSTOMER",
      "createdAt": "2026-09-04T10:00:00.000Z"
    }
  }
  ```

#### 2. Customer Login
- **Endpoint**: `POST /auth/customer/login`
- **Access**: Public (Customer accounts only)
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Customer@123"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "customer@example.com", "role": "CUSTOMER" }
  }
  ```

#### 3. Admin Login
- **Endpoint**: `POST /auth/admin/login`
- **Access**: Public (Admin accounts only)
- **Request Body**:
  ```json
  {
    "email": "admin@evotec.software",
    "password": "Admin@12345"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Admin login successful.",
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "admin@evotec.software", "role": "ADMIN" }
  }
  ```

#### 4. Refresh Token
- **Endpoint**: `POST /auth/refresh-token`
- **Access**: Public
- **Request Body**:
  ```json
  { "refreshToken": "eyJhbGciOi..." }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "admin@evotec.software", "role": "ADMIN" }
  }
  ```

---

### Form Submissions (`/api/submissions`)

#### 1. Submit Application
- **Endpoint**: `POST /submissions`
- **Access**: Protected (`CUSTOMER` role only)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "gender": "MALE",
    "mobileNumber": "+1 555-019-2831",
    "address": "123 Main Street, Suite 200",
    "feedback": "Looking forward to hearing from your team."
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "Application form submitted successfully.",
    "submission": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "gender": "MALE",
      "mobileNumber": "+1 555-019-2831",
      "address": "123 Main Street, Suite 200",
      "feedback": "Looking forward to hearing from your team.",
      "userCreated": "customer@example.com",
      "dateCreated": "2026-09-04T10:30:00.000Z",
      "userModified": null,
      "dateModified": null
    }
  }
  ```

#### 2. Get My Submissions
- **Endpoint**: `GET /submissions/my`
- **Access**: Protected (`CUSTOMER` role only)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response** `200 OK`: Returns array of submissions created by the authenticated customer.

---

### Admin Operations (`/api/admin` & `/api/submissions`)

#### 1. Create New Admin (Protected)
- **Endpoint**: `POST /admin/create`
- **Access**: Protected (`ADMIN` role only)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  { "email": "new.admin@evotec.software" }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "New admin account created successfully.",
    "admin": {
      "id": "uuid",
      "email": "new.admin@evotec.software",
      "role": "ADMIN",
      "createdAt": "2026-09-04T10:45:00.000Z"
    },
    "autoGeneratedPassword": "qP9#mK2$xL8!"
  }
  ```

#### 2. List Admins
- **Endpoint**: `GET /admin/list`
- **Access**: Protected (`ADMIN` role only)

#### 3. Get All Submissions (with Gender Filter and Name Search)
- **Endpoint**: `GET /submissions?gender=MALE&search=John`
- **Access**: Protected (`ADMIN` role only)
- **Query Parameters**:
  - `gender` *(optional)*: `MALE`, `FEMALE`, or `OTHER`
  - `search` *(optional)*: Case-insensitive partial search on `firstName`, `lastName`, or `email`
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "submissions": [ /* array of submission objects */ ],
    "stats": {
      "total": 5,
      "male": 2,
      "female": 2,
      "other": 1
    }
  }
  ```

#### 4. Update Submission
- **Endpoint**: `PUT /submissions/:id`
- **Access**: Protected (`ADMIN` role only)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**: Any submission field to update.
- **Audit Response**: Updates `userModified` to the admin's email and `dateModified` to the current timestamp.

#### 5. Delete Submission
- **Endpoint**: `DELETE /submissions/:id`
- **Access**: Protected (`ADMIN` role only)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Submission deleted successfully."
  }
  ```

---

## 📮 Postman Collection

A complete, ready-to-import Postman Collection file is included at [`postman_collection.json`](./postman_collection.json).
It includes environment variables for `baseUrl`, `customerToken`, `adminToken`, and `submissionId`, with test scripts that automatically capture tokens upon login for smooth testing.

---

## 📄 Submission

- **GitHub Repository**: https://github.com/ThurunuG/full-stack-web-application
- **Submission Email**: `contact@evotec.software`
