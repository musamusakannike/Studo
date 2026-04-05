# Studo Server - Ed-Tech Platform API

A comprehensive backend server for Studo, an ed-tech platform for University of Ilorin students, built with Express, TypeScript, and MongoDB.

## Features

### Authentication & Authorization
- Local registration with email and password
- Google OAuth integration
- Apple authentication
- Password reset functionality
- JWT-based authentication
- Role-based access control (User, Tutor, Admin)

### User Management
- User profiles
- Tutor application system (₦20,000 application fee)
- Admin approval workflow for tutors

### Wallet System
- Paystack Dedicated Virtual Accounts (DVA)
- Wallet top-up via bank transfer
- Transaction history tracking
- Withdrawal requests with admin approval
- Automatic tutor earnings (80% revenue share)
- Withdrawal charges: ₦100 for amounts < ₦10,000, 1% for amounts ≥ ₦10,000

### Courses
- Course creation by tutors
- Multi-level courses (100, 200, 300, 400, 500)
- Lessons with multiple content types (text, link, image, audio, latex, video, YouTube, PDF, code)
- Quiz system with pass marks and time limits
- Sequential or non-sequential lesson completion
- Course ratings and reviews (max 5 reviews displayed)
- 6-month access period per enrollment
- Progress tracking

### Past Questions
- Create and manage past questions
- Free and paid past questions
- Leaderboard for free past questions
- 3-month access period for paid questions
- Quiz-style format with scoring

### Admin Panel
- User management
- Tutor application approval/rejection
- Course and past question moderation
- Transaction monitoring
- Withdrawal processing
- Dashboard statistics

### Additional Features
- File upload to Cloudflare R2 (S3-compatible)
- Email notifications via Resend
- Paystack webhook integration
- Cron jobs for expiration management
- Socket.IO for real-time features
- Rate limiting on sensitive routes
- Security with Helmet
- Request logging with Winston and Morgan
- Data validation with Zod

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Firebase Admin (OAuth)
- **Payment**: Paystack
- **Email**: Resend
- **Storage**: Cloudflare R2 (AWS S3 SDK)
- **File Upload**: Multer, Multer-S3
- **Security**: Helmet, express-rate-limit, bcryptjs
- **Validation**: Zod
- **Logging**: Winston, Morgan
- **Cron Jobs**: node-cron
- **Real-time**: Socket.IO

## Installation

1. **Clone the repository**
```bash
cd server
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Setup**
Create a `.env` file based on `.env.sample`:
```bash
cp .env.sample .env
```

Fill in your environment variables:
- MongoDB connection string
- Paystack API keys
- Resend API key
- Cloudflare R2 credentials
- Firebase credentials
- JWT secret
- Admin emails

4. **Build the project**
```bash
pnpm build
```

5. **Run in development**
```bash
pnpm dev
```

6. **Run in production**
```bash
pnpm start
```

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (database, AWS, Firebase)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (auth, validation, error handling)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (email, Paystack, helpers)
│   ├── validations/     # Zod validation schemas
│   ├── jobs/            # Cron jobs
│   └── server.ts        # Main server file
├── logs/                # Application logs
├── .env.sample          # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google` - Google OAuth
- `POST /auth/apple` - Apple authentication
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/apply-tutor` - Apply to become a tutor (requires ₦20,000)
- `GET /auth/profile` - Get user profile

### Wallet Endpoints
- `POST /wallet/create` - Create wallet with DVA
- `GET /wallet` - Get wallet details
- `GET /wallet/transactions` - Get transaction history
- `POST /wallet/withdraw` - Request withdrawal
- `GET /wallet/withdrawals` - Get withdrawal history

### Course Endpoints
- `POST /courses` - Create course (Tutor only)
- `GET /courses` - Get all courses (with filters)
- `GET /courses/:courseId` - Get course details
- `POST /courses/:courseId/enroll` - Enroll in course
- `GET /courses/my-courses` - Get enrolled courses
- `POST /courses/:courseId/rate` - Rate a course
- `POST /courses/:courseId/lessons` - Add lesson (Tutor only)
- `POST /courses/:courseId/lessons/:lessonIndex/quiz` - Submit quiz
- `POST /courses/:courseId/lessons/:lessonIndex/complete` - Mark lesson complete

### Past Questions Endpoints
- `POST /past-questions` - Create past question
- `GET /past-questions` - Get all past questions
- `GET /past-questions/:id` - Get past question details
- `POST /past-questions/:id/purchase` - Purchase past question
- `GET /past-questions/my-past-questions` - Get purchased past questions
- `GET /past-questions/:id/attempt` - Get questions to attempt
- `POST /past-questions/:id/submit` - Submit answers
- `GET /past-questions/:id/leaderboard` - Get leaderboard

### Admin Endpoints
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/users` - Get all users
- `GET /admin/tutor-applications` - Get tutor applications
- `POST /admin/tutor-applications/:userId/approve` - Approve tutor
- `POST /admin/tutor-applications/:userId/reject` - Reject tutor
- `GET /admin/withdrawals` - Get withdrawal requests
- `POST /admin/withdrawals/:id/process` - Process withdrawal
- `PATCH /admin/courses/:id/toggle-status` - Activate/deactivate course
- `PATCH /admin/past-questions/:id/toggle-status` - Activate/deactivate past question

### Upload Endpoints
- `POST /upload/single` - Upload single file
- `POST /upload/multiple` - Upload multiple files

### Webhook Endpoints
- `POST /webhooks/paystack` - Paystack webhook handler

## Postman Collection

Import `Studo.postman_collection.json` into Postman to test all API endpoints.

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 
  - Auth routes: 5 requests per 15 minutes
  - Wallet routes: 10 requests per 15 minutes
  - General routes: 100 requests per 15 minutes
- **CORS**: Configured for frontend origin
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Webhook Verification**: HMAC SHA512 signature validation

## Cron Jobs

- **Daily at midnight**: Check and expire course enrollments and past question access

## Payment Flow

1. User creates wallet → Paystack DVA assigned
2. User transfers money to DVA → Webhook credits wallet
3. User purchases course/past question → 80% goes to tutor/creator
4. User requests withdrawal → Admin approves → Manual payment

## Email Notifications

- Password reset
- Tutor application submitted (to admins)
- Course enrollment (to tutor)
- Past question purchase (to creator)
- Withdrawal request (to admins)

## Error Handling

All errors are handled centrally with user-friendly messages:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Logging

- Winston for file logging (`logs/error.log`, `logs/combined.log`)
- Morgan for HTTP request logging
- Console logging in development

## Contributing

1. Follow the existing code structure
2. Use TypeScript strict mode
3. Add proper error handling
4. Write user-friendly error messages
5. Test all endpoints before committing

## License

ISC

## Support

For issues or questions, contact the development team.
