import { apiClient } from '../utils/api';
import { ApiResponse, User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: 'user' | 'tutor';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoogleAuthData {
  idToken: string;
}

export interface AppleAuthData {
  identityToken: string;
  user?: {
    email?: string;
    fullName?: string;
  };
}

export interface TutorApplicationData {
  bio: string;
  expertise: string[];
  qualifications: string;
}

export const authService = {
  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials),

  googleAuth: (data: GoogleAuthData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/google', data),

  appleAuth: (data: AppleAuthData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/apple', data),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password }),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/auth/profile'),

  applyForTutor: (data: TutorApplicationData) =>
    apiClient.post<ApiResponse<User>>('/auth/apply-tutor', data),

  registerPushToken: (token: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/push-token', { token }),

  removePushToken: () =>
    apiClient.delete<ApiResponse<{ message: string }>>('/auth/push-token'),
};
