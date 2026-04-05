import { apiClient } from '../utils/api';
import { ApiResponse, Course, PaginatedResponse, Enrollment } from '../types';

export interface CourseFilters {
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubmitQuizData {
  answers: number[];
  timeSpent: number;
}

export interface RateCourseData {
  rating: number;
  comment: string;
}

export const courseService = {
  getCourses: (filters?: CourseFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Course>>>('/courses', { params: filters }),

  getMyCourses: () =>
    apiClient.get<ApiResponse<Course[]>>('/courses/my-courses'),

  getCourseById: (courseId: string) =>
    apiClient.get<ApiResponse<Course>>(`/courses/${courseId}`),

  enrollInCourse: (courseId: string) =>
    apiClient.post<ApiResponse<Enrollment>>(`/courses/${courseId}/enroll`),

  rateCourse: (courseId: string, data: RateCourseData) =>
    apiClient.post<ApiResponse<Course>>(`/courses/${courseId}/rate`, data),

  submitQuiz: (courseId: string, lessonIndex: number, data: SubmitQuizData) =>
    apiClient.post<ApiResponse<{ score: number; passed: boolean; correctAnswers: number[] }>>(
      `/courses/${courseId}/lessons/${lessonIndex}/quiz`,
      data
    ),

  completeLesson: (courseId: string, lessonIndex: number) =>
    apiClient.post<ApiResponse<Enrollment>>(`/courses/${courseId}/lessons/${lessonIndex}/complete`),
};
