export type UserRole = 'user' | 'tutor' | 'admin';
export type AuthProvider = 'local' | 'google' | 'apple';
export type TutorApplicationStatus = 'pending' | 'approved' | 'rejected';
export type CourseLevel = '100' | '200' | '300' | '400' | '500';
export type ContentType = 'text' | 'link' | 'image' | 'audio' | 'latex' | 'video' | 'youtubeURL' | 'PDF' | 'code';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  profileImage?: string;
  isVerified: boolean;
  tutorApplicationStatus?: TutorApplicationStatus;
  tutorApplicationDetails?: {
    bio?: string;
    expertise?: string[];
    qualifications?: string;
    appliedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseContent {
  type: ContentType;
  value: string;
  order: number;
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
  image?: string;
  latex?: string;
  solutionExplanation?: string;
}

export interface Quiz {
  passMark: number;
  timeLimit: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  contents: CourseContent[];
  quiz?: Quiz;
}

export interface CourseRating {
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  tutor: User;
  title: string;
  courseCode: string;
  slug: string;
  description: string;
  level: CourseLevel;
  price: number;
  bannerImages: string[];
  lessons: Lesson[];
  requireSequentialCompletion: boolean;
  ratings: CourseRating[];
  averageRating: number;
  totalStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  user: string;
  course: string;
  progress: {
    lessonIndex: number;
    completed: boolean;
    quizScore?: number;
    completedAt?: string;
  }[];
  enrolledAt: string;
}

export interface PastQuestion {
  _id: string;
  creator: User;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  isFree: boolean;
  price: number;
  passMark: number;
  timeLimit: number;
  questions: QuizQuestion[];
  leaderboard: LeaderboardEntry[];
  totalAttempts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  user: User;
  score: number;
  timeToComplete: number;
  attemptedAt: string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  paystackCustomerCode?: string;
  dedicatedAccountId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  user: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  _id: string;
  user: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fee: number;
  netAmount: number;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
