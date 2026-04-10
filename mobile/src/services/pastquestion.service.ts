import { apiClient } from '../utils/api';
import { ApiResponse, PastQuestion, PaginatedResponse, LeaderboardEntry } from '../types';

export interface PastQuestionFilters {
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubmitPastQuestionData {
  answers: number[];
  timeSpent: number;
}

export const pastQuestionService = {
  getPastQuestions: (filters?: PastQuestionFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<PastQuestion>>>('/past-questions', { params: filters }),

  getMyPastQuestions: () =>
    apiClient.get<ApiResponse<PastQuestion[]>>('/past-questions/my-past-questions'),

  getPastQuestionById: (pastQuestionId: string) =>
    apiClient.get<ApiResponse<PastQuestion>>(`/past-questions/${pastQuestionId}`),

  purchasePastQuestion: (pastQuestionId: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(`/past-questions/${pastQuestionId}/purchase`),

  attemptPastQuestion: (pastQuestionId: string) =>
    apiClient.get<ApiResponse<PastQuestion>>(`/past-questions/${pastQuestionId}/attempt`),

  submitPastQuestion: (pastQuestionId: string, data: SubmitPastQuestionData) =>
    apiClient.post<ApiResponse<{ score: number; passed: boolean; rank: number; correctAnswers: number[] }>>(
      `/past-questions/${pastQuestionId}/submit`,
      data
    ),

  getLeaderboard: (pastQuestionId: string) =>
    apiClient.get<ApiResponse<LeaderboardEntry[]>>(`/past-questions/${pastQuestionId}/leaderboard`),

  createPastQuestion: (data: any) =>
    apiClient.post<ApiResponse<PastQuestion>>('/past-questions', data),
};
