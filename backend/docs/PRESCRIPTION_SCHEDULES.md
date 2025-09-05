# Prescription Schedules API

This document outlines the API endpoints for managing prescription schedules and medication reminders.

## Base URL
```
/api/v1/prescription-schedules
```

## Models

### Prescription Schedule
```javascript
{
  "user": "ObjectId",          // Reference to User
  "medicineName": "string",   // Name of the medicine
  "dosage": "string",         // Dosage instructions (e.g., "1 tablet")
  "frequency": "string",      // 'daily', 'weekly', or 'custom'
  "days": ["string"],         // Days of the week (if frequency is 'weekly' or 'custom')
  "times": [{
    "hour": "number",         // 1-12
    "minute": "number",       // 0-59
    "ampm": "string"          // 'am' or 'pm'
  }],
  "startDate": "Date",        // When the schedule should start
  "endDate": "Date",          // Optional end date
  "notes": "string",          // Additional notes
  "isActive": "boolean",      // Whether the schedule is active
  "nextNotification": "Date"  // When the next notification is scheduled
}
```

## Endpoints

### Get All Schedules
```
GET /
```
Get all prescription schedules for the authenticated user.

**Response**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "medicineName": "Paracetamol",
      "dosage": "1 tablet",
      "frequency": "daily",
      "times": [
        { "hour": 8, "minute": 0, "ampm": "am" },
        { "hour": 8, "minute": 0, "ampm": "pm" }
      ],
      "startDate": "2023-01-01T00:00:00.000Z",
      "isActive": true,
      "nextNotification": "2023-06-01T08:00:00.000Z"
    }
  ]
}
```

### Get Single Schedule
```
GET /:id
```
Get a single prescription schedule by ID.

### Create Schedule
```
POST /
```
Create a new prescription schedule.

**Request Body**
```json
{
  "medicineName": "Ibuprofen",
  "dosage": "1 pill",
  "frequency": "weekly",
  "days": ["monday", "wednesday", "friday"],
  "times": [
    { "hour": 9, "minute": 0, "ampm": "am" }
  ],
  "startDate": "2023-06-01",
  "endDate": "2023-12-31",
  "notes": "Take with food"
}
```

### Update Schedule
```
PUT /:id
```
Update an existing prescription schedule.

### Delete Schedule
```
DELETE /:id
```
Delete a prescription schedule.

### Snooze Next Notification
```
POST /:id/snooze
```
Snooze the next notification for a schedule.

**Request Body**
```json
{
  "minutes": 15
}
```

## FCM Token Management

### Add FCM Token
```
POST /api/v1/auth/fcm-token
```
Add an FCM token for push notifications.

**Request Body**
```json
{
  "token": "fcm-token-here"
}
```

### Remove FCM Token
```
DELETE /api/v1/auth/fcm-token
```
Remove an FCM token.

**Request Body**
```json
{
  "token": "fcm-token-here"
}
```

## Notification Payload
When a medication reminder is sent, the following payload is delivered:

```json
{
  "notification": {
    "title": "💊 Medication Reminder",
    "body": "Time to take 1 tablet of Paracetamol at 8:00 AM, 8:00 PM"
  },
  "data": {
    "type": "MEDICATION_REMINDER",
    "scheduleId": "schedule-id-here",
    "click_action": "FLUTTER_NOTIFICATION_CLICK"
  }
}
```

## Environment Variables

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON (stringified)
- `FCM_SERVER_KEY`: Firebase Cloud Messaging server key (optional, if not using service account)
