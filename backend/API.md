# LimitBeyond API Documentation

## Authentication Endpoints

### 1. User Registration

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "role": "MEMBER"
}
```

**Response:**

```json
{
  "message": "User registered successfully"
}
```

### 2. User Login

```http
POST /api/auth/signin
```

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Management Endpoints

### 1. Get Current User Profile

```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "123",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "roles": ["MEMBER"],
  "active": true
}
```

### 2. Get All Trainers (Admin Only)

```http
GET /api/users/trainers
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": "456",
    "username": "trainer1",
    "email": "trainer1@example.com",
    "firstName": "Trainer",
    "lastName": "One",
    "roles": ["TRAINER"],
    "active": true,
    "assignedMembers": ["123", "789"]
  }
]
```

### 3. Get All Members (Admin/Trainer)

```http
GET /api/users/members
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": "123",
    "username": "member1",
    "email": "member1@example.com",
    "firstName": "Member",
    "lastName": "One",
    "roles": ["MEMBER"],
    "active": true,
    "assignedTrainer": "456"
  }
]
```

### 4. Activate User (Admin Only)

```http
PUT /api/users/{userId}/activate
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "User activated successfully"
}
```

### 5. Assign Trainer to Member (Admin Only)

```http
PUT /api/users/member/{memberId}/assign-trainer
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "trainerId": "456"
}
```

**Response:**

```json
{
  "message": "Trainer assigned successfully"
}
```

## Feedback Endpoints

### 1. Create Feedback (Member Only)

```http
POST /api/feedback
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "title": "Gym Equipment Feedback",
  "content": "The treadmill in zone 2 needs maintenance."
}
```

**Response:**

```json
{
  "message": "Feedback submitted successfully"
}
```

### 2. Get Feedback

```http
GET /api/feedback
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": "789",
    "memberId": "123",
    "title": "Gym Equipment Feedback",
    "content": "The treadmill in zone 2 needs maintenance.",
    "createdAt": "2024-03-15T10:30:00",
    "responses": [
      {
        "responderId": "456",
        "content": "Thank you for reporting. We'll fix it today.",
        "responseTime": "2024-03-15T11:00:00"
      }
    ]
  }
]
```

### 3. Respond to Feedback (Admin/Trainer)

```http
POST /api/feedback/{feedbackId}/respond
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "content": "Thank you for reporting. We'll fix it today."
}
```

**Response:**

```json
{
  "message": "Response added successfully"
}
```

## Diet Chat Endpoints

### 1. Create Diet Chat (Member Only)

```http
POST /api/diet-chat
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "title": "Diet Plan Discussion",
  "initialQuery": "I need help with my protein intake calculation."
}
```

**Response:**

```json
{
  "message": "Diet chat created successfully"
}
```

### 2. Get Diet Chats

```http
GET /api/diet-chat
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": "101",
    "memberId": "123",
    "title": "Diet Plan Discussion",
    "initialQuery": "I need help with my protein intake calculation.",
    "createdAt": "2024-03-15T14:00:00",
    "messages": [
      {
        "senderId": "123",
        "content": "I need help with my protein intake calculation.",
        "timestamp": "2024-03-15T14:00:00",
        "senderRole": "MEMBER"
      },
      {
        "senderId": "456",
        "content": "Sure, let's calculate based on your weight and activity level.",
        "timestamp": "2024-03-15T14:15:00",
        "senderRole": "TRAINER"
      }
    ]
  }
]
```

### 3. Reply to Diet Chat (Admin/Trainer)

```http
POST /api/diet-chat/{chatId}/reply
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "content": "Sure, let's calculate based on your weight and activity level."
}
```

**Response:**

```json
{
  "message": "Reply added successfully"
}
```

## Workouts Endpoints

All endpoints require Authorization header:

```
Authorization: Bearer {token}
```

### 1. Get All Workouts for Current User

```http
GET /api/workouts
```

**Response:**

```json
[
  {
    "id": "60c72b2f5c8r9e0012345690",
    "member": {
      "id": "60c72b2f5c8r9e0012345678",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "date": "2023-06-12",
    "dayOfWeek": "MONDAY",
    "name": "Chest & Triceps",
    "targetMuscleGroups": [
      { "id": "60c72b2f5c8r9e0012345679", "name": "Chest" },
      { "id": "60c72b2f5c8r9e0012345684", "name": "Triceps" }
    ],
    "exercises": [
      {
        "id": "60c72b2f5c8r9e0012345683",
        "exerciseTemplate": {
          "id": "60c72b2f5c8r9e0012345683",
          "name": "Bench Press"
        },
        "sets": [
          { "reps": 12, "weight": 60.0 },
          { "reps": 10, "weight": 70.0 }
        ],
        "totalVolume": 1320.0
      }
    ],
    "sets": [
      {
        "id": "60c72b2f5c8r9e0012345691",
        "exercise": { "id": "60c72b2f5c8r9e0012345683", "name": "Bench Press" },
        "reps": 12,
        "weight": 60.0,
        "completed": false
      }
    ],
    "notes": "Feeling good today",
    "scheduledDate": "2023-06-12T00:00:00",
    "completed": false
  }
]
```

### 2. Get Workout by ID

```http
GET /api/workouts/{workoutId}
```

**Response:**

```json
{
  "id": "60c72b2f5c8r9e0012345690",
  "member": {
    "id": "60c72b2f5c8r9e0012345678",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "date": "2023-06-12",
  "dayOfWeek": "MONDAY",
  "name": "Chest & Triceps",
  "targetMuscleGroups": [
    { "id": "60c72b2f5c8r9e0012345679", "name": "Chest" },
    { "id": "60c72b2f5c8r9e0012345684", "name": "Triceps" }
  ],
  "exercises": [
    {
      "id": "60c72b2f5c8r9e0012345683",
      "exerciseTemplate": {
        "id": "60c72b2f5c8r9e0012345683",
        "name": "Bench Press"
      },
      "sets": [
        { "reps": 12, "weight": 60.0 },
        { "reps": 10, "weight": 70.0 },
        { "reps": 8, "weight": 80.0 }
      ],
      "totalVolume": 1720.0
    }
  ],
  "sets": [
    {
      "id": "60c72b2f5c8r9e0012345691",
      "exercise": { "id": "60c72b2f5c8r9e0012345683", "name": "Bench Press" },
      "reps": 12,
      "weight": 60.0,
      "completed": false
    }
  ],
  "notes": "Feeling good today"
}
```

### 3. Get Workouts by Date Range

```http
GET /api/workouts/by-date-range?startDate=2023-06-01&endDate=2023-06-30
```

**Response:** Array of workouts within the date range.

### 4. Get Workouts by Muscle Group

```http
GET /api/workouts/by-muscle-group/{muscleGroupId}
```

**Response:** Array of workouts that target the specified muscle group.

### 5. Create a New Workout

```http
POST /api/workouts
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Back & Biceps",
  "date": "2023-06-14",
  "targetMuscleGroupIds": [
    "60c72b2f5c8r9e0012345680",
    "60c72b2f5c8r9e0012345686"
  ],
  "notes": "Focus on form"
}
```

**Response:**

```json
{
  "id": "60c72b2f5c8r9e0012345692",
  "member": {
    "id": "60c72b2f5c8r9e0012345678",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "date": "2023-06-14",
  "dayOfWeek": "WEDNESDAY",
  "name": "Back & Biceps",
  "targetMuscleGroups": [
    { "id": "60c72b2f5c8r9e0012345680", "name": "Back" },
    { "id": "60c72b2f5c8r9e0012345686", "name": "Biceps" }
  ],
  "exercises": [],
  "notes": "Focus on form"
}
```

### 6. Update a Workout

```http
PUT /api/workouts/{workoutId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Back & Biceps",
  "date": "2023-06-15",
  "targetMuscleGroupIds": [
    "60c72b2f5c8r9e0012345680",
    "60c72b2f5c8r9e0012345686"
  ],
  "notes": "Moved to Thursday due to schedule change"
}
```

**Response:** Updated workout JSON.

### 7. Delete a Workout

```http
DELETE /api/workouts/{workoutId}
```

**Response:**

```
200 OK
```

### 8. Add Exercise to a Workout

```http
POST /api/workouts/{workoutId}/exercises
Content-Type: application/json
```

**Request Body:**

```json
{
  "exerciseTemplateId": "60c72b2f5c8r9e0012345687",
  "sets": [
    { "reps": 15, "weight": 15.0 },
    { "reps": 12, "weight": 17.5 },
    { "reps": 10, "weight": 20.0 }
  ]
}
```

**Response:** Updated workout JSON including the added sets.

### 9. Update Exercise in a Workout

```http
PUT /api/workouts/{workoutId}/exercises/{exerciseTemplateId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "sets": [
    { "reps": 15, "weight": 15.0 },
    { "reps": 12, "weight": 17.5 },
    { "reps": 10, "weight": 20.0 },
    { "reps": 8, "weight": 22.5 }
  ]
}
```

**Response:** Updated workout JSON with the new sets for that exercise.

### 10. Remove Exercise from a Workout

```http
DELETE /api/workouts/{workoutId}/exercises/{exerciseTemplateId}
```

**Response:**

```
200 OK
```

### 11. Copy a Workout to a New Date

```http
POST /api/workouts/{workoutId}/copy?newDate=2023-06-19
```

**Response:** New workout JSON with the same exercises and details but with the new date.

### 12. Complete a Set in a Workout

```http
POST /api/workouts/{workoutId}/sets/{setId}/complete
```

**Response:** Updated workout JSON with the set marked completed.

### 13. Complete an Entire Workout

```http
POST /api/workouts/{workoutId}/complete
```

**Response:** Updated workout JSON with all sets marked completed and workout completed.

### Complete a Set

**POST** `/api/workouts/{workoutId}/sets/{setId}/complete`

Marks a specific set as completed within a workout.

**Response:**

```json
{
  "id": "workout123",
  "name": "Push Day",
  "description": "Chest, shoulders, triceps",
  "scheduledDate": "2024-01-15T10:00:00",
  "completed": false,
  "sets": [
    {
      "id": "set456",
      "exercise": {
        "id": "ex789",
        "name": "Bench Press",
        "description": "Flat bench press"
      },
      "reps": 8,
      "weight": 80.0,
      "completed": true,
      "notes": "Good form"
    }
  ]
}
```

### Uncomplete a Set

**POST** `/api/workouts/{workoutId}/sets/{setId}/uncomplete`

Marks a specific set as not completed within a workout.

**Response:**

```json
{
  "id": "workout123",
  "name": "Push Day",
  "description": "Chest, shoulders, triceps",
  "scheduledDate": "2024-01-15T10:00:00",
  "completed": false,
  "sets": [
    {
      "id": "set456",
      "exercise": {
        "id": "ex789",
        "name": "Bench Press",
        "description": "Flat bench press"
      },
      "reps": 8,
      "weight": 80.0,
      "completed": false,
      "notes": "Good form"
    }
  ]
}
```

## General Notes

1. All requests requiring authentication must include the JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

2. Error Responses follow this format:

```json
{
  "message": "Error message description"
}
```

3. HTTP Status Codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
