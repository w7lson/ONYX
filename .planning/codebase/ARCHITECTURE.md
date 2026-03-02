# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Full-stack monorepo with **Layered + Feature-based hybrid** architecture

**Key Characteristics:**
- Client-server separation: React frontend (`client/`) decoupled from Express backend (`server/`)
- Feature-based modules: Flashcards, Pomodoro, Goals, Habits, Tests — each self-contained with API endpoints, controllers, DB models
- Context-driven state management: Global concerns (auth, theme, notifications, pomodoro timer) lifted to React Contexts
- Database-centric design: Prisma ORM enforces single source of truth; 15 models define entity relationships
- Rate-limited AI integration: Groq API calls protected by 10 req/min limiter to control costs

## Layers

**Frontend (React + Context):**
- Purpose: User interface, local state, routing, context-driven global state
- Location: `client/src/`
- Contains: Pages, components, contexts, layouts, i18n config, CSS
- Depends on: Clerk SDK (auth), React Router (routing), Framer Motion (animations), Lucide (icons), react-i18next (i18n), Axios (HTTP), Recharts (graphing)
- Used by: End users; entry point is `client/src/main.jsx` → `client/src/App.jsx`

**Backend (Express REST API):**
- Purpose: Business logic, database operations, AI integration, webhook handling
- Location: `server/src/`
- Contains: Controllers (business logic), middleware (auth, error handling), utilities (SM-2 algorithm), Prisma client
- Depends on: Express, Prisma ORM, Clerk SDK (JWT verification), Groq/OpenAI SDK, Svix (webhooks)
- Used by: React frontend via Axios; also handles external Clerk webhooks

**Database (PostgreSQL via Supabase):**
- Purpose: Persistent storage for users, plans, decks, tests, goals, habits, notifications, sessions
- Location: `server/prisma/schema.prisma`
- Contains: 15 Prisma models defining entity structure and relationships
- Depends on: PostgreSQL provider, environment variables for connection pooling
- Used by: Backend only, via Prisma client; schema synced with `npx prisma db push`

## Data Flow

**User Authentication Flow:**
1. User signs up/signs in via Clerk modal in `client/src/pages/Landing.jsx`
2. Clerk returns session token → stored in Clerk's token store
3. Frontend requests protected endpoint with Bearer token (via `useAuth().getToken()`)
4. Backend verifies token using `ClerkExpressRequireAuth` middleware (`server/src/middleware/auth.js`)
5. `req.auth.userId` populated with Clerk user ID → passed to controllers
6. Clerk webhook (`POST /api/webhooks/clerk`) creates `UserProfile` on sign-up via `webhookController.js`

**Learning Plan Generation Flow:**
1. User creates Goal in `client/src/pages/Goals.jsx` → `POST /api/goals`
2. User selects goal → clicks "Generate Plan" → `POST /api/plans/generate` with `goalId`
3. `planController.generatePlanFromGoal()`:
   - Fetches Goal + Milestones + UserProfile (preferences)
   - Builds prompt with goal details, user learning style, pace, etc.
   - Calls Groq API (llama-3.3-70b-versatile) → returns structured JSON (modules, tasks)
   - Saves to DB: `LearningPlan` → `Module[]` → `Task[]`
4. Frontend refetches `GET /api/plans` → displays plan with task checkboxes
5. User toggles task → `PATCH /api/tasks/:taskId/toggle` → updates `task.isCompleted` in DB

**Flashcard Spaced Repetition Flow:**
1. User creates Deck in `client/src/pages/Flashcards.jsx` → `POST /api/decks`
2. User adds cards manually or via AI generation (`POST /api/decks/:deckId/generate` → Groq)
3. Daily review: `GET /api/decks/:deckId/review` → returns cards where `nextReviewAt <= now`
4. User rates card quality (Again/Hard/Good/Easy) → `POST /api/cards/:cardId/review`
5. `reviewCard()` in `flashcardController.js`:
   - Calls `schedule()` from `server/src/utils/sm2.js` (SM-2 or FSRS algorithm)
   - Updates card: `state`, `interval`, `easeFactor`, `nextReviewAt`, `lastReviewedAt`
   - Saves `FlashcardReview` record for history
6. Frontend displays card with `nextReviewAt` countdown

**Habit Tracking Flow:**
1. User creates Goal → AI generates Habits via `POST /api/habits/generate`
2. Or user manually creates Habit via `POST /api/habits`
3. Daily dashboard (`Dashboard.jsx`) calls `GET /api/habits/today`:
   - Returns habits due today with completion status (via `HabitCompletion` join)
4. User checks habit off → `POST /api/habits/:habitId/complete`
   - Creates `HabitCompletion(habitId, date)` entry
   - Increments streak, triggers notification
5. Notifications context polls `GET /api/notifications/unread-count` every 60s
6. User views `Notifications.jsx` → `GET /api/notifications` → displays habit streaks, goal milestones, test scores

**Pomodoro Timer Flow:**
1. Global `PomodoroContext` in `client/src/contexts/PomodoroContext.jsx` manages timer state
2. Timer ticks in local state (no API call during countdown)
3. When session completes: `lastCompletedSession` set with duration + label
4. `Pomodoro.jsx` page watches `lastCompletedSession` → calls `POST /api/pomodoro/sessions`
5. Backend saves `PomodoroSession(userId, durationMin, completedAt, label)`
6. Progress page queries `GET /api/progress/study-time` → aggregates sessions → displays chart

**Notification Creation Pattern:**
- Controllers call `createNotification(userId, type, title, message, link)` helper from `notificationController.js`
- Triggered by: habit streak milestones, goal completion, test scores, milestone achievements
- Frontend polls `GET /api/notifications/unread-count` every 60s → updates bell badge in header

**State Management:**
- **Global Context State** (React): Theme, Pomodoro timer, Notifications (unread count), Guest mode — lift to root `main.jsx` providers
- **Page Component State** (useState): Form inputs, modals, UI toggles — local to component
- **Server State** (Database): User data, learning content, completion records — single source of truth via Prisma
- **Session State** (Clerk): User identity, auth token — managed by Clerk SDK, re-exposed in contexts via `useAuth()`

## Key Abstractions

**Flashcard (SM-2 Algorithm):**
- Purpose: Schedule optimal review times for spaced repetition
- Examples: `server/src/utils/sm2.js` — `schedule(quality, card, config, now)` function
- Pattern: Dual-algorithm support (SM-2 and FSRS) selectable per deck; uses ease factor, interval, repetitions to calculate `nextReviewAt`; configurable learning steps, graduation intervals

**User Authentication & Authorization:**
- Purpose: Verify request authenticity, enforce ownership
- Examples: `server/src/middleware/auth.js` (Clerk JWT verification), `requireAuth` wrapper on all routes
- Pattern: Middleware extracts `req.auth.userId` from Clerk token; controllers check `userId` matches resource owner before allowing mutations

**Context Providers:**
- Purpose: Share state across component tree without prop drilling
- Examples:
  - `client/src/contexts/ThemeContext.jsx` — Dark/light theme (hardcoded to dark in current version)
  - `client/src/contexts/NotificationContext.jsx` — Unread notification count with 60s polling
  - `client/src/contexts/PomodoroContext.jsx` — Global timer state, syncs completed sessions to API
  - `client/src/contexts/GuestContext.jsx` — Guest mode flag, auto-exits on sign-in
- Pattern: createContext → Provider wrapper at root → custom hooks (useTheme, useNotifications, etc.) for consumption

**Route Guards:**
- Purpose: Enforce auth & permission boundaries
- Examples: `client/src/App.jsx` components `AuthOrGuest` and `LayoutGuard`
- Pattern: Wrapper components check Clerk `SignedIn`/`SignedOut` + guest mode; render children or redirect/overlay based on permissions; separate layouts for sidebar vs. no-sidebar routes

**Controller Functions:**
- Purpose: Encapsulate business logic per feature
- Examples: `planController.js`, `flashcardController.js`, `habitController.js`
- Pattern: Async functions wrapped with `asyncHandler` middleware; receive `req.auth.userId`, query Prisma, return JSON; error handling delegated to global error middleware

**API Endpoints:**
- Purpose: Map HTTP verbs + routes to controller functions
- Examples: `server/src/index.js` (50+ routes defined inline)
- Pattern: All protected with `requireAuth` middleware; AI endpoints additionally rate-limited with `aiLimiter`; webhook route (`POST /api/webhooks/clerk`) exempted from JSON parsing (uses raw body)

## Entry Points

**Frontend (Browser):**
- Location: `client/src/main.jsx`
- Triggers: Page load → React mounts root element
- Responsibilities: Initialize ClerkProvider, ThemeProvider, context providers; mount App component; set up i18n

**Frontend App Router:**
- Location: `client/src/App.jsx`
- Triggers: Route navigation via React Router
- Responsibilities: Define route structure (public/auth/layout routes); conditionally render pages; guard routes with Clerk + guest mode logic; mount suspense fallback during code splitting

**Backend Entry Point:**
- Location: `server/src/index.js`
- Triggers: `node src/index.js` or `npm run dev` (nodemon)
- Responsibilities: Create Express app; set up middleware (CORS, rate limiting, JSON parsing); define all 50+ API routes; attach global error handler; listen on port 3000

**Clerk Webhook:**
- Location: `server/src/controllers/webhookController.js` → `POST /api/webhooks/clerk`
- Triggers: Clerk event (user created, deleted, updated)
- Responsibilities: Verify webhook signature with Svix; upsert `UserProfile` with Clerk metadata; trigger guest auto-exit

## Error Handling

**Strategy:** Layered error handling with async wrapper, global middleware, and frontend boundary

**Patterns:**
- **Backend async wrapper:** `asyncHandler` middleware in `server/src/middleware/asyncHandler.js` catches Promise rejections → passes to Express error handler
- **Global error handler:** `server/src/index.js` error middleware (lines 159–163) logs stack trace → returns HTTP status (custom or 500) + JSON error message
- **Frontend error boundary:** `client/src/components/ErrorBoundary.jsx` (class component) catches React errors → displays fallback UI + retry button
- **API error handling:** Controllers validate input (`if (!title)` patterns) → return 400/403/404 with descriptive messages; frontend pages can add catch blocks on fetch calls (not enforced globally)

## Cross-Cutting Concerns

**Logging:**
- Backend: `console.error()` in global error handler; no structured logging framework
- Frontend: Console logs in ErrorBoundary, controllers, contexts; no centralized logging service

**Validation:**
- Backend: Inline checks in controllers (e.g., `if (!title) return res.status(400)...`); no schema validation library (Zod, Joi)
- Frontend: HTML5 form validation (type, required attributes); no client-side schema library

**Authentication:**
- Backend: `ClerkExpressRequireAuth` middleware enforces presence of valid JWT; all protected routes use `requireAuth` wrapper
- Frontend: Clerk SDK handles sign-in UI + token management; `useAuth()` hook provides `getToken()` for requests

**Internationalization (i18n):**
- Framework: react-i18next in `client/src/i18n.js`
- Usage: Translation keys interpolated in JSX with `useTranslation()` hook; supported languages: en, de, uk
- Files: `client/src/locales/{en,de,uk}.json`

**Authorization (Resource Ownership):**
- Pattern: Controllers check `userId` from Clerk JWT matches resource owner before mutations
- Examples: `planController.toggleTask()` verifies `task.module.plan.userId === req.auth.userId`; prevents cross-user data access

---

*Architecture analysis: 2026-03-02*
