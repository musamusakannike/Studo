import { Resend } from 'resend';
import logger from './logger.util';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { to, subject, html } = options;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@studo.com';

    await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    logger.info(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Studo',
    html,
  });
};

export const sendTutorApplicationNotification = async (
  adminEmails: string[],
  applicantName: string,
  applicantEmail: string,
  applicationDetails: any
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Tutor Application</h2>
      <p>A new tutor application has been submitted:</p>
      <ul>
        <li><strong>Name:</strong> ${applicantName}</li>
        <li><strong>Email:</strong> ${applicantEmail}</li>
        <li><strong>Bio:</strong> ${applicationDetails.bio || 'N/A'}</li>
        <li><strong>Expertise:</strong> ${applicationDetails.expertise?.join(', ') || 'N/A'}</li>
        <li><strong>Qualifications:</strong> ${applicationDetails.qualifications || 'N/A'}</li>
      </ul>
      <p>Please review this application in the admin dashboard.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmails,
    subject: 'New Tutor Application - Studo',
    html,
  });
};

export const sendWithdrawalRequestNotification = async (
  adminEmails: string[],
  userName: string,
  amount: number,
  bankDetails: { bankName: string; accountNumber: string; accountName: string }
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Withdrawal Request</h2>
      <p>A withdrawal request has been submitted:</p>
      <ul>
        <li><strong>User:</strong> ${userName}</li>
        <li><strong>Amount:</strong> ₦${amount.toLocaleString()}</li>
        <li><strong>Bank:</strong> ${bankDetails.bankName}</li>
        <li><strong>Account Number:</strong> ${bankDetails.accountNumber}</li>
        <li><strong>Account Name:</strong> ${bankDetails.accountName}</li>
      </ul>
      <p>Please process this withdrawal request.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmails,
    subject: 'New Withdrawal Request - Studo',
    html,
  });
};

export const sendCourseEnrollmentNotification = async (
  tutorEmail: string,
  tutorName: string,
  courseName: string,
  amount: number,
  tutorEarning: number
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Course Enrollment</h2>
      <p>Hello ${tutorName},</p>
      <p>Great news! A student has enrolled in your course:</p>
      <ul>
        <li><strong>Course:</strong> ${courseName}</li>
        <li><strong>Course Price:</strong> ₦${amount.toLocaleString()}</li>
        <li><strong>Your Earning (80%):</strong> ₦${tutorEarning.toLocaleString()}</li>
      </ul>
      <p>The amount has been credited to your wallet.</p>
      <p>Keep up the great work!</p>
    </div>
  `;

  return sendEmail({
    to: tutorEmail,
    subject: 'New Course Enrollment - Studo',
    html,
  });
};

export const sendPastQuestionPurchaseNotification = async (
  creatorEmail: string,
  creatorName: string,
  pastQuestionTitle: string,
  amount: number,
  creatorEarning: number
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Past Question Purchase</h2>
      <p>Hello ${creatorName},</p>
      <p>Someone has purchased your past question:</p>
      <ul>
        <li><strong>Past Question:</strong> ${pastQuestionTitle}</li>
        <li><strong>Price:</strong> ₦${amount.toLocaleString()}</li>
        <li><strong>Your Earning (80%):</strong> ₦${creatorEarning.toLocaleString()}</li>
      </ul>
      <p>The amount has been credited to your wallet.</p>
    </div>
  `;

  return sendEmail({
    to: creatorEmail,
    subject: 'New Past Question Purchase - Studo',
    html,
  });
};
