# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**
- Components: `PascalCase.jsx` — e.g., `Dashboard.jsx`, `HabitChecklist.jsx`
- Context/hooks: `PascalCase.jsx` — e.g., `ThemeContext.jsx`, `PomodoroContext.jsx`
- Utils/helpers: `camelCase.js` — e.g., `sm2.js`, `prisma.js`
- Controllers: `camelCaseController.js` — e.g., `planController.js`, `habitController.js`
- Middleware: `camelCase.js` — e.g., `asyncHandler.js`, `auth.js`
- Locales: `languageCode.json` — e.g., `en.json`, `de.json`, `uk.json`

**Functions:**
- Async handlers: `camelCase` — e.g., `generatePlanFromGoal`, `toggleTask`, `getTodayHabits`
- Context getters: `useCamelCase()` — e.g., `useTheme()`, `usePomodoro()`, `useNotifications()`
- Helper functions: `camelCase` — e.g., `addDays()`, `clampEF()`, `todayStr()`
- Component exports: Named exports or default export (both used)
- Handler callbacks: `handleCamelCase` — e.g., `handleSelectPreset()`, `handleNext()`, `handleClickOutside()`

**Variables:**
- State: `camelCase` — e.g., `timeLeft`, `isRunning`, `isCompleted`, `dueCards`
- Constants: `UPPER_SNAKE_CASE` — e.g., `DEFAULT_DURATIONS`, `PRESETS`, `QUESTIONS`, `LANGUAGES`, `FSRS5_W`
- Destructured from objects: `camelCase` — e.g., `{ userId } = req.auth`, `{ title, description } = req.body`
- Boolean flags: prefix with `is`/`has`/`should` — e.g., `isGuest`, `isRunning`, `hasError`, `shouldRender`

**Types:**
- JSDoc comment blocks document function signatures and object shapes
- No TypeScript — JavaScript with standard JSDoc
- React Context object shaped as `{ property1, property2, ... }` documented in JSDoc

## Code Style

**Formatting:**
- 2 spaces indentation (observed throughout codebase)
- Semicolons required at statement ends
- No explicit formatter configured (no `.prettierrc` or `prettier` config in use)
- Single quotes used for strings in most files

**Linting:**
- Tool: ESLint 9.39.1
- Config: `client/eslint.config.js` (flat config format)
- Rules enforced:
  - `no-unused-vars`: Error, except `varsIgnorePattern: '^[A-Z_]'` (allows uppercase/underscore variables)
  - `react-hooks/rules-of-hooks`: Recommended
  - `react-hooks/exhaustive-deps`: Recommended
  - `react-refresh/only-export-components`: Vite-specific rule for dev HMR
- Backend has no linting configured (uses default Node.js conventions)

## Import Organization

**Order (observed pattern):**
1. External libraries: `import React from 'react'`, `import { useState } from 'react'`
2. Built-in modules: `import { promises as fs } from 'fs'`
3. Relative imports from parent: `import prisma from '../utils/prisma.js'`
4. Relative imports from siblings: `import { asyncHandler } from '../middleware/asyncHandler.js'`
5. Imports from components: `import Sidebar from '../components/Sidebar'`
6. Style imports: `import './App.css'`

**Path Aliases:**
- Not used. All imports use relative paths (`../`, `./`)
- Backend: ES module imports with `.js` extensions required

**Module Format:**
- Frontend: ES modules (`import`/`export`)
- Backend: ES modules with `import 'dotenv/config'` as first line of entry point (`server/src/index.js`)

## Error Handling

**Patterns:**
- Backend controllers wrapped with `asyncHandler()` middleware to catch promise rejections
  - Location: `server/src/middleware/asyncHandler.js`
  - Pattern: `export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);`
- Error responses use consistent HTTP status codes:
  - `400`: Bad request (missing required fields)
  - `403`: Unauthorized (user doesn't own resource)
  - `404`: Not found (resource doesn't exist)
  - `500`: Server error (global error handler)
- Global error handler in `server/src/index.js`: logs stack trace, returns status + error message
- Frontend: Try-catch blocks in async functions, errors logged to console
  - Example: `NotificationContext.jsx` catches fetch errors silently
  - No toast/UI error notification framework in place (mentioned in CONCERNS)

## Logging

**Framework:** `console`

**Patterns:**
- Backend: `console.error(err.stack)` in global error handler
- Backend: `console.log('Server running on port ${port}')` on startup
- Frontend: `console.error('Error message')` in catch blocks
- No structured logging (no winston/pino)
- No debug namespace pattern

## Comments

**When to Comment:**
- JSDoc blocks for exported functions documenting parameters, return types, and usage
  - Example: `server/src/utils/sm2.js` has extensive JSDoc for `schedule()` and `previewInterval()`
  - Example: `client/src/components/ui/Button.jsx` documents props with JSDoc
- Inline comments for complex algorithm sections
  - Example: SM-2 algorithm sections marked with `// ─── Shared Helpers ───`, `// === SM-2 ===`
- Comments explaining design decisions (e.g., "Webhook route needs raw body for signature verification" in `server/src/index.js`)

**JSDoc/TSDoc:**
- Used selectively, not comprehensive
- Parameter types documented as `@param {type} name`
- Return types documented as `@returns {type}`
- No type annotations in code itself (JavaScript, not TypeScript)

## Function Design

**Size:**
- Controller functions: 15-60 lines (handling request validation → DB query → response)
- Context/hook functions: 50-150 lines (managing state, side effects, callbacks)
- Utility functions: 5-40 lines (small, focused helpers)
- Large files: `PomodoroContext.jsx` (~120 lines), `sm2.js` (~490 lines for algorithm)

**Parameters:**
- Controllers: Receive `(req, res)` from Express
- Async handlers: Wrapped to auto-catch errors
- Context providers: Accept `{ children }` prop
- UI callbacks: Named parameters destructured from object when complex — e.g., `{ type, title, message, link }`

**Return Values:**
- Controllers: Call `res.json(object)` or `res.status(code).json({ error: message })`
- Hooks/context: Return object with state + dispatch functions — e.g., `{ durations, mode, timeLeft, isRunning, ... setTimerDesign, handleSelectPreset, ... }`
- Components: Return JSX
- Utilities: Return computed values or objects — e.g., `schedule()` returns updated card state

## Module Design

**Exports:**
- Controllers: Named exports for each endpoint handler — e.g., `export const getDecks`, `export const createDeck`
- Contexts: Named exports for provider + hook — e.g., `export function ThemeProvider()`, `export function useTheme()`
- Utils: Named exports for public API — e.g., `export function schedule()`, `export function previewInterval()`
- Components: Default export (most common) or named exports
- Middleware: Named exports — e.g., `export const requireAuth`, `export const asyncHandler`

**Barrel Files:**
- Not used. Controllers imported individually in `server/src/index.js` with long import lists
- Example: `import { generatePlanFromGoal, savePlan, ... } from './controllers/planController.js'`
- Locales imported directly: `import en from './locales/en.json'` in `client/src/i18n.js`

**File Organization:**
- Backend: `server/src/` organized by layer (controllers, middleware, utils)
- Frontend: `client/src/` organized by feature (pages, components, contexts, locales)
  - UI components in `client/src/components/ui/` (reusable Button, Input, Card, etc.)
  - Feature components in `client/src/components/` (Sidebar, Onboarding, etc.)
  - Feature-specific components in `client/src/components/[Feature]/` (Goals, Habits, Tests, etc.)

## API Response Format

**Success:**
```javascript
res.json({ field1: value, field2: value, ... })
```

**Error:**
```javascript
res.status(400).json({ error: "Error message" })
```

**Consistent fields:**
- Notifications: Always include `{ id, userId, type, title, message, link, isRead, createdAt }`
- Tasks: Always include `{ id, isCompleted, ... }`
- Decks: Always include `{ id, title, totalCards, dueCards, ... }`

## Context API Patterns

**Provider pattern (consistent across all contexts):**
```javascript
// 1. Create context
const MyContext = createContext();

// 2. Export provider component
export function MyProvider({ children }) {
    const [state, setState] = useState(...);
    const value = { state, setState, /* handlers */ };
    return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// 3. Export custom hook
export function useMyContext() {
    const context = useContext(MyContext);
    if (!context) throw new Error('must be used within MyProvider');
    return context;
}
```

## React Component Patterns

**Functional components:**
- All components are functional (no class components)
- Use hooks for state, effects, context
- Destructure props in function signature: `export default function Dashboard({ prop1, prop2 })`
- or accept implicit props and destructure inside: `const { isGuest } = useGuest()`

**Prop patterns:**
- UI components accept flexible styling: `className` prop (Tailwind classes combined in strings)
- Container components pass multiple props (e.g., Button accepts `variant`, `size`, `loading`, `disabled`, `leftIcon`, `rightIcon`)

**Side effects:**
- Use `useEffect()` for data fetching, timers, event listeners
- Always return cleanup function for subscriptions: `return () => clearInterval(intervalRef.current)`
- Dependencies array critical: `[isRunning, timeLeft]` for timer, `[getToken, isSignedIn]` for auth

**Conditional rendering:**
- Ternary operators for simple branches: `{isGuest ? <GuestDashboard /> : <UserDashboard />}`
- `&&` operator for presence checks: `{unreadCount > 0 && <Badge />}`
- Early returns for guards (used in pages, not JSX)

---

*Convention analysis: 2026-03-02*
