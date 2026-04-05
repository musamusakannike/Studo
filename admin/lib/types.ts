export interface User {
  _id: string
  fullName: string
  email: string
  role: 'user' | 'tutor' | 'admin'
  authProvider: 'local' | 'google' | 'apple'
  profileImage?: string
  isVerified: boolean
  tutorApplicationStatus?: 'pending' | 'approved' | 'rejected'
  tutorApplicationDetails?: {
    bio?: string
    expertise?: string[]
    qualifications?: string
    appliedAt?: Date
  }
  createdAt: string
  updatedAt: string
}

export interface Course {
  _id: string
  tutor: User | string
  title: string
  courseCode: string
  slug: string
  description: string
  level: '100' | '200' | '300' | '400' | '500'
  price: number
  bannerImages: string[]
  lessons: Lesson[]
  requireSequentialCompletion: boolean
  ratings: CourseRating[]
  averageRating: number
  totalStudents: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  title: string
  description: string
  order: number
  isActive: boolean
  contents: CourseContent[]
  quiz?: Quiz
}

export interface CourseContent {
  type: 'text' | 'link' | 'image' | 'audio' | 'latex' | 'video' | 'youtubeURL' | 'PDF' | 'code'
  value: string
  order: number
}

export interface Quiz {
  passMark: number
  timeLimit: number
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  questionText: string
  options: string[]
  correctOption: number
  image?: string
  latex?: string
  solutionExplanation?: string
}

export interface CourseRating {
  user: string
  rating: number
  comment: string
  createdAt: string
}

export interface Withdrawal {
  _id: string
  user: User | string
  amount: number
  charge: number
  netAmount: number
  bankName: string
  accountNumber: string
  accountName: string
  status: 'pending' | 'approved' | 'rejected'
  processedBy?: User | string
  processedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  _id: string
  user: User | string
  type: 'credit' | 'debit'
  purpose: 'wallet_topup' | 'course_purchase' | 'pastquestion_purchase' | 'tutor_application' | 'withdrawal' | 'tutor_earning'
  amount: number
  status: 'pending' | 'success' | 'failed'
  balanceBefore: number
  balanceAfter: number
  reference?: string
  paystackReference?: string
  relatedCourse?: Course | string
  relatedPastQuestion?: string
  relatedWithdrawal?: Withdrawal | string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface Wallet {
  _id: string
  user: string
  balance: number
  createdAt: string
  updatedAt: string
}

export interface AnalyticsData {
  totalRevenue: number
  platformRevenue: number
  tutorRevenue: number
  activeStudents: number
  pendingTutorApplications: number
  pendingWithdrawals: number
  revenueGrowth: Array<{ date: string; revenue: number }>
  topDepartments: Array<{ department: string; revenue: number; students: number }>
  userDistribution: Array<{ role: string; count: number }>
}

export interface SystemConfig {
  tutorRegistrationFee: number
  minimumWithdrawalAmount: number
  courseAccessDuration: number
  withdrawalFeePercentage: number
  minimumWithdrawalFee: number
}

export interface AuditLog {
  _id: string
  admin: User | string
  action: string
  targetType: 'user' | 'course' | 'withdrawal' | 'transaction' | 'config'
  targetId?: string
  details: any
  createdAt: string
}
