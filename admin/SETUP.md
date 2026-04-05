# Studo HQ - Admin Dashboard Setup Guide

## Overview

This is the production-grade admin dashboard for the Studo platform. Built with Next.js 16, TypeScript, and shadcn/ui, it provides comprehensive management capabilities for tutors, students, courses, and financial operations.

## Tech Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (custom implementation)
- **State Management**: TanStack Query v5
- **Data Tables**: TanStack Table v8
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: next-themes (Dark/Light mode)
- **Notifications**: Sonner

## Prerequisites

- Node.js 18+ or 20+
- pnpm 10.28.2+
- Running Studo backend server (see `../server`)

## Installation

1. **Install dependencies**:
   ```bash
   cd admin
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_NAME=Studo HQ
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

   The dashboard will be available at `http://localhost:3001`

## Project Structure

```
admin/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── login/          # Admin login page
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx        # Analytics overview
│   │       ├── users/          # User management
│   │       ├── tutors/         # Tutor applications
│   │       ├── courses/        # Course moderation
│   │       ├── past-questions/ # Past questions bank
│   │       ├── withdrawals/    # Withdrawal processing
│   │       ├── transactions/   # Transaction history
│   │       └── settings/       # System settings & audit logs
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirects to /dashboard
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/              # Dashboard-specific components
│   └── providers.tsx           # Query & Theme providers
├── lib/
│   ├── api.ts                  # Axios instance with auth
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## Features

### 1. Analytics Overview (The Pulse)
- **Key Metrics**: Total Revenue, Active Students, Pending Tutors, Pending Withdrawals
- **Revenue Growth Chart**: 30-day area chart
- **User Distribution**: Pie chart by role (Admin/Tutor/Student)
- **Top Departments**: Bar chart showing revenue and enrollment

### 2. User & Tutor Management
- **User Directory**: Comprehensive table with search
- **Actions**: Upgrade to Tutor, Ban User, View Wallet
- **Tutor Approval Pipeline**: Review applications with bio, expertise, qualifications
- **Approve/Reject**: With reason tracking

### 3. Content Moderation
- **Course Review**: View all courses with lessons and content
- **Activate/Deactivate**: Control course visibility
- **Past Questions**: Manage crowdsourced questions (placeholder)

### 4. Financial Control (The Vault)
- **Withdrawal Queue**: Pending requests with bank details
- **Approve/Reject**: Integrates with Paystack Transfer API
- **Revenue Logs**: All transactions with 80/20 split display
- **Transaction History**: Filterable by type and purpose

### 5. System Settings
- **Global Config**: 
  - Tutor registration fee
  - Minimum withdrawal amount
  - Course access duration
  - Withdrawal fee percentage
  - Minimum withdrawal fee
- **Audit Logs**: Track all admin actions

### 6. Command Palette
- **Quick Navigation**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- **Search**: Jump to any section instantly

### 7. Dark/Light Mode
- **Theme Toggle**: Seamless switching with system preference support
- **Persistent**: Saves user preference

## API Integration

The dashboard expects the following backend endpoints:

### Analytics
- `GET /admin/analytics` - Dashboard metrics

### Users
- `GET /admin/users` - List all users
- `POST /admin/users/:id/upgrade-to-tutor` - Upgrade user
- `POST /admin/users/:id/ban` - Ban user

### Tutors
- `GET /admin/tutors/pending` - Pending applications
- `POST /admin/tutors/:id/approve` - Approve application
- `POST /admin/tutors/:id/reject` - Reject with reason

### Courses
- `GET /admin/courses` - List all courses
- `PATCH /admin/courses/:id/toggle-active` - Activate/deactivate

### Withdrawals
- `GET /admin/withdrawals` - All withdrawal requests
- `POST /admin/withdrawals/:id/approve` - Process via Paystack
- `POST /admin/withdrawals/:id/reject` - Reject with reason

### Transactions
- `GET /admin/transactions` - Transaction history

### Settings
- `GET /admin/config` - System configuration
- `PUT /admin/config` - Update configuration
- `GET /admin/audit-logs` - Admin action logs

### Auth
- `POST /auth/admin/login` - Admin login

## Authentication

The dashboard uses JWT token authentication:

1. Login at `/auth/login`
2. Token stored in `localStorage` as `admin_token`
3. Automatically attached to all API requests via Axios interceptor
4. Auto-logout on 401 responses

## Development

### Running in Development
```bash
pnpm dev
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

## Design Philosophy

- **Achromatic & Minimal**: Clean, professional SaaS aesthetic
- **Micro-interactions**: Smooth transitions with Framer Motion
- **Responsive**: Mobile-first design approach
- **Accessible**: Semantic HTML and ARIA labels
- **Performance**: Optimized with React Query caching

## Key Utilities

### Currency Formatting
```typescript
formatCurrency(5000) // "₦5,000"
```

### Date Formatting
```typescript
formatDate(date) // "Jan 5, 2024"
formatDateTime(date) // "Jan 5, 2024, 2:30 PM"
```

### Revenue Calculations
```typescript
calculateTutorShare(5000) // 4000 (80%)
calculatePlatformShare(5000) // 1000 (20%)
calculateWithdrawalFee(10000) // 100 (max of 1% or ₦100)
```

## Troubleshooting

### Port Already in Use
If port 3001 is occupied:
```bash
pnpm dev -- --port 3002
```

### API Connection Issues
1. Ensure backend server is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is enabled on backend

### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

## Security Considerations

1. **Admin-only Access**: Ensure backend validates admin role
2. **Token Expiry**: Implement refresh token mechanism
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Backend should rate-limit admin endpoints
5. **Audit Logs**: All actions are logged for accountability

## Production Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.studo.com/api
NEXT_PUBLIC_APP_NAME=Studo HQ
```

## Support

For issues or questions:
1. Check the backend server logs
2. Review browser console for errors
3. Verify API endpoint responses
4. Check network tab for failed requests

## License

Proprietary - Studo Platform
