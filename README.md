# EduSphere Backend API

A robust Node.js + Express + MySQL backend for the EduSphere Learning Management System.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based authorization (Student, Instructor, Admin)
- 🎓 Course management
- 📊 Presentations and recordings
- 📈 Enrollment tracking with progress
- 🛡️ Protected routes
- ✅ Input validation
- 🔒 Secure password hashing

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd edusphere_site_backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edusphere_lms

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

## Database Setup

The database and tables will be automatically created when you start the server for the first time. Make sure MySQL is running and the credentials in `.env` are correct.

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Presentations
- `GET /api/presentations/course/:courseId` - Get course presentations (requires enrollment)
- `POST /api/presentations` - Create presentation (instructor/admin)
- `PUT /api/presentations/:id` - Update presentation (instructor/admin)
- `DELETE /api/presentations/:id` - Delete presentation (instructor/admin)

### Recordings
- `GET /api/recordings/course/:courseId` - Get course recordings (requires enrollment)
- `POST /api/recordings` - Create recording (instructor/admin)
- `PUT /api/recordings/:id` - Update recording (instructor/admin)
- `DELETE /api/recordings/:id` - Delete recording (instructor/admin)

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course (protected)
- `GET /api/enrollments/my/enrollments` - Get user enrollments (protected)
- `PUT /api/enrollments/:courseId/progress` - Update progress (protected)
- `DELETE /api/enrollments/:courseId` - Unenroll from course (protected)
- `GET /api/enrollments/course/:courseId` - Get course enrollments (instructor/admin)

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
edusphere_site_backend/
├── config/
│   ├── database.js          # Database connection
│   └── db.schema.sql        # Database schema
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── presentationController.js
│   ├── recordingController.js
│   └── enrollmentController.js
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Presentation.js
│   ├── Recording.js
│   └── Enrollment.js
├── routes/
│   ├── auth.js
│   ├── courses.js
│   ├── presentations.js
│   ├── recordings.js
│   └── enrollments.js
├── utils/
│   ├── jwt.js               # JWT utilities
│   └── password.js          # Password utilities
├── .env.example
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

## License

ISC
