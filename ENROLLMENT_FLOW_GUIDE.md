# EduSphere Access Code Enrollment - Complete Flow Guide

## Overview
This document explains the complete enrollment flow with access codes and the fixes applied to support it end-to-end.

---

## Frontend Flow (edu-site)

### Step 1: User Navigates to Course
- User clicks **Enroll** button on a course card
- Navigates to: `/courses/{SLUG}?unlock=true`
- Example: `/courses/full-stack-python?unlock=true`

### Step 2: Fetch Course Details
```typescript
// app/courses/[slug]/page.tsx
courseAPI.getBySlug(slug)
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 3,
      "title": "Full Stack Python",
      "slug": "full-stack-python",
      "description": "...",
      "instructor_name": "John Doe",
      "instructor_email": "john@example.com",
      "duration": 2800,
      "level": "beginner",
      "is_published": true,
      "thumbnail": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

**⚠️ If this fails:**
- Error message: "Backend service is unavailable. Please contact support for enrollment."
- Root cause: `course?.id` is undefined

### Step 3: Access Code Modal Shows
- `setShowAccessPrompt(true)` triggered by `?unlock=true` parameter
- User enters access code (e.g., `2T3HLLD9R1`)
- User clicks **Submit Code**

### Step 4: Submit Access Code
```typescript
// app/courses/[slug]/page.tsx - handleAccessSubmit()
enrollmentAPI.enroll(course.id, accessCode)
```

**Payload:**
```json
POST /api/enrollments/3
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "access_code": "2T3HLLD9R1"
}
```

### Step 5: Success Response
```json
{
  "success": true,
  "message": "Successfully enrolled in course"
}
```

---

## Backend Flow (edu-site-backend)

### Route Stack

```
POST /api/enrollments/:courseId
  ↓
middleware/auth.js (authenticate)
  ↓
middleware/validation.js (validate access_code: 6-16 chars, alphanumeric)
  ↓
controllers/enrollmentController.js::enrollInCourse
```

### Controller Logic: `enrollInCourse`

1. **Resolve Course** (supports both ID and slug)
   ```javascript
   const course = await resolveCourseFromParam(courseId);
   // If courseId is "3" → fetch by ID
   // If courseId is "full-stack-python" → fetch by slug
   ```

2. **Fetch User**
   ```javascript
   const user = await User.findById(req.user.id);
   ```

3. **Validate User Access Code**
   ```javascript
   if (!user.access_code) {
     // Error: No code assigned
   }
   if (accessCode !== user.access_code) {
     // Error: Invalid code
   }
   ```

4. **Check if Already Enrolled**
   ```javascript
   const isEnrolled = await Enrollment.isEnrolled(userId, courseId);
   ```

5. **Create Enrollment**
   ```javascript
   await Enrollment.create(userId, normalizedCourseId);
   ```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  access_code VARCHAR(16) UNIQUE NOT NULL,  -- ← Each user has 1 unique code
  role ENUM('student','instructor','admin'),
  is_active BOOLEAN,
  ...
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  ...
);
```

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  
  UNIQUE KEY unique_enrollment (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

---

## Changes Made to Fix Access Code Enrollment

### ✅ Fix #1: Course Detail Route (courseController.js)
**Issue:** Route only accepted slug, failed if numeric ID passed  
**Fix:** Added fallback to resolve by ID if slug lookup fails
```javascript
let course = await Course.getBySlug(slug);
if (!course && /^\d+$/.test(slug)) {
  course = await Course.getById(Number(slug));
  if (course && !course.is_published) course = null;
}
```
**Commit:** 222a854

### ✅ Fix #2: Enrollment Routes (enrollmentController.js)
**Issue:** Enrollment endpoints only accepted numeric courseId, failed if slug passed  
**Fix:** Created `resolveCourseFromParam()` helper to normalize both slug and ID across all enrollment endpoints
```javascript
const resolveCourseFromParam = async (courseParam) => {
  if (/^\d+$/.test(String(courseParam))) {
    return Course.findById(Number(courseParam));
  }
  return Course.getBySlug(courseParam);
};
```
**Applied to:**
- `enrollInCourse` - POST /api/enrollments/:courseId
- `getCourseEnrollments` - GET /api/enrollments/course/:courseId  
- `updateProgress` - PUT /api/enrollments/:courseId/progress
- `unenrollFromCourse` - DELETE /api/enrollments/:courseId

**Commit:** d331844

### ✅ Fix #3: CORS Configuration (server.js)
**Issue:** CORS blocking requests from frontend during development/production  
**Fix:** Improved CORS with explicit origin validator function
```javascript
const allowedOrigins = [
  'https://eduspherecourses.in',
  'https://www.eduspherecourses.in',
  'http://localhost:3000',
  'http://localhost:5173'
];

cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204
});
```
**Commit:** 873857d

---

## Testing Checklist

### 1. Course Fetching
```bash
# Test by slug (public, no auth required)
curl -X GET http://localhost:5000/api/courses/full-stack-python

# Response should include id field
{
  "success": true,
  "data": {
    "course": {
      "id": 3,  # ← Must be present
      "slug": "full-stack-python",
      ...
    }
  }
}
```

### 2. Course by ID (backward compatible)
```bash
curl -X GET http://localhost:5000/api/courses/3

# Should also work and return same course
```

### 3. Enrollment with Access Code
```bash
# First, login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'

# Response: { "data": { "token": "eyJhbG..." } }

# Then enroll with access code
curl -X POST http://localhost:5000/api/enrollments/3 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "access_code": "2T3HLLD9R1"
  }'

# Success response
{
  "success": true,
  "message": "Successfully enrolled in course"
}
```

### 4. Enrollment by Slug (backward compatible)
```bash
curl -X POST http://localhost:5000/api/enrollments/full-stack-python \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "access_code": "2T3HLLD9R1"
  }'

# Should also work
```

---

## Frontend Integration Verification

### Frontend API Calls
1. **Get Course by Slug**
   ```typescript
   // app/lib/api.ts
   getBySlug: (slug: string) => api.get(`/courses/${slug}`)
   ```
   ✅ Works: Route accepts slug ✓

2. **Enroll with Access Code**
   ```typescript
   // app/lib/api.ts
   enroll: (courseId: number, accessCode?: string) => 
     api.post(`/enrollments/${courseId}`, { access_code: accessCode })
   ```
   ✅ Works: Receives numeric courseId from course.id ✓

3. **Get Course Presentations**
   ```typescript
   getPresentations: (courseId: number) => 
     api.get(`/courses/${courseId}/presentations`)
   ```
   ✅ Works: Uses numeric ID ✓

---

## Troubleshooting

### Issue: "Backend service is unavailable. Please contact support for enrollment."
**Cause:** `course.id` is undefined after fetching course by slug  
**Solution:**
1. Check course exists in database: `SELECT * FROM courses WHERE slug='full-stack-python' AND is_published=true;`
2. Check `/api/courses/full-stack-python` returns a response with `id` field
3. Check CORS error in browser console - might need to add your origin to `allowedOrigins`

### Issue: "Invalid access code"
**Cause:** Access code doesn't match user's assigned code  
**Solution:**
1. Verify user has an access_code: `SELECT email, access_code FROM users WHERE email='user@example.com';`
2. Verify codes are matching (case-insensitive in backend)
3. Check user is marked as active: `is_active = true`

### Issue: "You are already enrolled in this course"
**Cause:** User already has an enrollment record  
**Solution:** Either:
- Unenroll first: `DELETE FROM enrollments WHERE user_id=X AND course_id=Y;`
- Or just reload the page - they already have access

### Issue: CORS error in browser console
**Cause:** Frontend origin not in `allowedOrigins` list  
**Solution:** Add your frontend domain to `server.js`:
```javascript
const allowedOrigins = [
  'your-frontend-domain.com',  // ← Add here
  ...
];
```

---

## API Endpoint Reference

| Method | Endpoint | Auth | Body | Success Response |
|--------|----------|------|------|---|
| GET | `/api/courses` | No | - | `{ success, data: { courses: [...] } }` |
| GET | `/api/courses/:slug` | No | - | `{ success, data: { course: {..., id} } }` |
| GET | `/api/courses/:id/presentations` | Yes | - | `{ success, data: { presentations } }` |
| POST | `/api/enrollments/:courseId` | Yes | `{ access_code }` | `{ success, message }` |
| GET | `/api/enrollments/my/enrollments` | Yes | - | `{ success, data: { enrollments } }` |
| PUT | `/api/enrollments/:courseId/progress` | Yes | `{ progress }` | `{ success, message }` |

---

## Summary

The access code enrollment flow now works end-to-end with:
1. ✅ Frontend fetches course by slug → gets numeric ID
2. ✅ Frontend sends enrollment with ID + access code
3. ✅ Backend resolves ID/slug to actual course
4. ✅ Backend validates user's access code matches
5. ✅ Backend creates enrollment record
6. ✅ CORS allows requests from frontend origin
7. ✅ All responses properly formatted for frontend consumption

**Latest commits:**
- 222a854: Fix course lookup to support numeric IDs on slug route
- d331844: Support slug or ID for enrollment course param
- 873857d: Improve CORS configuration with explicit origin validator
