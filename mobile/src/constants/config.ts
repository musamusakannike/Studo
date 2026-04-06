export const API_BASE_URL = "http://172.20.10.5:5000/api";

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  CACHED_COURSES: 'cached_courses',
  CACHED_PAST_QUESTIONS: 'cached_past_questions',
  DOWNLOADED_CONTENT: 'downloaded_content',
};

export const QUERY_KEYS = {
  USER_PROFILE: 'user_profile',
  COURSES: 'courses',
  MY_COURSES: 'my_courses',
  COURSE_DETAIL: 'course_detail',
  PAST_QUESTIONS: 'past_questions',
  MY_PAST_QUESTIONS: 'my_past_questions',
  PAST_QUESTION_DETAIL: 'past_question_detail',
  WALLET: 'wallet',
  TRANSACTIONS: 'transactions',
  WITHDRAWALS: 'withdrawals',
  LEADERBOARD: 'leaderboard',
};

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export const HAPTIC_FEEDBACK = {
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'notificationSuccess' as const,
  warning: 'notificationWarning' as const,
  error: 'notificationError' as const,
};
