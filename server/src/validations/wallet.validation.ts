import { z } from 'zod';

export const requestWithdrawalSchema = z.object({
  amount: z.number().min(1000, 'Minimum withdrawal amount is ₦1,000'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits').max(10, 'Account number must be 10 digits'),
  accountName: z.string().min(1, 'Account name is required'),
  bankCode: z.string().min(1, 'Bank code is required'),
});

export const processWithdrawalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});
