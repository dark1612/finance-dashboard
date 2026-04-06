# Finance Dashboard Backend

A RESTful backend for a role-based finance dashboard system built with **Node.js**, **Express**, and **MongoDB**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Roles & Permissions](#roles--permissions)
- [API Reference](#api-reference)
- [Design Decisions & Assumptions](#design-decisions--assumptions)

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js                             |
| Framework    | Express.js                          |
| Database     | MongoDB via Mongoose                |
| Auth         | JWT (jsonwebtoken) + bcryptjs       |
| Validation   | express-validator                   |
| Logging      | morgan                              |

---

## Project Structure

```
src/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── auth.controller.js     # Register, login, me
│   ├── user.controller.js     # User management (admin)
│   ├── record.controller.js   # Financial records CRUD
│   └── dashboard.controller.js# Analytics & summaries
├── middleware/
│   ├── auth.middleware.js     # JWT protect + role authorize
│   └── error.middleware.js    # Global error handler + asyncHandler
├── models/
│   ├── user.model.js          # User schema with roles
│   └── record.model.js        # Financial record schema
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── record.routes.js
│   └── dashboard.routes.js
├── utils/
│   └── token.js               # JWT generation helper
├── app.js                     # Express app setup
└── server.js                  # Entry point
```

---

## Setup & Installation

### Prerequisites
- Node.js >= 16
- MongoDB running locally or a MongoDB Atlas URI

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd finance-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET

# 4. Start the server
npm run dev       # development (requires nodemon)
npm start         # production
```

Server runs at `http://localhost:5000` by default.

---

## Environment Variables

| Variable        | Description                            | Example                              |
|-----------------|----------------------------------------|--------------------------------------|
| `PORT`          | Server port                            | `5000`                               |
| `MONGO_URI`     | MongoDB connection string              | `mongodb://localhost:27017/finance`  |
| `JWT_SECRET`    | Secret key for signing JWTs            | `a_long_random_secret_string`        |
| `JWT_EXPIRES_IN`| Token expiry duration                  | `7d`                                 |
| `NODE_ENV`      | Environment (`development`/`production`)| `development`                       |

---

## Roles & Permissions

| Action                        | viewer | analyst | admin |
|-------------------------------|:------:|:-------:|:-----:|
| View financial records        | ✅     | ✅      | ✅    |
| View recent activity          | ✅     | ✅      | ✅    |
| View dashboard summary        | ❌     | ✅      | ✅    |
| View category breakdown       | ❌     | ✅      | ✅    |
| View monthly trends           | ❌     | ✅      | ✅    |
| Create / update / delete records | ❌  | ❌      | ✅    |
| Manage users (roles, status)  | ❌     | ❌      | ✅    |

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /api/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "Yash",
  "email": "yash@example.com",
  "password": "secret123",
  "role": "admin"
}
```
> `role` is optional, defaults to `"viewer"`.

**Response `201`:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Yash", "email": "...", "role": "admin" }
}
```

---

#### `POST /api/auth/login`
Authenticate and receive a JWT.

**Body:**
```json
{ "email": "yash@example.com", "password": "secret123" }
```

**Response `200`:**
```json
{ "success": true, "token": "<jwt>", "user": { ... } }
```

---

#### `GET /api/auth/me`  🔒
Returns the currently authenticated user.

---

### Users  🔒 Admin only

| Method   | Endpoint               | Description            |
|----------|------------------------|------------------------|
| `GET`    | `/api/users`           | List all users         |
| `GET`    | `/api/users/:id`       | Get user by ID         |
| `PATCH`  | `/api/users/:id/role`  | Update user role       |
| `PATCH`  | `/api/users/:id/status`| Activate/deactivate    |
| `DELETE` | `/api/users/:id`       | Delete a user          |

**PATCH `/api/users/:id/role` body:**
```json
{ "role": "analyst" }
```

**PATCH `/api/users/:id/status` body:**
```json
{ "isActive": false }
```

---

### Financial Records  🔒

| Method   | Endpoint          | Roles allowed          | Description              |
|----------|-------------------|------------------------|--------------------------|
| `GET`    | `/api/records`    | viewer, analyst, admin | List records (paginated) |
| `GET`    | `/api/records/:id`| viewer, analyst, admin | Get single record        |
| `POST`   | `/api/records`    | admin                  | Create record            |
| `PUT`    | `/api/records/:id`| admin                  | Update record            |
| `DELETE` | `/api/records/:id`| admin                  | Soft-delete record       |

#### Filtering & Pagination (GET `/api/records`)

| Query param | Type   | Description                             |
|-------------|--------|-----------------------------------------|
| `type`      | string | `income` or `expense`                   |
| `category`  | string | e.g. `salary`, `food`, `transport`, ... |
| `startDate` | ISO8601| e.g. `2024-01-01`                       |
| `endDate`   | ISO8601| e.g. `2024-12-31`                       |
| `page`      | number | Page number (default: `1`)              |
| `limit`     | number | Results per page (default: `10`)        |

**Example:** `GET /api/records?type=expense&category=food&page=2&limit=5`

#### Valid Categories
`salary` · `investment` · `freelance` · `food` · `transport` · `utilities` · `entertainment` · `healthcare` · `education` · `other`

#### POST/PUT body:
```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-06-15",
  "notes": "June paycheck"
}
```

---

### Dashboard  🔒

| Method | Endpoint                        | Roles            | Description               |
|--------|---------------------------------|------------------|---------------------------|
| `GET`  | `/api/dashboard/summary`        | analyst, admin   | Total income/expense/net  |
| `GET`  | `/api/dashboard/by-category`    | analyst, admin   | Totals grouped by category|
| `GET`  | `/api/dashboard/monthly-trends` | analyst, admin   | Month-by-month breakdown  |
| `GET`  | `/api/dashboard/recent`         | viewer, analyst, admin | Last N records       |

#### `GET /api/dashboard/summary`
```json
{
  "success": true,
  "summary": {
    "totalIncome": 50000,
    "totalExpenses": 23000,
    "netBalance": 27000,
    "incomeCount": 10,
    "expenseCount": 18
  }
}
```

#### `GET /api/dashboard/by-category?type=expense`
Returns totals per category, optionally filtered by type.

#### `GET /api/dashboard/monthly-trends?year=2024`
```json
{
  "success": true,
  "year": 2024,
  "trends": [
    { "month": 1, "income": 10000, "expense": 4500 },
    { "month": 2, "income": 9500,  "expense": 3200 }
  ]
}
```

#### `GET /api/dashboard/recent?limit=5`
Returns the most recently created records.

---

## Design Decisions & Assumptions

### Soft Delete
Records are never permanently deleted — an `isDeleted` flag is set to `true`. A Mongoose pre-query hook automatically excludes soft-deleted records from all `find` queries, so no changes are needed in controllers.

### Password Security
Passwords are hashed with `bcryptjs` (12 salt rounds) before persistence. The `password` field has `select: false` on the schema, so it is never returned in API responses unless explicitly requested (login uses `.select("+password")`).

### Role Hierarchy
Three roles are supported: `viewer < analyst < admin`. Rather than a numeric hierarchy, permissions are explicitly declared per route using the `authorize(...roles)` middleware. This makes access rules easy to read and modify per endpoint.

### Validation
All write endpoints use `express-validator` to validate input before it reaches the controller. Mongoose schema-level validation serves as a secondary guard. Both layers produce clear, actionable error messages.

### Error Handling
A central `errorHandler` middleware normalizes all errors — including Mongoose validation errors, duplicate key errors, and bad ObjectId casts — into a consistent JSON response shape. An `asyncHandler` wrapper eliminates repetitive try/catch blocks in every controller.

### Pagination
All list endpoints support `page` and `limit` query params. Responses include `total`, `page`, and `pages` so a frontend can render pagination controls without extra requests.

### Assumptions
- A user's role is set at registration and can only be changed by an admin afterwards.
- The `createdBy` field on records is set server-side from the authenticated user's token — it cannot be spoofed via the request body.
- There is no email verification flow; any valid email is accepted at registration.
- Deleted users' records are retained in the database (records reference `createdBy` by ObjectId).
