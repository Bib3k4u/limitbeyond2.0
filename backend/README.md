# LimitBeyond - Gym Management System

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

2. For development, you can use the default values:

```env
MONGODB_URI=mongodb://localhost:27017/limitbeyond
JWT_SECRET=5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
```

## Running the Application

### Backend (Spring Boot)

1. Make sure you have Java 17 or later installed
2. Navigate to the root directory
3. Run: `./mvnw spring-boot:run`

### Frontend (React)

1. Navigate to `frontend/limitbeyond-ui-module-one-main`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## Features

### Admin Dashboard

- User Management (Members & Trainers)
- Profile Management
- Diet Chat System
- Feedback System

### Trainer Features

- Member Management
- Diet Chat Responses
- Feedback Responses

### Member Features

- Diet Chat with Trainers
- Feedback Submission
- Profile Management

## API Endpoints

### Authentication

- POST `/api/auth/signin` - Sign in
- POST `/api/auth/signup` - Sign up

### Users

- GET `/api/users/me` - Get current user
- GET `/api/users/trainers` - Get all trainers (Admin only)
- GET `/api/users/members` - Get all members (Admin/Trainer)
- PUT `/api/users/{userId}/activate` - Activate user (Admin only)
- PUT `/api/users/{userId}/deactivate` - Deactivate user (Admin only)
- PUT `/api/users/member/{memberId}/assign-trainer` - Assign trainer to member (Admin only)

### Diet Chat

- GET `/api/diet-chat` - Get diet chats
- POST `/api/diet-chat` - Create diet chat (Member only)
- POST `/api/diet-chat/{chatId}/reply` - Reply to diet chat (Admin/Trainer)

### Feedback

- GET `/api/feedback` - Get feedback
- POST `/api/feedback` - Create feedback (Member only)
- POST `/api/feedback/{feedbackId}/respond` - Respond to feedback (Admin/Trainer)

## Error Handling

The application includes comprehensive error handling:

- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Security

- JWT-based authentication
- Role-based access control
- Secure password storage with BCrypt
- CORS configuration for security

## Troubleshooting

### Common Issues

1. MongoDB Connection Error

   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check MongoDB logs

2. Authentication Issues

   - Clear browser cache and cookies
   - Check if JWT token is present
   - Verify user is active in the system

3. CORS Issues
   - Check if frontend URL is in allowed origins
   - Verify CORS headers in network tab
   - Check browser console for CORS errors
