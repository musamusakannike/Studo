# Studo Mobile App - Complete Guide

## 🎯 Overview

Studo is a modern, production-grade React Native mobile application for an educational platform that connects students with tutors. Built with Expo, the app features a clean "Modern Academic" aesthetic with exceptional attention to UI/UX details.

## ✨ Key Features

### 1. **Authentication & Onboarding**
- Animated onboarding slides with smooth transitions
- Role selection (Student/Tutor)
- Email/Password authentication
- Google OAuth integration (ready)
- Apple Auth integration (ready)
- Biometric authentication support

### 2. **Core Navigation**
- **Home**: Personalized greeting, search functionality, "Continue Learning" section, and recommended courses
- **Explore**: Categorized courses and past questions with level filtering
- **Wallet**: Balance management, DVA (Dedicated Virtual Account), transaction history, and withdrawal flow
- **Profile**: User settings, theme toggle, tutor application, and account management

### 3. **Learning Experience**
- **Course Landing Page**: Beautiful course details with stats, ratings, and syllabus
- **Content Player**: Supports multiple content types:
  - Text (with HTML rendering)
  - Video (using expo-video)
  - Images
  - Code (with syntax highlighting)
  - LaTeX equations
  - Audio
- **Quiz Engine**: 
  - Timed quizzes with countdown
  - Multiple choice questions
  - Score calculation and pass/fail results
  - Review answers functionality

### 4. **Past Questions Hub**
- Browse and purchase past questions
- Real-time leaderboard with rankings
- Timed quiz mode
- Score tracking and performance analytics

### 5. **Financial Features**
- **Wallet Management**: View balance, fund via DVA, transaction history
- **Withdrawal System**: Request withdrawals with bank details and fee calculation
- **Tutor Earnings**: Dashboard for tutors to track earnings and student enrollment

### 6. **Tutor Features**
- Application flow with bio, expertise, and qualifications
- Course creation and management (via API)
- Student enrollment tracking
- Earnings dashboard

## 🏗️ Architecture

### Project Structure
```
mobile/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication flow
│   │   ├── onboarding.tsx
│   │   ├── role-selection.tsx
│   │   ├── signup.tsx
│   │   └── login.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── home.tsx
│   │   ├── explore.tsx
│   │   ├── wallet.tsx
│   │   └── profile.tsx
│   ├── course/                   # Course screens
│   │   └── [id]/
│   │       ├── index.tsx
│   │       └── lesson/[lessonIndex]/
│   │           ├── index.tsx
│   │           └── quiz.tsx
│   ├── past-question/            # Past questions
│   │   └── [id]/
│   │       ├── index.tsx
│   │       └── quiz.tsx
│   ├── tutor/                    # Tutor features
│   │   └── apply.tsx
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/               # Reusable components
│   │   ├── ui/                   # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── auth/
│   │       └── OnboardingSlide.tsx
│   ├── constants/                # App constants
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── config.ts
│   ├── contexts/                 # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useHaptics.ts
│   │   └── useToast.tsx
│   ├── services/                 # API services
│   │   ├── auth.service.ts
│   │   ├── course.service.ts
│   │   ├── pastquestion.service.ts
│   │   └── wallet.service.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   └── utils/                    # Utility functions
│       ├── api.ts
│       └── storage.ts
└── assets/                       # Static assets
```

### Technology Stack

**Core:**
- React Native 0.83.4
- Expo SDK 55
- TypeScript 5.9.2
- Expo Router (File-based routing)

**State Management & Data:**
- @tanstack/react-query (Server state)
- React Context API (Global state)
- MMKV (Fast local storage)

**UI & Animations:**
- Moti (Animations)
- React Native Reanimated 4.2.1
- React Native Gesture Handler
- @shopify/flash-list (Optimized lists)
- Lucide React Native (Icons)

**Fonts:**
- Plus Jakarta Sans (Google Font)

**Additional Libraries:**
- expo-video (Video playback)
- expo-image (Optimized images)
- react-native-render-html (HTML rendering)
- react-native-syntax-highlighter (Code highlighting)
- @gorhom/bottom-sheet (Bottom sheets)

## 🎨 Design System

### Color Palette
The app uses a semantic color system with full dark/light mode support:

**Light Mode:**
- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)
- Background: #FFFFFF
- Surface: #F8F9FA

**Dark Mode:**
- Primary: #3B82F6
- Secondary: #10B981
- Accent: #F59E0B
- Background: #0F172A
- Surface: #1E293B

### Typography
- Font Family: Plus Jakarta Sans
- Sizes: xs (12px) to display (40px)
- Weights: Regular (400) to ExtraBold (800)

### Spacing
Consistent spacing scale: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), xxl (48px), xxxl (64px)

### Animations
- Duration: Fast (200ms), Normal (300ms), Slow (500ms)
- Types: Fade, Scale, Slide, Spring
- Haptic feedback on interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

1. **Install dependencies:**
```bash
cd mobile
npm install
```

2. **Configure environment:**
Update `src/constants/config.ts` with your API base URL:
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Your local server
  : 'https://api.studo.com/api'; // Production server
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on device/simulator:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

### Build for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

## 📱 Features Breakdown

### Authentication Flow
1. Onboarding (4 slides with animations)
2. Role selection (Student/Tutor)
3. Sign up with email/password
4. Login with email/password
5. OAuth options (Google/Apple)

### Home Screen
- Personalized greeting based on time of day
- Search bar with filter options
- "Continue Learning" horizontal scroll (enrolled courses)
- Recommended courses grid
- Progress tracking for ongoing courses

### Explore Screen
- Tab navigation (Courses/Past Questions)
- Level filtering (100L - 500L)
- Search functionality
- Course/Past question cards with details
- Free/Paid badges

### Course Player
- Sequential content navigation
- Progress bar
- Support for multiple content types
- Quiz integration
- Lesson completion tracking

### Quiz Engine
- Start screen with quiz info
- Timed countdown
- Question navigation (Previous/Next)
- Answer selection with visual feedback
- Submit with confirmation
- Results screen with score and pass/fail status
- Review answers option

### Wallet
- Balance display with hide/show toggle
- Fund wallet via DVA
- Transaction history
- Withdrawal request flow
- Fee calculation

### Profile
- User information display
- Theme toggle (Light/Dark/Auto)
- Settings menu
- Tutor application button (for students)
- Logout functionality

## 🔧 Configuration

### App Configuration (`app.json`)
Key configurations:
- Bundle identifiers
- App icons and splash screens
- Permissions
- Plugins (Firebase, Video, Audio, etc.)
- EAS project ID

### Storage Keys
Defined in `src/constants/config.ts`:
- AUTH_TOKEN
- USER_DATA
- THEME_MODE
- BIOMETRIC_ENABLED
- ONBOARDING_COMPLETED
- CACHED_COURSES
- DOWNLOADED_CONTENT

## 🎯 Best Practices Implemented

### Performance
- FlashList for all long lists (following React Native best practices)
- Memoized components where appropriate
- Optimized images with expo-image
- React Query for efficient data caching
- MMKV for fast local storage

### UX
- Smooth animations and transitions
- Haptic feedback on interactions
- Loading states for all async operations
- Error handling with user-friendly messages
- Toast notifications for feedback
- Skeleton screens for loading states

### Code Quality
- TypeScript for type safety
- Modular architecture
- Separation of concerns
- Reusable components
- Custom hooks for shared logic
- Consistent naming conventions

### Accessibility
- SafeAreaView for notch support
- KeyboardAvoidingView for input screens
- Proper contrast ratios
- Touch target sizes (minimum 44x44)

## 🔐 Security

- Secure token storage with MMKV
- API interceptors for authentication
- Automatic token refresh
- Biometric authentication support
- Secure password handling

## 📊 State Management

### Server State (React Query)
- Automatic caching and refetching
- Optimistic updates
- Background synchronization
- Query invalidation

### Global State (Context API)
- Theme management
- Authentication state
- User data

### Local State
- Component-specific state with useState
- Form handling
- UI state

## 🎨 Theming

The app supports three theme modes:
1. **Light**: Default light theme
2. **Dark**: Dark theme with adjusted colors
3. **Auto**: Follows system preference

Theme can be toggled from the Profile screen.

## 📝 API Integration

All API calls are centralized in service files:
- `auth.service.ts`: Authentication endpoints
- `course.service.ts`: Course management
- `pastquestion.service.ts`: Past questions
- `wallet.service.ts`: Wallet operations

API client (`utils/api.ts`) handles:
- Base URL configuration
- Request/response interceptors
- Token injection
- Error handling

## 🚧 Future Enhancements

- Offline mode with full content caching
- Push notifications
- Social sharing
- Course bookmarking
- Advanced search filters
- Video download for offline viewing
- Chat with tutors
- Live classes
- Certificate generation

## 🐛 Troubleshooting

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

**Android build issues:**
```bash
cd android && ./gradlew clean && cd ..
```

## 📄 License

This project is part of the Studo educational platform.

## 👥 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Built with ❤️ using React Native and Expo**
