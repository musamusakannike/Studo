import { notificationService } from '../services/notification.service';

// Helper functions for common notification scenarios

export const sendCourseEnrollmentNotification = async (
  courseName: string,
  courseId: string
) => {
  await notificationService.scheduleLocalNotification(
    'Course Enrollment Successful',
    `You have successfully enrolled in ${courseName}`,
    {
      type: 'course_enrollment',
      courseId,
    }
  );
};

export const sendLessonCompletionNotification = async (
  lessonTitle: string,
  courseId: string
) => {
  await notificationService.scheduleLocalNotification(
    'Lesson Completed!',
    `Great job! You completed "${lessonTitle}"`,
    {
      type: 'lesson_completion',
      courseId,
    }
  );
};

export const sendQuizResultNotification = async (
  score: number,
  passed: boolean,
  courseId: string
) => {
  await notificationService.scheduleLocalNotification(
    passed ? 'Quiz Passed!' : 'Quiz Completed',
    `You scored ${score}%. ${passed ? 'Congratulations!' : 'Keep practicing!'}`,
    {
      type: 'quiz_result',
      courseId,
      score,
      passed,
    }
  );
};

export const sendWalletCreditNotification = async (amount: number) => {
  await notificationService.scheduleLocalNotification(
    'Wallet Credited',
    `Your wallet has been credited with ₦${amount.toLocaleString()}`,
    {
      type: 'wallet_credit',
      amount,
    }
  );
};

export const sendWithdrawalNotification = async (
  amount: number,
  status: 'pending' | 'completed' | 'failed'
) => {
  const titles = {
    pending: 'Withdrawal Requested',
    completed: 'Withdrawal Successful',
    failed: 'Withdrawal Failed',
  };

  const messages = {
    pending: `Your withdrawal request for ₦${amount.toLocaleString()} is being processed`,
    completed: `₦${amount.toLocaleString()} has been sent to your account`,
    failed: `Your withdrawal request for ₦${amount.toLocaleString()} failed`,
  };

  await notificationService.scheduleLocalNotification(
    titles[status],
    messages[status],
    {
      type: 'withdrawal',
      amount,
      status,
    }
  );
};

export const sendReminderNotification = async (
  title: string,
  message: string,
  triggerDate: Date
) => {
  await notificationService.scheduleLocalNotification(
    title,
    message,
    {
      type: 'reminder',
    },
    {
      date: triggerDate,
    }
  );
};

export const sendTutorApplicationNotification = async (
  status: 'pending' | 'approved' | 'rejected'
) => {
  const titles = {
    pending: 'Application Submitted',
    approved: 'Application Approved!',
    rejected: 'Application Update',
  };

  const messages = {
    pending: 'Your tutor application is under review',
    approved: 'Congratulations! Your tutor application has been approved',
    rejected: 'Your tutor application needs revision',
  };

  await notificationService.scheduleLocalNotification(
    titles[status],
    messages[status],
    {
      type: 'tutor_application',
      status,
    }
  );
};
