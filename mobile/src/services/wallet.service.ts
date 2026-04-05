import { apiClient } from '../utils/api';
import { ApiResponse, Wallet, Transaction, Withdrawal, PaginatedResponse } from '../types';

export interface WithdrawalRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const walletService = {
  createWallet: () =>
    apiClient.post<ApiResponse<Wallet>>('/wallet/create'),

  getWallet: () =>
    apiClient.get<ApiResponse<Wallet>>('/wallet'),

  getTransactionHistory: (page?: number, limit?: number) =>
    apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/wallet/transactions', {
      params: { page, limit },
    }),

  requestWithdrawal: (data: WithdrawalRequest) =>
    apiClient.post<ApiResponse<Withdrawal>>('/wallet/withdraw', data),

  getWithdrawals: () =>
    apiClient.get<ApiResponse<Withdrawal[]>>('/wallet/withdrawals'),
};
