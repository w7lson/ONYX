# ONYX Study

An AI-powered learning platform that generates personalized learning plans and provides interactive study tools.

## Features

- **AI Learning Plans** — Generate structured curricula powered by Groq (Llama 3.3 70B)
- **Flashcards** — Deck management with SM-2 spaced repetition scheduling and 3D flip animation
- **AI Tests** — Auto-generated multiple choice tests with instant grading and results review
- **Pomodoro Timer** — Three timer designs (circular, digital, minimal) with session history
- **Goals & Milestones** — Goal templates, custom goal wizard, milestone tracking with sidebar details
- **Daily Habits** — AI-generated and manual habits with streak tracking and completion stats
- **Progress Dashboard** — Charts for study time, test scores, weekly activity, and overview stats
- **Notifications** — In-app notification system with unread badge and real-time polling
- **Onboarding Quiz** — 6-step preference quiz that personalizes the experience
- **Guest Mode** — Explore core features without an account
- **Internationalization** — English, German, and Ukrainian (en/de/uk)
- **Dark/Light Theme** — Persisted across sessions

## Tech Stack

**Frontend**
- React 19 + Vite + Tailwind CSS
- Clerk for authentication
- React Router DOM, Framer Motion, Recharts, Lucide React
- react-i18next for i18n

**Backend**
- Express 5 (ES modules)
- Prisma ORM + PostgreSQL (Supabase)
- Groq API via OpenAI SDK (model: `llama-3.3-70b-versatile`)
- Clerk SDK + Svix for webhook verification

## Project Structure

```
ONYXstudy/
├── client/          # React frontend
└── server/          # Express backend
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- [Clerk](https://clerk.com) account
- [Groq](https://console.groq.com) API key

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env        # Add VITE_CLERK_PUBLISHABLE_KEY
npm run dev                 # http://localhost:5173
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env        # Fill in all variables (see below)
npx prisma db push          # Sync schema to database
npm run dev                 # http://localhost:3000
```

### Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection (for migrations) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `GROQ_API_KEY` | Groq API key (`gsk_...`) |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

### Clerk Webhook

In the Clerk Dashboard, add a webhook endpoint pointing to `/api/webhooks/clerk` with the `user.created` event. This creates the user profile in the database on sign-up.

## Database

Schema is managed via Prisma with 15 models: `UserProfile`, `LearningPlan`, `Module`, `Task`, `Deck`, `Flashcard`, `FlashcardReview`, `PomodoroSession`, `Test`, `TestQuestion`, `Goal`, `Milestone`, `Habit`, `HabitCompletion`, `Notification`.

```bash
npx prisma db push       # Apply schema changes
npx prisma generate      # Regenerate client after schema changes
```

## Scripts

| Directory | Command | Description |
|---|---|---|
| `client/` | `npm run dev` | Dev server on port 5173 |
| `client/` | `npm run build` | Production build |
| `client/` | `npm run lint` | ESLint |
| `server/` | `npm run dev` | Nodemon dev server on port 3000 |
| `server/` | `npm start` | Production server |

## Deployment

The app is deployed on [Vercel](https://vercel.com). Environment variables must be configured in the Vercel dashboard under **Settings → Environment Variables**. Mark sensitive keys (Clerk secret, Groq API key) as **Sensitive**.
