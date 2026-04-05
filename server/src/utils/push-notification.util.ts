import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import logger from './logger.util';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export interface PushNotificationPayload {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

/**
 * Send push notification(s) to one or more Expo push tokens.
 * Invalid tokens are silently skipped.
 */
export const sendPushNotification = async (
  payload: PushNotificationPayload
): Promise<void> => {
  const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];

  const validTokens = tokens.filter((token) => {
    if (!token) return false;
    if (!Expo.isExpoPushToken(token)) {
      logger.warn(`Invalid Expo push token skipped: ${token}`);
      return false;
    }
    return true;
  });

  if (validTokens.length === 0) return;

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: payload.sound ?? 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    badge: payload.badge,
    channelId: payload.channelId,
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === 'error') {
          logger.error(`Push notification error for token ${validTokens[i]}:`, ticket.message);
        }
      });
    } catch (error: any) {
      logger.error('Failed to send push notification chunk:', error.message);
    }
  }
};

// ─── Typed helpers for specific notification events ─────────────────────────

export const notifyWalletCredited = (token: string, amount: number, newBalance: number) =>
  sendPushNotification({
    to: token,
    title: '💰 Wallet Credited',
    body: `₦${amount.toLocaleString()} has been added to your wallet. New balance: ₦${newBalance.toLocaleString()}.`,
    data: { type: 'wallet_credit', amount, newBalance },
    channelId: 'wallet',
  });

export const notifyVirtualAccountAssigned = (token: string, accountNumber: string, bankName: string) =>
  sendPushNotification({
    to: token,
    title: '🏦 Virtual Account Ready',
    body: `Your Studo virtual account (${accountNumber}) at ${bankName} is now active. You can fund your wallet!`,
    data: { type: 'virtual_account_assigned', accountNumber, bankName },
    channelId: 'wallet',
  });

export const notifyCourseEnrollment = (
  tutorToken: string,
  courseName: string,
  studentName: string,
  earning: number
) =>
  sendPushNotification({
    to: tutorToken,
    title: '🎉 New Course Enrollment',
    body: `${studentName} just enrolled in "${courseName}". You earned ₦${earning.toLocaleString()}!`,
    data: { type: 'course_enrollment', courseName, studentName, earning },
    channelId: 'earnings',
  });

export const notifyPastQuestionPurchase = (
  creatorToken: string,
  pqTitle: string,
  buyerName: string,
  earning: number
) =>
  sendPushNotification({
    to: creatorToken,
    title: '📝 Past Question Sold',
    body: `${buyerName} purchased "${pqTitle}". You earned ₦${earning.toLocaleString()}!`,
    data: { type: 'past_question_purchase', pqTitle, buyerName, earning },
    channelId: 'earnings',
  });

export const notifyWithdrawalSubmitted = (token: string, amount: number) =>
  sendPushNotification({
    to: token,
    title: '📤 Withdrawal Requested',
    body: `Your withdrawal request of ₦${amount.toLocaleString()} has been submitted and is pending review.`,
    data: { type: 'withdrawal_submitted', amount },
    channelId: 'wallet',
  });

export const notifyWithdrawalProcessed = (
  token: string,
  amount: number,
  status: 'approved' | 'rejected',
  rejectionReason?: string
) => {
  if (status === 'approved') {
    return sendPushNotification({
      to: token,
      title: '✅ Withdrawal Approved',
      body: `Your withdrawal of ₦${amount.toLocaleString()} has been approved and is being processed.`,
      data: { type: 'withdrawal_approved', amount },
      channelId: 'wallet',
    });
  }
  return sendPushNotification({
    to: token,
    title: '❌ Withdrawal Rejected',
    body: `Your withdrawal of ₦${amount.toLocaleString()} was rejected${rejectionReason ? `: ${rejectionReason}` : '. Your balance has been refunded.'}`,
    data: { type: 'withdrawal_rejected', amount, rejectionReason },
    channelId: 'wallet',
  });
};

export const notifyTutorApplicationApproved = (token: string) =>
  sendPushNotification({
    to: token,
    title: '🎓 Tutor Application Approved!',
    body: 'Congratulations! Your tutor application has been approved. You can now create courses on Studo.',
    data: { type: 'tutor_approved' },
    channelId: 'account',
  });

export const notifyTutorApplicationRejected = (token: string) =>
  sendPushNotification({
    to: token,
    title: '❌ Tutor Application Rejected',
    body: 'Your tutor application was not approved. Your ₦20,000 application fee has been refunded to your wallet.',
    data: { type: 'tutor_rejected' },
    channelId: 'account',
  });

export const notifyQuizPassed = (token: string, lessonTitle: string, score: number) =>
  sendPushNotification({
    to: token,
    title: '🏆 Quiz Passed!',
    body: `You scored ${score.toFixed(0)}% on "${lessonTitle}". Keep it up!`,
    data: { type: 'quiz_passed', lessonTitle, score },
    channelId: 'learning',
  });

export const notifyTutorEarning = (token: string, amount: number, source: string) =>
  sendPushNotification({
    to: token,
    title: '💸 Earnings Received',
    body: `You earned ₦${amount.toLocaleString()} from ${source}!`,
    data: { type: 'tutor_earning', amount, source },
    channelId: 'earnings',
  });
