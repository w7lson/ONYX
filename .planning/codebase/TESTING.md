# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Not detected — No test framework configured
- No Jest, Vitest, Mocha, or other test runner in `package.json`
- `devDependencies` lists only linting (ESLint) and build tools (Vite, Tailwind) for frontend
- Backend `devDependencies` list only Nodemon and Prisma for development

**Assertion Library:**
- Not applicable — No testing framework in place

**Run Commands:**
- Frontend: No test command exists (only `npm run dev`, `npm run build`, `npm run lint`)
- Backend: No test command exists (only `npm run dev`, `npm start`)

## Test File Organization

**Location:**
- No test files in source tree (only in `node_modules` from dependencies)

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Testing Strategy

**Current State:**
- **No automated tests** — All code is untested
- Manual testing only (implied by lack of test infrastructure)
- This is a known gap listed in CLAUDE.md roadmap ("Stage 3 — Code Quality & Optimization" includes "Testing — Integration tests for API (vitest + supertest), component tests for critical flows")

## Code Coverage

**Requirements:** None enforced

**View Coverage:** Not applicable

## Test Types (Recommendations Based on Architecture)

**Unit Tests (Recommended target):**
- Scope: Individual functions, algorithms, helpers
- Priority targets:
  - `server/src/utils/sm2.js` — Spaced repetition algorithm (critical logic)
  - `server/src/utils/prisma.js` — Database client initialization
  - Input validation in controllers (checking `!title`, `!goalId`)

**Integration Tests (Recommended target):**
- Scope: API endpoints with database
- Tool recommendation: Vitest + Supertest
- Priority endpoints:
  - Auth flow: POST `/api/webhooks/clerk` → creates UserProfile
  - CRUD: POST/GET/PUT/DELETE `/api/decks` with authorization checks
  - AI generation: POST `/api/plans/generate`, POST `/api/tests/generate` (mock Groq)
  - Spaced repetition: POST `/api/cards/:cardId/review` with SM-2 algorithm verification

**Component Tests (Recommended target):**
- Scope: Critical UI components, user interactions
- Tool recommendation: Vitest + React Testing Library
- Priority components:
  - `client/src/components/Onboarding/Quiz.jsx` — Multi-step form with local storage fallback
  - `client/src/components/Habits/HabitChecklist.jsx` — Daily habit completion tracking
  - `client/src/pages/Flashcards.jsx` — Card review flow with SM-2 feedback
  - Auth guards (`AuthOrGuest`, `LayoutGuard` in `App.jsx`)

**E2E Tests:**
- Not used or planned
- Could use Playwright/Cypress for critical user journeys (sign-up → onboarding → create goal → generate plan)

## Mocking Patterns (Observed Practices)

**Framework:** Not formally implemented, but `asyncHandler` middleware provides a pattern for wrapping controllers

**What IS mocked in current code:**
- **Groq API calls** — OpenAI SDK configured to point to Groq: `baseURL: "https://api.groq.com/openai/v1"`
  - Used in: `planController.js`, `habitController.js`, `flashcardController.js`, `testController.js`
  - Recommendation: Mock at test time with recorded responses or fixtures

**What to Mock in tests:**
- Groq API responses (expensive, rate-limited)
- Clerk authentication (token generation, user verification)
- Prisma database calls (use `jest.mock('@prisma/client')` or similar)
- Fetch requests in frontend (use MSW or fetch-mock)

**What NOT to Mock:**
- SM-2 algorithm logic (test actual implementation)
- Database schema relationships (test with real schema or in-memory DB)
- React hooks (use actual hooks, test component behavior not implementation)

## Frontend Testing Patterns

**No tests currently, but following patterns would be expected:**

**Async Testing:**
```javascript
// Example pattern (not currently used):
test('should fetch notifications', async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => {
        expect(result.current.unreadCount).toBe(5);
    });
});
```

**Context Testing:**
```javascript
// Example pattern (not currently used):
test('PomodoroContext updates timer state', () => {
    render(
        <PomodoroProvider>
            <TimerComponent />
        </PomodoroProvider>
    );
    expect(screen.getByText('30:00')).toBeInTheDocument();
});
```

**Error Testing:**
```javascript
// Example pattern (not currently used):
test('should throw error outside provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
        'useTheme must be used within ThemeProvider'
    );
});
```

## Backend Error Handling (Testable)

**Pattern observed in controllers:**
```javascript
// Validation
if (!title) {
    return res.status(400).json({ error: "Title is required" });
}

// Authorization
if (resource.userId !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
}

// Not found
if (!resource) {
    return res.status(404).json({ error: "Resource not found" });
}
```

**Testing approach:**
```javascript
// Example pattern (not currently used):
test('POST /api/decks should return 400 if title missing', async () => {
    const res = await request(app)
        .post('/api/decks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
});
```

## Frontend Testing Patterns (Not Yet Implemented)

**User interaction testing approach:**
```javascript
// Example pattern (not currently used):
test('should toggle task completion', async () => {
    const { getByRole } = render(<TaskCheckbox taskId="123" />);
    const checkbox = getByRole('checkbox');

    await userEvent.click(checkbox);

    expect(mockApiCall).toHaveBeenCalledWith('PATCH', '/api/tasks/123/toggle');
});
```

**Navigation testing approach:**
```javascript
// Example pattern (not currently used):
test('should redirect unauthenticated users from /dashboard', () => {
    render(<App />, { wrapper: (props) => <BrowserRouter {...props} /> });
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
});
```

## Database Testing (Not Yet Implemented)

**Prisma testing approach recommendation:**
```javascript
// Example pattern (not currently used):
beforeEach(async () => {
    // Reset database before each test
    await prisma.deck.deleteMany({});
    await prisma.flashcard.deleteMany({});
});

test('should create deck with cards', async () => {
    const deck = await createDeck(userId, { title: 'Test' });
    const cards = await prisma.flashcard.findMany({ where: { deckId: deck.id } });
    expect(cards).toHaveLength(5);
});
```

## API Testing Recommendations

**Tool:** Supertest (with Vitest)

**Pattern:**
```javascript
// Example (not currently used):
import request from 'supertest';
import app from './src/index.js';

describe('GET /api/plans', () => {
    test('should return user plans with auth', async () => {
        const res = await request(app)
            .get('/api/plans')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('title');
    });

    test('should return 401 without auth', async () => {
        const res = await request(app)
            .get('/api/plans')
            .expect(401);
    });
});
```

## Critical Untested Areas

**High priority for testing:**

1. **Spaced Repetition Algorithm** (`server/src/utils/sm2.js`)
   - 490 lines of complex state transitions
   - Two algorithms (SM-2 and FSRS-5)
   - Directly affects learning effectiveness

2. **Authorization checks**
   - Verify users can't access others' decks/plans/goals
   - Pattern: Every controller checks `resource.userId === userId`

3. **AI generation endpoints**
   - POST `/api/plans/generate`
   - POST `/api/tests/generate`
   - POST `/api/habits/generate`
   - Mock Groq API to avoid rate limits in tests

4. **Flashcard review flow**
   - Creating deck → Adding cards → Reviewing → Submitting ratings → State update
   - End-to-end integration test critical

5. **Habit streaks calculation**
   - `server/src/controllers/habitController.js` — `getStreaks()`
   - Date-based logic, edge cases (timezone, leap years)

6. **Notification triggering**
   - Notifications created after: streak reached, goal completed, test submitted
   - Check `createNotification()` is called in correct scenarios

## Gaps and Recommendations

**What's missing:**
- Test framework setup (recommend Vitest for speed with ES modules)
- Test database (recommend SQLite in-memory or Docker PostgreSQL)
- API mocking (recommend Mock Service Worker for frontend)
- Coverage reporting (recommend Vitest coverage or c8)

**Setup steps (if implementing):**
1. Install Vitest + Supertest + React Testing Library + MSW
2. Create `server/tests/` directory with `.test.js` files
3. Create `client/src/__tests__/` directory with `.test.jsx` files
4. Configure Vitest config file
5. Add `npm run test` and `npm run test:watch` scripts to both packages

---

*Testing analysis: 2026-03-02*
