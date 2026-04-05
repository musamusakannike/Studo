# Push Notifications Setup Guide

## Overview

The Studo mobile app is fully integrated with Expo Push Notifications to send and receive notifications for various events like course enrollments, wallet transactions, quiz results, and more.

## Features

### 1. **Push Notification Registration**
- Automatic registration on app launch (for authenticated users)
- Push token sent to server and stored in user profile
- Works only on physical devices (not simulators)

### 2. **Notification Types**

The app handles the following notification types:

- **Course Enrollment**: When user enrolls in a course
- **New Lesson**: When a new lesson is added to an enrolled course
- **Wallet Credit**: When wallet is credited
- **Withdrawal**: Withdrawal status updates (pending/completed/failed)
- **Tutor Application**: Application status updates
- **Course Rating**: When someone rates a course
- **Quiz Results**: Quiz completion and scores
- **Lesson Completion**: When a lesson is completed
- **Reminders**: Custom reminders

### 3. **Local Notifications**

The app can schedule local notifications for:
- Quiz completion feedback
- Lesson completion celebrations
- Wallet transaction confirmations
- Reminder notifications

### 4. **Notification Navigation**

When a user taps on a notification, they are automatically navigated to the relevant screen:
- Course notifications → Course detail page
- Wallet notifications → Wallet screen
- Tutor notifications → Profile screen

## Implementation Details

### Files Created

1. **`src/services/notification.service.ts`**
   - Core notification service
   - Handles registration, token management
   - Provides methods for local notifications
   - Badge count management

2. **`src/hooks/useNotifications.ts`**
   - React hook for notification setup
   - Listens for incoming notifications
   - Handles notification tap navigation
   - Auto-registers on authentication

3. **`src/utils/notificationHandlers.ts`**
   - Helper functions for common notification scenarios
   - Pre-configured notification templates

### Server Integration

The app integrates with the server's push notification system:

**Endpoints Used:**
- `POST /api/auth/push-token` - Save Expo push token
- `DELETE /api/auth/push-token` - Remove push token on logout

**User Model:**
- `expoPushToken` field stores the device's push token

## Usage

### Automatic Setup

Notifications are automatically initialized when the user logs in. The `useNotifications` hook is called in the root layout.

### Sending Local Notifications

```typescript
import { notificationService } from '../services/notification.service';

// Simple notification
await notificationService.scheduleLocalNotification(
  'Title',
  'Message body',
  { customData: 'value' }
);

// Scheduled notification
await notificationService.scheduleLocalNotification(
  'Reminder',
  'Don\'t forget to study!',
  { type: 'reminder' },
  { date: new Date(Date.now() + 3600000) } // 1 hour from now
);
```

### Using Helper Functions

```typescript
import {
  sendCourseEnrollmentNotification,
  sendQuizResultNotification,
  sendWalletCreditNotification,
} from '../utils/notificationHandlers';

// After course enrollment
await sendCourseEnrollmentNotification('React Native Basics', 'course-id-123');

// After quiz completion
await sendQuizResultNotification(85, true, 'course-id-123');

// After wallet credit
await sendWalletCreditNotification(5000);
```

### Badge Management

```typescript
import { notificationService } from '../services/notification.service';

// Set badge count
await notificationService.setBadgeCount(5);

// Clear badge
await notificationService.clearBadge();

// Get current badge count
const count = await notificationService.getBadgeCount();
```

## Server-Side Push Notifications

The server can send push notifications using the Expo Push Notification API:

```javascript
// Example server-side code (already implemented in server)
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const messages = [{
  to: user.expoPushToken,
  sound: 'default',
  title: 'New Course Available',
  body: 'Check out our latest React Native course!',
  data: { 
    type: 'course_enrollment',
    courseId: 'course-id-123'
  },
}];

const chunks = expo.chunkPushNotifications(messages);
for (const chunk of chunks) {
  await expo.sendPushNotificationsAsync(chunk);
}
```

## Configuration

### App.json Settings

```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#2563EB",
        "sounds": []
      }
    ]
  ]
}
```

### Android Channel

The app automatically creates a default notification channel for Android with:
- Maximum importance
- Vibration pattern
- Custom light color (#2563EB - primary blue)

## Testing

### Testing on Physical Device

1. Install Expo Go or development build on your device
2. Log in to the app
3. Grant notification permissions when prompted
4. Check console for push token
5. Send test notification from server or use local notifications

### Testing Local Notifications

```typescript
// In any screen
import { notificationService } from '../services/notification.service';

const testNotification = async () => {
  await notificationService.scheduleLocalNotification(
    'Test Notification',
    'This is a test message',
    { test: true }
  );
};
```

## Permissions

The app requests notification permissions on first launch after authentication. Users can:
- Grant permissions (notifications work)
- Deny permissions (app continues to work, but no notifications)
- Change permissions later in device settings

## Best Practices

1. **Don't spam**: Only send relevant notifications
2. **Personalize**: Use user's name and relevant context
3. **Actionable**: Make sure tapping notification leads somewhere useful
4. **Timing**: Send notifications at appropriate times
5. **Badge management**: Keep badge count updated and clear when appropriate

## Troubleshooting

**No push token generated:**
- Ensure you're on a physical device (not simulator)
- Check that permissions are granted
- Verify EAS project ID is set in app.json

**Notifications not received:**
- Check device notification settings
- Verify push token is saved on server
- Check server logs for push notification errors

**Navigation not working:**
- Ensure notification data includes correct `type` and IDs
- Check that routes exist in the app

## Future Enhancements

- Rich notifications with images
- Notification categories and actions
- Notification scheduling based on user preferences
- In-app notification center
- Notification history

---

**Note**: Push notifications require a physical device and won't work in simulators/emulators.
