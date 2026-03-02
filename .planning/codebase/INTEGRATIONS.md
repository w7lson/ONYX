# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**AI Generation:**
- Groq API (llama-3.3-70b-versatile model) - Powers learning plan generation, flashcard creation, test generation, habit suggestion
  - SDK/Client: OpenAI SDK v6.22.0 (configured with Groq baseURL: `https://api.groq.com/openai/v1`)
  - Auth: `GROQ_API_KEY` environment variable
  - Used in: `server/src/controllers/planController.js`, `flashcardController.js`, `testController.js`, `habitController.js`
  - Rate limited to 10 requests per minute on AI endpoints via `express-rate-limit` middleware

**Fonts & Assets:**
- Google Fonts - Outfit font family (weights 400, 500, 600, 700)
  - Loaded in: `client/index.html` with preconnect directives

## Data Storage

**Primary Database:**
- PostgreSQL via Supabase
  - Connection: `DATABASE_URL` (pooled via pgbouncer on port 6543)
  - Direct connection: `DIRECT_URL` (non-pooled on port 5432, for migrations)
  - Client: Prisma ORM v6.19.2
  - Schema location: `server/prisma/schema.prisma`
  - 15 models: UserProfile, LearningPlan, Module, Task, Deck, Flashcard, FlashcardReview, PomodoroSession, Test, TestQuestion, Goal, Milestone, Habit, HabitCompletion, Notification

**File Storage:**
- None configured - Local filesystem only
- User avatars/images come from Clerk provider

**Caching:**
- None - Relies on database queries and Prisma client
- Client context state: PomodoroContext, ThemeContext, NotificationContext, GuestContext (localStorage persistence for theme/language)

## Authentication & Identity

**Auth Provider:**
- Clerk
  - Implementation: JWT Bearer token verification
  - Frontend: ClerkProvider wrapper, useAuth() hook, <UserButton /> component
  - Backend: Clerk Express SDK, ClerkExpressRequireAuth middleware in `server/src/middleware/auth.js`
  - User creation: Webhook-driven via Clerk user.created event
  - Location: `server/src/middleware/auth.js` (middleware), `server/src/controllers/webhookController.js` (user creation)
  - Publishable Key: `CLERK_PUBLISHABLE_KEY` (frontend and backend)
  - Secret Key: `CLERK_SECRET_KEY` (backend only)
  - Webhook Secret: `CLERK_WEBHOOK_SECRET` (webhook signature verification)

## Monitoring & Observability

**Error Tracking:**
- None - Basic console.error logging in controllers and global error handler

**Logs:**
- Console logging via `console.error()`, `console.log()` in controllers and middleware
- Location: `server/src/index.js` (global error handler), all controller files
- Approach: Standard Node.js console output, no structured logging framework

## CI/CD & Deployment

**Hosting:**
- Vercel (detected from git commit history `vercel` commit)
- Can run on any Node.js-compatible platform (Heroku, Railway, Render, etc.)

**CI Pipeline:**
- None detected - No GitHub Actions, Travis CI, or similar

## Environment Configuration

**Required Environment Variables:**

Frontend:
```
VITE_CLERK_PUBLISHABLE_KEY    # Clerk public key for authentication UI
VITE_BASE_PATH (optional)     # Base path for production deployments (default: /ONYX)
```

Backend:
```
DATABASE_URL                  # PostgreSQL connection string (pooled)
DIRECT_URL                    # PostgreSQL connection string (direct, for migrations)
CLERK_SECRET_KEY              # Clerk backend secret
CLERK_PUBLISHABLE_KEY         # Clerk public key
CLERK_WEBHOOK_SECRET          # Webhook signature verification
GROQ_API_KEY                  # Groq API key for AI features
FRONTEND_URL (optional)       # CORS origin (default: http://localhost:5173)
PORT (optional)               # Server port (default: 3000)
```

**Secrets Location:**
- `.env` files in project root (client and server directories) - NEVER committed to git
- `.gitignore` prevents `.env*` from being tracked
- Production: Environment variables set in hosting platform (Vercel, etc.)

## Webhooks & Callbacks

**Incoming Webhooks:**
- `POST /api/webhooks/clerk` - Clerk user lifecycle events
  - Events handled: `user.created` (creates UserProfile in database)
  - Verification: Svix signature verification using `CLERK_WEBHOOK_SECRET`
  - Implementation: `server/src/controllers/webhookController.js`
  - Requires raw body for signature validation (configured in Express middleware)

**Outgoing Webhooks:**
- None configured

## API Request Flow

**Development:**
1. Frontend (Vite on port 5173) makes requests to `/api/*`
2. Vite proxy (configured in `vite.config.js`) forwards to `http://localhost:3000`
3. Backend Express server handles requests on port 3000
4. All protected routes require Bearer token via `requireAuth` middleware

**Production:**
- Frontend static assets served from deployment platform
- API requests go directly to backend URL
- CORS enabled with `origin: process.env.FRONTEND_URL` (prevents cross-origin issues)

## AI Model Configuration

**Groq API Model:**
- Model: `llama-3.3-70b-versatile`
- Provider: Groq (via OpenAI SDK compatibility)
- Uses OpenAI SDK with custom baseURL: `https://api.groq.com/openai/v1`
- Rate limiting: 10 requests per minute on AI generation endpoints
- Used for:
  - Learning plan generation (`generatePlanFromGoal`)
  - Flashcard generation (`generateCards`)
  - AI test generation (`generateTest`)
  - Habit suggestion (`generateHabits`)
  - JSON output format required for structured responses

---

*Integration audit: 2026-03-02*
