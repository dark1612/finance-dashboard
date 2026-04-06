# Finance Dashboard Backend

A RESTful backend for a **role-based finance dashboard system** built using **Node.js**, **Express**, and **MongoDB**.

This project demonstrates backend architecture, role-based access control, financial data processing, and dashboard analytics.

---

## 🚀 Quick Start (For Evaluators)

```bash
npm install
npm run dev
```

Server runs at:
http://localhost:5000

👉 Test APIs using:
api-test.http

---

## 🧪 API Testing (NO POSTMAN REQUIRED)

All APIs can be tested using the file:

👉 **api-test.http**

### How to use:

1. Install VS Code extension → **REST Client**
2. Open `api-test.http`
3. Click **Send Request**
4. Copy token from login → replace `YOUR_TOKEN_HERE`

---

## 🛠 Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Runtime    | Node.js            |
| Framework  | Express.js         |
| Database   | MongoDB (Mongoose) |
| Auth       | JWT + bcryptjs     |
| Validation | express-validator  |
| Logging    | morgan             |

---

## 📁 Project Structure

```
src/
├── config/
│   └── db.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── record.controller.js
│   └── dashboard.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── models/
│   ├── user.model.js
│   └── record.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── record.routes.js
│   └── dashboard.routes.js
├── utils/
│   └── token.js
├── app.js
└── server.js
```

---

## 🔐 Roles & Permissions

| Action                       | viewer | analyst | admin |
| ---------------------------- | :----: | :-----: | :---: |
| View records                 |    ✅   |    ✅    |   ✅   |
| View dashboard               |    ❌   |    ✅    |   ✅   |
| Create/update/delete records |    ❌   |    ❌    |   ✅   |
| Manage users                 |    ❌   |    ❌    |   ✅   |

---

## 📌 API Overview

### Auth

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/me

### Users (Admin)

* Manage roles & status

### Records

* CRUD operations
* Filtering + pagination

### Dashboard

* Summary
* Category breakdown
* Monthly trends
* Recent activity

---

## 🔑 Environment Variables

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## ⚙️ Key Features

* Role-based access control (RBAC)
* Secure authentication using JWT
* Password hashing using bcrypt
* Financial records CRUD operations
* Dashboard analytics APIs
* Input validation (express-validator)
* Centralized error handling
* Pagination and filtering support

---

## 🧠 Design Highlights

* Clean architecture (controllers, routes, middleware separation)
* RBAC implemented using middleware
* Soft delete support for records
* Validation at multiple layers
* Async error handling wrapper

---

## 📌 Assumptions

* Roles: viewer < analyst < admin
* Records are linked to authenticated users
* No email verification (simplified)
* Deleted records are soft-deleted

---

## 🧪 Sample API Requests

### Register

```
POST http://localhost:5000/api/auth/register
```

```json
{
  "name": "Yash",
  "email": "yash@example.com",
  "password": "secret123",
  "role": "admin"
}
```

---

### Login

```
POST http://localhost:5000/api/auth/login
```

```json
{
  "email": "yash@example.com",
  "password": "secret123"
}
```

---

### Protected Route Example

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ Submission Coverage

This project satisfies all required backend features:

* User and role management
* Financial records management
* Dashboard summary APIs
* Role-based access control
* Validation and error handling
* MongoDB data persistence

---

## 👨‍💻 Author

**Yash Raj**
