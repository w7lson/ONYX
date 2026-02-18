# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ONYX Study is a full-stack AI-powered learning platform that generates personalized learning plans and provides interactive study tools. Monorepo with `client/` (React frontend) and `server/` (Express backend).

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
npx prisma db push              # Sync schema to database (no migration history)
npx prisma generate             # Regenerate Prisma client after schema changes
```

Both client and server use npm as the package manager.

## Architecture

**Frontend:** React 19 + Vite + Tailwind CSS (via `@tailwindcss/vite`), Clerk for auth (`@clerk/clerk-react`), React Router DOM for routing, Framer Motion for animations, Lucide React for icons, react-i18next for internationalization (en/de/uk), Axios for API calls.

**Backend:** Express 5 (ES modules), Prisma ORM with PostgreSQL (Supabase), Groq API (via OpenAI SDK, model: llama-3.3-70b-versatile) for AI features, Clerk SDK for backend auth verification, Svix for webhook signature verification.

**Auth flow:** Clerk handles sign-up/sign-in → Clerk webhook (`POST /api/webhooks/clerk`) creates UserProfile in DB → protected routes use Bearer token verified by `server/src/middleware/auth.js`.

**Core user flow:** Landing → Sign up → Dashboard → Onboarding quiz (6 preference questions) → Saves preferences to UserProfile via `POST /api/preferences` → Dashboard.

**App layout:** Authenticated pages use `AppLayout` (sidebar + header with Clerk UserButton + content area). Landing and Onboarding pages render without sidebar. Signed-in users on `/` are auto-redirected to `/dashboard`. Guest users can access Dashboard, Plans, Learning, Settings; restricted routes show GuestRestrictionOverlay with sign-up CTA.

**Sidebar structure:** Grouped navigation — Dashboard | Learn (Plans, Techniques) | Practice (Flashcards, Pomodoro, AI Tests) | Track (Goals, Progress) | Account (Profile, Notifications, Settings). Theme toggle at bottom.

### Key backend files
- `server/src/index.js` — Express app entry, all route definitions (uses `import 'dotenv/config'` as first import for ES module compatibility)
- `server/src/controllers/planController.js` — Groq AI integration, plan generation + retrieval + task toggle
- `server/src/controllers/webhookController.js` — Clerk webhook handler
- `server/src/controllers/flashcardController.js` — Deck/card CRUD, AI card generation, SM-2 review
- `server/src/controllers/pomodoroController.js` — Pomodoro session save/fetch
- `server/src/controllers/testController.js` — AI test generation, submission, MC grading, retrieval, deletion
- `server/src/controllers/goalController.js` — Goal CRUD with milestones
- `server/src/controllers/preferencesController.js` — Save/get/patch user onboarding preferences
- `server/src/controllers/habitController.js` — Habit CRUD, AI generation, completion, streaks, stats
- `server/src/utils/sm2.js` — SM-2 spaced repetition algorithm
- `server/src/middleware/auth.js` — Clerk token verification middleware
- `server/src/controllers/notificationController.js` — Notification CRUD + createNotification helper (used by other controllers)
- `server/src/controllers/progressController.js` — Aggregated stats (overview, weekly activity, study time, test scores)
- `server/prisma/schema.prisma` — Database schema (15 models)

### Key frontend files
- `client/src/App.jsx` — React Router setup, route definitions with auth guards
- `client/src/layouts/AppLayout.jsx` — Sidebar + header (Clerk UserButton) layout wrapper
- `client/src/components/Sidebar.jsx` — Collapsible navigation sidebar (Framer Motion animated, i18n, theme toggle)
- `client/src/components/Onboarding/Quiz.jsx` — 6-step onboarding preference quiz (i18n)
- `client/src/contexts/ThemeContext.jsx` — Dark/light theme provider, persists to localStorage
- `client/src/contexts/PomodoroContext.jsx` — Global timer state, persists across navigation
- `client/src/contexts/NotificationContext.jsx` — Polls unread count every 60s, provides unreadCount
- `client/src/contexts/GuestContext.jsx` — Guest mode state, auto-exits on sign-in
- `client/src/components/GuestRestrictionOverlay.jsx` — Sign-up CTA for restricted guest routes
- `client/src/pages/Progress.jsx` — Progress & stats dashboard with recharts
- `client/src/i18n.js` — i18next configuration
- `client/src/locales/` — Translation files (en.json, de.json, uk.json)
- `client/src/pages/` — Landing, Dashboard, Onboarding, Plans, Learning, Flashcards, Pomodoro, Tests, Goals, Profile, Notifications, Settings
- `client/src/components/Goals/` — GoalSpecify, FocusSelector, MilestoneList, GoalSidebar
- `client/src/components/Flashcards/` — DeckList, DeckDetail, FlashcardFlip, ReviewMode
- `client/src/components/Pomodoro/` — TimerCircular, TimerDigital, TimerMinimal, SessionHistory
- `client/src/components/Tests/` — TestList, TestTaking, TestResults
- `client/src/components/Habits/` — HabitChecklist, HabitCreateModal, AIHabitSuggestions, StreakDisplay, HabitList
- `client/src/components/Learning/TechniqueCard.jsx` — Accordion technique card

### API endpoints
- `POST /api/webhooks/clerk` — Clerk webhook for user creation
- `GET /api/plans` — Fetch user's learning plans
- `POST /api/plans/generate` — Generate learning plan via AI
- `PATCH /api/tasks/:taskId/toggle` — Toggle task completion
- `POST /api/preferences` — Save onboarding preferences
- `GET /api/preferences` — Get user preferences
- `PATCH /api/preferences` — Partial update preferences
- `GET/POST /api/decks` — List/create flashcard decks
- `DELETE /api/decks/:deckId` — Delete deck
- `GET/POST /api/decks/:deckId/cards` — List/add cards in deck
- `DELETE /api/cards/:cardId` — Delete card
- `POST /api/decks/:deckId/generate` — AI generate flashcards
- `GET /api/decks/:deckId/review` — Get due cards for review
- `POST /api/cards/:cardId/review` — Submit SM-2 review rating
- `POST/GET /api/pomodoro/sessions` — Save/fetch pomodoro sessions
- `POST /api/tests/generate` — AI generate test
- `POST /api/tests/:testId/submit` — Submit test answers, auto-grade
- `GET /api/tests` — List user's tests
- `GET /api/tests/:testId` — Get single test
- `DELETE /api/tests/:testId` — Delete test
- `POST/GET /api/goals` — Create/list goals
- `GET/PUT/DELETE /api/goals/:goalId` — Get/update/delete goal
- `PUT /api/goals/:goalId/milestones` — Update milestones
- `POST /api/habits/generate` — AI generate habits from goal
- `POST/GET /api/habits` — Create/list habits
- `GET /api/habits/today` — Get today's due habits with completion status
- `POST/DELETE /api/habits/:habitId/complete` — Complete/uncomplete habit
- `PUT /api/habits/:habitId` — Update habit
- `DELETE /api/habits/:habitId` — Delete habit
- `GET /api/habits/streaks` — Get current + longest streak
- `GET /api/habits/stats` — Get habit statistics
- `GET /api/notifications` — List notifications (supports limit, unreadOnly params)
- `GET /api/notifications/unread-count` — Get unread notification count
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `POST /api/notifications/mark-all-read` — Mark all notifications as read
- `DELETE /api/notifications/:id` — Delete notification
- `GET /api/progress/overview` — Aggregated stats (study time, tests, reviews, goals, habits)
- `GET /api/progress/weekly-activity` — 7-day activity breakdown
- `GET /api/progress/study-time` — Pomodoro study time over N days
- `GET /api/progress/test-scores` — Last 20 test scores with dates

All endpoints except webhook are protected with `requireAuth`.

### API proxy
Vite dev server proxies `/api` requests to `http://localhost:3000` (configured in `client/vite.config.js`).

## Environment Variables

Frontend needs `VITE_CLERK_PUBLISHABLE_KEY`. Backend needs `DATABASE_URL`, `DIRECT_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `GROQ_API_KEY`. See `.env.example` files in both directories.

## Database

PostgreSQL via Supabase with connection pooling. Schema synced via `npx prisma db push` (no migration history).

**Models (15):** `UserProfile` (Clerk link, 6 preference fields, onboardingDone flag), `LearningPlan`, `Module`, `Task` (isCompleted toggle), `Deck`, `Flashcard` (SM-2 fields), `FlashcardReview`, `PomodoroSession`, `Test`, `TestQuestion`, `Goal` (with focus, duration, status), `Milestone` (ordered, with description/reward/targetDate), `Habit` (frequency, daysOfWeek, AI-generated flag), `HabitCompletion` (unique per habit+date), `Notification` (type, title, message, link, isRead).

## Feature Roadmap & Status

### Done
- **User authentication** — Clerk sign-in/sign-up with modal, protected routes, Bearer token auth
- **Internationalization (i18n)** — react-i18next with en/de/uk locales across all features
- **Dark/light theme** — ThemeContext with localStorage persistence, Tailwind dark mode classes
- **Navigation / App layout** — Collapsible sidebar with grouped nav, theme toggle, AppLayout wrapper
- **User onboarding (Quiz)** — 6-step preference quiz (primaryGoal, currentLevel, learningStyle, preferredContent, pace, reviewFrequency), saves to UserProfile
- **Learning Techniques page** — 6 technique accordion cards with step-by-step explanations, links to practice tools
- **Pomodoro Timer** — 3 timer designs (circular/digital/minimal), configurable durations, preset selector, session label, session history with API persistence, global PomodoroContext
- **Spaced Repetition / Flashcards** — Full deck CRUD, manual + AI card creation, SM-2 scheduling algorithm, card review with 3D flip animation, quality rating (Again/Hard/Good/Easy)
- **AI Tests (multiple choice)** — AI generation from topic or pasted content, question-by-question taking UI, auto-grading, score display, results review with correct/incorrect breakdown
- **Goals** — Template selection (6 presets) + "Build your own" 3-step wizard (goal text → duration → milestones), focus categories, milestone reordering with up/down + 3-dots menu, right sidebar (description/reward/target date/best practices), API persistence
- **Settings page** — Language (en/de/uk) and theme (light/dark) selection
- **AI-driven plan generation** — Groq API generates structured curriculum (currently hardcoded to React & Node.js topic)
- **Plans display** — Fetches and renders plans with modules, tasks, progress bars, clickable task checkboxes
- **Profile page** — User info (avatar/name/email via Clerk), 6 preference rows with inline editing (pill buttons), Sign Out, empty state linking to onboarding
- **Daily Habits system** — AI-generated + manual habits, `Habit` + `HabitCompletion` models, 10 API endpoints (generate, CRUD, complete/uncomplete, streaks, stats), HabitChecklist/HabitCreateModal/AIHabitSuggestions/StreakDisplay/HabitList components
- **Dashboard (habits-centric)** — Welcome header, streak + stats bar (4 cards), today's habit checklist with toggle, manage habits view, quick action cards (Pomodoro, Flashcards, Tests)
- **Task completion toggle** — `PATCH /api/tasks/:taskId/toggle` endpoint, clickable checkboxes on Plans page
- **Notifications system** — `Notification` model (15th), notificationController (CRUD + mark read + createNotification helper), NotificationContext (polls unread count), unread badge in Sidebar, full notifications page with grouping/mark read/delete, triggers from habit streaks, goal completion, test scores
- **Progress/Stats dashboard** — progressController (4 endpoints: overview, weekly-activity, study-time, test-scores), Progress page with recharts (AreaChart, BarChart, LineChart), stat cards
- **Enhanced onboarding** — Multi-phase flow: Quiz → Results screen (preference summary) → Goal setup prompt → Feature tour (5 features) → Dashboard. Auto-redirects new users from Dashboard
- **Guest mode** — GuestContext (isGuest flag, auto-exits on sign-in), GuestRestrictionOverlay (sign-up CTA), AuthOrGuest/LayoutGuard route components, Landing "Try without account" link, guest-friendly Dashboard/Onboarding/Plans/Learning/Settings, header shows "Sign Up" for guests

### Stage 2 — Nice-to-have (remaining)
1. **Google OAuth** — Clerk Dashboard configuration (no code changes)

### Stage 3 — Code Quality & Optimization
1. **Refactoring** — Singleton PrismaClient, shared asyncHandler middleware, standardize API calls (shared axios instance with auto-auth), input validation (zod)
2. **Testing** — Integration tests for API (vitest + supertest), component tests for critical flows
3. **Security** — Restrict CORS, rate limiting on AI endpoints, audit placeholder emails in upserts
4. **Database optimization** — Indexes on HabitCompletion(habitId, date), Flashcard(deckId, nextReviewAt), PomodoroSession(userId, completedAt)
5. **Performance** — Route-level code splitting (React.lazy + Suspense), bundle analysis
6. **Accessibility** — aria-labels, heading hierarchy, keyboard navigation, focus management
7. **Error handling** — Error boundaries, toast notifications (replace alerts), skeleton loaders
