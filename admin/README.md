# Studo HQ - Admin Dashboard

Production-grade admin dashboard for the Studo educational platform. Manage tutors, students, courses, and financial operations from a single, powerful interface.

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local

# Start development server
pnpm dev
```

Dashboard runs on `http://localhost:3001`

## Features

✨ **Analytics Dashboard** - Real-time metrics and revenue tracking  
👥 **User Management** - Comprehensive user and tutor administration  
📚 **Course Moderation** - Review and approve course content  
💰 **Financial Control** - Process withdrawals and track transactions  
⚙️ **System Settings** - Configure platform-wide parameters  
📋 **Audit Logs** - Complete action history tracking  
🌓 **Dark/Light Mode** - Seamless theme switching  
⌨️ **Command Palette** - Quick navigation (Cmd+K)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query & Table
- Recharts
- Framer Motion

## Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions, API integration guide, and deployment information.

## Project Structure

```
app/
  (auth)/          # Authentication pages
  (dashboard)/     # Protected dashboard routes
components/
  ui/              # Reusable UI components
  dashboard/       # Dashboard-specific components
lib/
  api.ts           # API client configuration
  types.ts         # TypeScript definitions
  utils.ts         # Utility functions
```

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Studo HQ
```

## License

Proprietary - Studo Platform
