import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notification.service';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const handleNotificationNavigation = useCallback((data: any) => {
    // Navigate based on notification type
    if (data?.type === 'course_enrollment') {
      router.push(`/course/${data.courseId}` as any);
    } else if (data?.type === 'new_lesson') {
      router.push(`/course/${data.courseId}` as any);
    } else if (data?.type === 'wallet_credit') {
      router.push('/(tabs)/wallet');
    } else if (data?.type === 'withdrawal_processed') {
      router.push('/(tabs)/wallet');
    } else if (data?.type === 'tutor_application') {
      router.push('/(tabs)/profile');
    } else if (data?.type === 'course_rating') {
      router.push(`/course/${data.courseId}` as any);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register for push notifications
    const registerPushNotifications = async () => {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
        await notificationService.savePushToken(token);
      }
    };

    registerPushNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    // Listen for notification responses (when user taps notification)
    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, handleNotificationNavigation]);

  return {
    expoPushToken,
    notification,
  };
};
