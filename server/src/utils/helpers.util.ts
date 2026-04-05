import crypto from 'crypto';

export const generateReference = (prefix: string = 'REF'): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${randomStr}`.toUpperCase();
};

export const calculateWithdrawalCharge = (amount: number): number => {
  if (amount < 10000) {
    return 100;
  }
  return Math.floor(amount * 0.01);
};

export const calculateTutorEarning = (amount: number): number => {
  return Math.floor(amount * 0.8);
};

export const getAdminEmails = (): string[] => {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails.split(',').map(email => email.trim()).filter(email => email);
};

export const addMonthsToDate = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const verifyPaystackWebhook = (signature: string, body: any, secret: string): boolean => {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return hash === signature;
};
