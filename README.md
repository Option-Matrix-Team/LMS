# LIMS - Library Management System

A secure, multi-tenant library management platform built with Next.js and Supabase. Manage books, members, borrowings, and staff across multiple library organizations.

## Features

- **Multi-tenant Architecture**: Each library operates independently with isolated data
- **Role-based Access Control**: System operators, library admins, and librarians
- **Book Management**: Add, edit, and track book inventory with cover images
- **Member Management**: Register members and track their borrowing history
- **Borrowing System**: Issue, return, and extend book loans
- **Overdue Tracking**: Monitor overdue books and send automated reminders
- **Email Notifications**: Automated emails for borrowing, returns, and reminders
- **Passwordless Auth**: Secure OTP-based email authentication

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | Supabase Auth (Email OTP) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI Components | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Email | [Resend](https://resend.com/) + [React Email](https://react.email/) |
| Background Jobs | [BullMQ](https://docs.bullmq.io/) + Redis |
| Linting | [Biome](https://biomejs.dev/) |

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)

# Site URL (for auth redirects)
NEXT_PUBLIC_SITE_URL=            # Your deployment URL (e.g., https://yourapp.railway.app)

# Redis (for BullMQ background jobs)
REDIS_URL=                       # Redis connection URL (e.g., redis://localhost:6379)

# Email (Resend)
RESEND_API_KEY=                  # Your Resend API key
EMAIL_FROM=                      # Sender email (e.g., Library <noreply@yourdomain.com>)
```

## Getting Started

### Prerequisites

- **Node.js 20+** - JavaScript runtime
- **npm** or **yarn** - Package manager
- **Supabase account** - For database and authentication
- **Redis** - Required only for email background jobs

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Option-Matrix-Team/LMS.git
   cd LMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (SQL in `supabase/migrations/`)
   - Enable Email OTP authentication in Supabase dashboard

### Running Locally

**Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

**Start the email worker (for background jobs):**
```bash
npm run email-worker
```

> **Note:** The email worker requires Redis to be running. For local development without email notifications, you can skip this step.

## Build & Deployment

### Build Command
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run email-worker` | Start email background worker |
| `npm run email:preview` | Preview email templates |

## User Roles

| Role | Permissions |
|------|-------------|
| **System Operator** | Manage all libraries, users, and system settings |
| **Library Admin** | Manage their library's books, members, staff, and policies |
| **Librarian** | Issue/return books, manage members within their library |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (authenticated)/    # Protected routes
│   ├── auth/               # Auth callback
│   └── login/              # Login page
├── components/             # React components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── actions/            # Server actions (mutations)
│   ├── queries/            # Data fetching functions
│   ├── validations/        # Zod schemas
│   ├── email/              # Email templates and worker
│   └── supabase/           # Supabase client configuration
└── scripts/                # Background job scripts
```

## Services Required

| Service | Required | Purpose |
|---------|----------|---------|
| Supabase | ✅ Yes | Database, auth, storage |
| Redis | ✅ Yes | Background email jobs |
| Resend | ✅ Yes | Email notifications |

## License

Private - All rights reserved.
