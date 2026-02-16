# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ONYX Study is a full-stack AI-powered learning platform that generates personalized learning plans. Monorepo with `client/` (React frontend) and `server/` (Express backend).

## Commands

### Frontend (client/)
```bash
cd client && npm install        # Install dependencies
npm run dev                     # Dev server on http://localhost:5173
npm run build                   # Production build to dist/
npm run lint                    # ESLint
```

### Backend (server/)
```bash
cd server && npm install        # Install dependencies
npm run dev                     # Nodemon dev server on port 3000
npm start                       # Production: node src/index.js
npx prisma migrate dev --name <name>  # Run database migration
npx prisma generate             # Regenerate Prisma client after schema changes
```

Both client and server use npm as the package manager.

## Architecture

**Frontend:** React 19 + Vite + Tailwind CSS (via `@tailwindcss/vite`), Clerk for auth (`@clerk/clerk-react`), React Router DOM for routing, Framer Motion for animations, Lucide React for icons, Axios for API calls.

**Backend:** Express 5 (ES modules), Prisma ORM with PostgreSQL (Supabase), Groq API (via OpenAI SDK) for AI curriculum generation, Clerk SDK for backend auth verification, Svix for webhook signature verification.

**Auth flow:** Clerk handles sign-up/sign-in → Clerk webhook (`POST /api/webhooks/clerk`) creates UserProfile in DB → protected routes use Bearer token verified by `server/src/middleware/auth.js`.

**Core user flow:** Landing → Sign up → Redirected to Dashboard → Start Onboarding quiz → Quiz responses sent to `POST /api/plans/generate` → Groq AI generates structured JSON curriculum → Plan with modules and tasks saved to DB → Dashboard displays plans.

**App layout:** Authenticated pages use `AppLayout` (sidebar + header + content area). Landing and Onboarding pages render without sidebar. Signed-in users on `/` are auto-redirected to `/dashboard`.

### Key backend files
- `server/src/index.js` — Express app entry, all route definitions (uses `import 'dotenv/config'` as first import for ES module compatibility)
- `server/src/controllers/planController.js` — Groq AI integration, plan generation + retrieval
- `server/src/controllers/webhookController.js` — Clerk webhook handler
- `server/src/middleware/auth.js` — Clerk token verification middleware
- `server/prisma/schema.prisma` — Database schema (UserProfile, LearningPlan, Module, Task)

### Key frontend files
- `client/src/App.jsx` — React Router setup, route definitions with auth guards
- `client/src/layouts/AppLayout.jsx` — Sidebar + header layout wrapper for authenticated pages
- `client/src/components/Sidebar.jsx` — Collapsible navigation sidebar (Framer Motion animated)
- `client/src/components/Onboarding/Quiz.jsx` — Multi-step onboarding quiz
- `client/src/pages/` — Landing, Dashboard, Onboarding, Plans, Progress, Profile, Notifications, Settings

### API endpoints
- `POST /api/webhooks/clerk` — Clerk webhook for user creation
- `GET /api/plans` — Fetch authenticated user's learning plans (protected)
- `POST /api/plans/generate` — Generate new learning plan via AI (protected)

### API proxy
Vite dev server proxies `/api` requests to `http://localhost:3000` (configured in `client/vite.config.js`).

## Environment Variables

Frontend needs `VITE_CLERK_PUBLISHABLE_KEY`. Backend needs `DATABASE_URL`, `DIRECT_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `GROQ_API_KEY`. See `.env.example` files in both directories.

## Database

PostgreSQL via Supabase with connection pooling. Schema has four models: `UserProfile` (linked to Clerk via `clerkId`), `LearningPlan` (status: active/completed/archived), `Module` (ordered, with estimated minutes), `Task` (completable items within modules).

## Feature Roadmap & Status

### Done
- **AI-driven plan generation** — Groq API (llama-3.3-70b-versatile) generates structured curriculum from quiz preferences
- **User authentication** — Clerk sign-in/sign-up with modal, protected routes, Bearer token auth
- **Backend database system** — Prisma ORM + Supabase PostgreSQL, 4 models with relations
- **User onboarding (Quiz)** — 3-step animated quiz (time, complexity, priority)
- **Navigation / App layout** — Collapsible sidebar with 6 nav items, AppLayout wrapper
- **Dashboard with plan display** — Fetches and renders plans with modules, tasks, progress bars

### In Progress / Partial
- **Task tracking** — Plans and tasks display on Dashboard, but tasks cannot be marked complete yet
- **Progress visualization** — Module progress bars exist, dedicated Progress page is a placeholder

### Not Started
- **Google authentication** — Needs Clerk Google OAuth provider configuration
- **Full onboarding flow** — Current: Quiz only. Target: Quiz → Results → Symptoms → How app can help → Reviews → App features → Custom plan (Paywall / Discounted Paywall / Free for 3 days)
- **Notifications and reminders** — No backend or frontend implementation yet
- **User profile customization** — Profile page is placeholder, no backend endpoints
