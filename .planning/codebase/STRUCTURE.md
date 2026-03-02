# Codebase Structure

**Analysis Date:** 2026-03-02

## Directory Layout

```
ONYXstudy/
├── .planning/
│   └── codebase/               # Analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
├── .git/                       # Git repository
├── .gitignore                  # Git ignore rules
├── CLAUDE.md                   # Project instructions & guidelines
│
├── client/                     # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── App.jsx             # React Router setup, route definitions
│   │   ├── main.jsx            # Entry point, context providers
│   │   ├── index.css           # Global styles
│   │   ├── i18n.js             # i18next configuration
│   │   │
│   │   ├── pages/              # Page components (1 per route)
│   │   │   ├── Landing.jsx      # Public landing page
│   │   │   ├── Onboarding.jsx   # 6-step preference quiz
│   │   │   ├── Dashboard.jsx    # Home page (habits-centric, habits-only for guests)
│   │   │   ├── Plans.jsx        # Learning plans with task checkboxes
│   │   │   ├── Learning.jsx     # 6 study technique cards
│   │   │   ├── Flashcards.jsx   # Deck list, review UI
│   │   │   ├── Pomodoro.jsx     # 3 timer designs, session history
│   │   │   ├── Tests.jsx        # Test list, test-taking, results
│   │   │   ├── Goals.jsx        # Goal CRUD, milestone management
│   │   │   ├── Progress.jsx     # Stats dashboard with Recharts
│   │   │   ├── Profile.jsx      # User info, preference editor, sign-out
│   │   │   ├── Notifications.jsx # Notification list with grouping
│   │   │   └── Settings.jsx     # Language + theme selector
│   │   │
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx    # Sidebar + header wrapper (authenticated pages)
│   │   │
│   │   ├── components/          # Reusable & feature-specific components
│   │   │   ├── Sidebar.jsx      # Collapsible navigation (Framer Motion)
│   │   │   ├── ErrorBoundary.jsx # React error boundary
│   │   │   ├── GuestRestrictionOverlay.jsx # Sign-up CTA for guests
│   │   │   ├── WelcomeGuide.jsx # Multi-phase onboarding overlay
│   │   │   │
│   │   │   ├── ui/              # Reusable UI primitives
│   │   │   │   └── [...components]
│   │   │   │
│   │   │   ├── Flashcards/      # Flashcard-specific components
│   │   │   │   ├── DeckList.jsx
│   │   │   │   ├── DeckDetail.jsx
│   │   │   │   ├── FlashcardFlip.jsx    # 3D flip animation
│   │   │   │   └── ReviewMode.jsx
│   │   │   │
│   │   │   ├── Habits/          # Habit-specific components
│   │   │   │   ├── HabitChecklist.jsx   # Today's habits with toggles
│   │   │   │   ├── HabitCreateModal.jsx # Create/edit form
│   │   │   │   ├── HabitList.jsx        # Full habit list
│   │   │   │   ├── StreakDisplay.jsx    # Streak counter
│   │   │   │   └── AIHabitSuggestions.jsx # AI-generated suggestions
│   │   │   │
│   │   │   ├── Goals/           # Goal-specific components
│   │   │   │   ├── GoalSpecify.jsx      # Goal text input
│   │   │   │   ├── FocusSelector.jsx    # Category selection
│   │   │   │   ├── MilestoneList.jsx    # Milestone editor with reordering
│   │   │   │   └── GoalSidebar.jsx      # Details panel
│   │   │   │
│   │   │   ├── Pomodoro/        # Pomodoro-specific components
│   │   │   │   ├── TimerCircular.jsx    # Circular timer design
│   │   │   │   ├── TimerDigital.jsx     # Digital display
│   │   │   │   ├── TimerMinimal.jsx     # Minimal design
│   │   │   │   └── SessionHistory.jsx   # Past sessions list
│   │   │   │
│   │   │   ├── Tests/           # Test-specific components
│   │   │   │   ├── TestList.jsx         # All tests overview
│   │   │   │   ├── TestTaking.jsx       # Question-by-question UI
│   │   │   │   └── TestResults.jsx      # Score breakdown
│   │   │   │
│   │   │   ├── Plans/           # Plan-specific components
│   │   │   │   └── [...components]
│   │   │   │
│   │   │   ├── Learning/        # Learning page components
│   │   │   │   └── TechniqueCard.jsx    # Technique accordion
│   │   │   │
│   │   │   └── Onboarding/      # Onboarding flow components
│   │   │       ├── Quiz.jsx             # 6-step preference form
│   │   │       └── [...other phases]
│   │   │
│   │   ├── contexts/            # Global state providers
│   │   │   ├── ThemeContext.jsx        # Dark/light theme (currently hardcoded dark)
│   │   │   ├── PomodoroContext.jsx     # Global timer state
│   │   │   ├── NotificationContext.jsx # Unread count polling
│   │   │   ├── GuestContext.jsx        # Guest mode flag
│   │   │   └── ToastContext.jsx        # Toast notifications
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── [hook implementations]
│   │   │
│   │   ├── data/                # Static data, constants
│   │   │   └── [...data files]
│   │   │
│   │   ├── locales/             # i18n translation files
│   │   │   ├── en.json          # English strings
│   │   │   ├── de.json          # German strings
│   │   │   └── uk.json          # Ukrainian strings
│   │   │
│   │   ├── styles/              # CSS modules (if applicable)
│   │   │
│   │   └── assets/              # Images, icons, etc.
│   │
│   ├── public/                  # Static assets (favicon, manifest)
│   ├── dist/                    # Build output (generated)
│   ├── package.json             # npm dependencies
│   ├── package-lock.json        # Dependency lock
│   ├── vite.config.js           # Vite configuration (proxies /api to :3000)
│   └── tailwind.config.js       # Tailwind CSS config
│
└── server/                      # Express backend (ES modules)
    ├── src/
    │   ├── index.js             # Express app entry, route definitions (50+ endpoints)
    │   │
    │   ├── controllers/         # Business logic per feature
    │   │   ├── planController.js        # Plan generation (Groq AI), CRUD, task toggle
    │   │   ├── flashcardController.js   # Deck/card CRUD, SM-2 review, AI generation
    │   │   ├── pomodoroController.js    # Session save/fetch
    │   │   ├── testController.js        # Test generation, submission, grading
    │   │   ├── goalController.js        # Goal CRUD, milestone management
    │   │   ├── habitController.js       # Habit CRUD, AI generation, completion, streaks
    │   │   ├── preferencesController.js # Save/get/update onboarding preferences
    │   │   ├── notificationController.js# Notification CRUD, mark read, createNotification helper
    │   │   ├── progressController.js    # Aggregated stats (overview, weekly, study time, scores)
    │   │   └── webhookController.js     # Clerk webhook handler (user creation)
    │   │
    │   ├── middleware/
    │   │   ├── auth.js                  # Clerk JWT verification (requireAuth wrapper)
    │   │   └── asyncHandler.js          # Promise rejection wrapper for async controllers
    │   │
    │   ├── utils/
    │   │   ├── sm2.js                   # SM-2 & FSRS spaced repetition algorithms
    │   │   └── prisma.js                # Singleton Prisma client instance
    │   │
    │   └── routes/                      # (Empty in current implementation)
    │       └── [routes would go here if decoupled]
    │
    ├── prisma/
    │   └── schema.prisma                # Database schema (15 models)
    │
    ├── package.json             # npm dependencies
    ├── package-lock.json        # Dependency lock
    └── .env.example             # Example env vars (DATABASE_URL, CLERK_*, GROQ_API_KEY)
```

## Directory Purposes

**`client/`:**
- Purpose: React frontend application
- Contains: Pages, components, contexts, i18n, Vite build config
- Key files: `App.jsx` (routes), `main.jsx` (providers), pages/ (13 routes)

**`server/`:**
- Purpose: Express REST API backend
- Contains: Controllers (business logic), middleware, Prisma ORM, Groq integration
- Key files: `index.js` (routes & Express setup), controllers/ (feature logic), `prisma/schema.prisma` (DB schema)

**`client/src/pages/`:**
- Purpose: Page-level components (1:1 with routes)
- Contains: 13 page components (Landing, Dashboard, Onboarding, Plans, etc.)

**`client/src/components/`:**
- Purpose: Reusable & feature-specific components
- Contains: Sidebar, layouts, feature folders (Flashcards/, Habits/, Goals/, etc.), UI primitives

**`client/src/contexts/`:**
- Purpose: Global state management via React Context API
- Contains: 5 context providers (Theme, Pomodoro, Notifications, Guest, Toast)

**`client/src/locales/`:**
- Purpose: i18n translation strings
- Contains: JSON files for en, de, uk languages

**`server/src/controllers/`:**
- Purpose: Business logic per feature
- Contains: 9 controller modules, each exporting 3–10 async functions

**`server/prisma/`:**
- Purpose: Database schema & migrations
- Contains: `schema.prisma` (15 models, relationships, indexes)

## Key File Locations

**Entry Points:**

| File | Purpose |
|------|---------|
| `client/src/main.jsx` | React app entry; mounts root element; wraps App with context providers |
| `client/src/App.jsx` | Route definitions; auth guards; page lazy loading |
| `server/src/index.js` | Express app; middleware setup; 50+ endpoint definitions |

**Configuration:**

| File | Purpose |
|------|---------|
| `client/vite.config.js` | Vite build config; proxies `/api` to `http://localhost:3000` |
| `client/tailwind.config.js` | Tailwind CSS theme (colors, spacing, etc.) |
| `server/prisma/schema.prisma` | Database schema; defines 15 models |
| `CLAUDE.md` | Project instructions, stack overview, feature list |

**Core Logic:**

| File | Purpose |
|------|---------|
| `server/src/controllers/planController.js` | Learning plan generation (Groq AI), module/task CRUD |
| `server/src/controllers/flashcardController.js` | Spaced repetition, deck/card CRUD, SM-2 scheduling |
| `server/src/controllers/habitController.js` | Daily habits, completion tracking, streaks, AI generation |
| `server/src/controllers/testController.js` | AI test generation, submission, auto-grading |
| `server/src/controllers/goalController.js` | Goal CRUD, milestone management |
| `server/src/utils/sm2.js` | SM-2 & FSRS spaced repetition algorithms |

**Context & State:**

| File | Purpose |
|------|---------|
| `client/src/contexts/PomodoroContext.jsx` | Global pomodoro timer state; syncs completed sessions to API |
| `client/src/contexts/NotificationContext.jsx` | Polls unread notification count every 60s |
| `client/src/contexts/GuestContext.jsx` | Guest mode flag; auto-exits on sign-in |
| `client/src/contexts/ThemeContext.jsx` | Dark/light theme provider (hardcoded to dark currently) |

**Testing:**

| File | Purpose |
|------|---------|
| None detected | No test files found in codebase (gap identified) |

## Naming Conventions

**Files:**

- **Pages:** PascalCase, matches route name — e.g., `Dashboard.jsx`, `Flashcards.jsx`, `Goals.jsx`
- **Components:** PascalCase, descriptive — e.g., `HabitChecklist.jsx`, `TimerCircular.jsx`, `GoalSidebar.jsx`
- **Contexts:** PascalCase + "Context" suffix — e.g., `ThemeContext.jsx`, `PomodoroContext.jsx`
- **Controllers:** camelCase + "Controller" suffix — e.g., `planController.js`, `habitController.js`
- **Utilities:** camelCase — e.g., `sm2.js`, `prisma.js`
- **Middleware:** camelCase — e.g., `auth.js`, `asyncHandler.js`

**Directories:**

- **Feature folders:** PascalCase plural — e.g., `Flashcards/`, `Habits/`, `Goals/`, `Pomodoro/`
- **Service folders:** lowercase — e.g., `controllers/`, `middleware/`, `utils/`, `contexts/`, `locales/`

## Where to Add New Code

**New Page/Route:**
- Create `client/src/pages/FeatureName.jsx`
- Add route in `client/src/App.jsx` (within `<Routes>`, decide if needs sidebar layout or not)
- If needs layout, wrap with `<LayoutGuard>` + `<AuthOrGuest>`; if public/no-sidebar, add outside `<LayoutGuard>`

**New Feature (e.g., Quizzes):**
- Backend: Create `server/src/controllers/quizController.js` with CRUD functions
- Backend: Add routes to `server/src/index.js` (import controller functions, define `app.get/post/put/delete`)
- Database: Add models to `server/prisma/schema.prisma`; run `npx prisma db push`; run `npx prisma generate`
- Frontend: Create `client/src/pages/Quizzes.jsx` page component
- Frontend: Create `client/src/components/Quizzes/` folder for feature-specific components
- Frontend: Add Sidebar nav entry in `client/src/components/Sidebar.jsx`

**New Component:**
- Reusable component (used in multiple pages): `client/src/components/ComponentName.jsx`
- Feature-specific component: `client/src/components/FeatureName/ComponentName.jsx`

**Global State (new context):**
- Create `client/src/contexts/FeatureContext.jsx` with `createContext`, provider, and hook
- Wrap app in `client/src/main.jsx` (add provider after other providers)
- Export hook, use in components with `const { state } = useFeature()`

**Utilities / Helpers:**
- Shared utilities (used by multiple controllers): `server/src/utils/featureName.js`
- Shared hooks (used by multiple components): `client/src/hooks/useFeatureName.js`

**Styles:**
- Global CSS: `client/src/index.css`
- Component scoped: Use Tailwind classes directly in JSX (no separate CSS files)
- Theme variables: `client/tailwind.config.js`

## Special Directories

**`client/dist/`:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (excluded in `.gitignore`)

**`server/node_modules/`, `client/node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (excluded in `.gitignore`)

**`.planning/codebase/`:**
- Purpose: Codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, TESTING.md, CONVENTIONS.md, CONCERNS.md, STACK.md, INTEGRATIONS.md)
- Generated: Manually by GSD mapper tool
- Committed: Yes (version controlled)

**`client/public/`:**
- Purpose: Static assets (favicon, manifest, logo)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-02*
