# Codebase Concerns

**Analysis Date:** 2026-03-02

## Tech Debt

**Placeholder Email Addresses in upserts:**
- Issue: Multiple controllers use placeholder emails `${userId}@placeholder.com` when upserting UserProfile. This creates invalid email records in the database that don't correspond to actual user emails retrieved from Clerk.
- Files: `server/src/controllers/planController.js:163`, `server/src/controllers/flashcardController.js:54`, `server/src/controllers/testController.js:22`, `server/src/controllers/goalController.js:16`, `server/src/controllers/pomodoroController.js:15`, `server/src/controllers/habitController.js:86`, `server/src/controllers/preferencesController.js:25`
- Impact: Database integrity issue—email field becomes unreliable for user identification. If email is used for recovery/notifications, legitimate emails are lost. Complicates user deduplication.
- Fix approach: Email should be retrieved from Clerk webhook at user creation time and stored once. Controllers should assume UserProfile already exists (created by webhook) rather than upserting with placeholder data. Add initialization logic to ensure profile exists before data operations.

**No Input Validation/Sanitization:**
- Issue: No validation library (zod/joi) used. Request bodies are accepted directly with minimal checks—only presence of required fields validated.
- Files: All controller files (e.g., `server/src/controllers/planController.js`, `server/src/controllers/flashcardController.js`, `server/src/controllers/testController.js`)
- Impact: Malformed data can corrupt database. Large payloads accepted without limits. Invalid JSON types accepted. Edge cases (negative numbers, empty strings, SQL-like patterns) not caught.
- Fix approach: Implement schema validation on all POST/PUT/PATCH endpoints using zod. Example: validate that `durationMin` is positive integer, that text fields have length limits, that arrays have max sizes.

**Bare JSON.parse() Without Error Handling:**
- Issue: Multiple AI completion responses parsed without try-catch, relying on asyncHandler to catch errors.
- Files: `server/src/controllers/planController.js:147`, `server/src/controllers/testController.js:54`, `server/src/controllers/flashcardController.js:219`, `server/src/controllers/habitController.js:71`
- Impact: Malformed AI responses (incomplete JSON, hallucinated format) crash endpoints. Users lose in-progress requests. No user-friendly error feedback.
- Fix approach: Wrap JSON.parse in try-catch, validate structure before returning to client. Return 400 with "AI response format error" instead of 500.

**Global Error Handler Only in Main Index:**
- Issue: Error handler is basic and only logs to console. No error tracking, no structured logging.
- Files: `server/src/index.js:159-163`
- Impact: Errors in production are invisible. No way to debug production issues. Stack traces lost.
- Fix approach: Integrate error tracking (e.g., Sentry) or structured logging (e.g., Winston/Pino). At minimum, log errors with context (userId, endpoint, timestamp).

**Inconsistent Async Error Handling:**
- Issue: asyncHandler catches promise rejections, but some fire-and-forget promises use `.catch(console.error)` which silently logs without propagating.
- Files: `server/src/controllers/planController.js:207`, `server/src/controllers/testController.js:138`, `server/src/controllers/goalController.js:121,130`, `server/src/controllers/habitController.js:218`
- Impact: Notification creation failures are hidden. Users don't know if their achievement triggered notifications.
- Fix approach: Use asyncHandler for all async operations or implement a proper queue system for notifications.

**No Database Indexes on Query-Heavy Fields:**
- Issue: Schema has only one index on flashcards. Queries on userId, status, dates have no indexes.
- Files: `server/prisma/schema.prisma`
- Impact: Database queries degrade as user data grows. Progress endpoints and notification fetches will slow down. Risk of hitting query timeouts at scale.
- Fix approach: Add indexes: `@@index([userId])` on Habit, Goal, Test, LearningPlan; `@@index([userId, isArchived])` on Deck; `@@index([userId, completedAt])` on PomodoroSession.

**No Rate Limiting on Non-AI Endpoints:**
- Issue: Only AI endpoints (generate, generate flashcards) have rate limiter. CRUD operations not rate-limited.
- Files: `server/src/index.js:17-23` (rate limiter only on lines 73, 95, 109, 134)
- Impact: Users could spam delete/create operations (e.g., delete all decks, spam test generation). No brute-force protection.
- Fix approach: Apply middleware rate limiter to all POST/DELETE endpoints, separate limits for different operations (e.g., 100/min for CRUD, 10/min for AI).

---

## Security Considerations

**Placeholder Emails Enable Email Spoofing:**
- Risk: If notification system uses email field, attacker could create profile, spoof a real user's email via placeholder pattern.
- Files: `server/src/controllers/preferencesController.js:25` (and others)
- Current mitigation: Clerk auth prevents user impersonation. But database audit trails become unreliable.
- Recommendations: Replace all `${userId}@placeholder.com` with actual Clerk email immediately. Validate email uniqueness constraint in schema.

**No CORS Restriction on Credentials:**
- Risk: Frontend proxies `/api` requests with Bearer tokens. If CORS allows wildcard or wrong origin, cross-origin code can steal tokens.
- Files: `server/src/index.js:11-14`
- Current mitigation: `credentials: true` is set, which is correct, but origin is environment-based and defaults to localhost.
- Recommendations: Ensure `FRONTEND_URL` env var is set correctly in production. Add validation to reject invalid origins. Test CORS headers in production.

**No Protection Against JSON Bomb/Billionlaughs:**
- Risk: No body size limit. Clients could POST massive JSON (10GB+) causing DoS.
- Files: `server/src/index.js:33` (express.json() without limit)
- Current mitigation: None.
- Recommendations: Add `express.json({ limit: '10mb' })` to prevent accidental/malicious large payloads.

**Webhook Signature Verification Present but Error Handling Weak:**
- Risk: If webhook verification fails, endpoint returns 400 but logs to console only.
- Files: `server/src/controllers/webhookController.js:35-36`
- Current mitigation: Svix library handles crypto verification correctly.
- Recommendations: Log webhook failures with full context (headers, body hash). Monitor for repeated failures (possible replay attack).

**No API Key Rotation for Groq:**
- Risk: `GROQ_API_KEY` hardcoded in environment. If leaked, attacker has unlimited access to AI endpoints.
- Files: All controllers using OpenAI client
- Current mitigation: API key in .env file (not committed), but shared across all users.
- Recommendations: Implement per-user API quota tracking. Consider proxy pattern: app calls Groq on behalf of users rather than exposing key.

---

## Performance Bottlenecks

**N+1 Query Problem in Progress Endpoints:**
- Problem: `getWeeklyActivity` runs 4 separate queries (one per data type) instead of aggregating.
- Files: `server/src/controllers/progressController.js:70-100`
- Cause: Each metric fetches independently; could use single aggregation query.
- Improvement path: Use Prisma aggregations or raw SQL to fetch all metrics in one query. Measure: should reduce from ~4 DB round-trips to 1.

**Notification Polling Every 60 Seconds:**
- Problem: Frontend polls unread count every 60 seconds regardless of activity.
- Files: `client/src/contexts/NotificationContext.jsx:34`
- Cause: No websocket or event-driven updates. Causes unnecessary DB queries.
- Improvement path: Reduce polling to 5 minutes for inactive users or implement server-sent events (SSE). Add debouncing to defer polling if user is idle.

**No Pagination on Large Lists:**
- Problem: Endpoints return all records (e.g., `getNotifications` defaults to 50 but no hard limit; `getDeckCards` returns all cards in deck).
- Files: `server/src/controllers/notificationController.js:13,21`, `server/src/controllers/flashcardController.js:92-95`
- Cause: No cursor-based pagination. Large decks/history lists load everything into memory.
- Improvement path: Implement cursor pagination on all list endpoints. For decks with 1000+ cards, memory usage becomes a problem.

**AI Generation Blocks Request Until Completion:**
- Problem: Plan, test, flashcard generation calls Groq synchronously. User waits for full API response (can be 5-30s).
- Files: `server/src/controllers/planController.js:138-149`, `server/src/controllers/testController.js:45-52`
- Cause: No async job queue. Blocks request handling.
- Improvement path: Implement job queue (BullMQ, etc.). Return 202 Accepted with job ID. Client polls for completion or uses websocket updates.

**SM-2 Algorithm Recalculation on Every Review:**
- Problem: `schedule()` function recalculates state from scratch on every card review.
- Files: `server/src/utils/sm2.js` (entire file)
- Cause: No memoization. If user reviews 100 cards, SM-2 logic runs 100 times.
- Improvement path: Cache algorithm output per card. Pre-calculate next review batch at deck level.

---

## Fragile Areas

**Goal-Plan Relationship (Soft Delete Risk):**
- Files: `server/prisma/schema.prisma:41`, `server/src/controllers/planController.js:166-171`
- Why fragile: Unique constraint `goalId` on LearningPlan means one plan per goal. Code deletes old plan before creating new one (`savePlan` at line 169). If insertion fails mid-transaction, user loses both old and new plan.
- Safe modification: Use Prisma `$transaction()` to wrap both delete and create, or use `upsert` if goalId should always update. Add tests for plan regeneration edge case.
- Test coverage: No tests for plan regeneration. If there's a race condition (user generates plan twice), one plan could be lost.

**Milestone Ordering Without Transaction:**
- Files: `server/src/controllers/planController.js:329-333`
- Why fragile: `reorderModules` updates each module order in separate transaction. If crash between updates, modules end up with partial/duplicate ordering.
- Safe modification: All updates must be in single `$transaction()` block (already done, but no atomicity guarantee if one fails).
- Test coverage: No test for reorder with errors. What happens if one module update fails mid-list?

**Flashcard Algorithm Switching (State Mismatch Risk):**
- Files: `server/src/controllers/flashcardController.js:335-362`, `server/prisma/schema.prisma:94-115`
- Why fragile: User can switch deck algorithm from SM-2 to FSRS. Existing card state fields (stepIndex, easeFactor) are SM-2-specific and invalid for FSRS. `schedule()` function has branching logic but no validation that current state matches selected algorithm.
- Safe modification: Add validation in `updateDeckSettings`: if algorithm changes, reset all cards to `state: 'new'` to avoid interpreting SM-2 state as FSRS state.
- Test coverage: No test for algorithm switching impact on existing cards.

**Habit Frequency Logic (Weekly Days Not Validated):**
- Files: `server/src/controllers/habitController.js:15-27`
- Why fragile: `isDueToday()` checks if day of week is in `habit.daysOfWeek` array, but no validation that daysOfWeek contains valid values (0-6) or is a valid array. If malformed, logic silently returns `true`.
- Safe modification: Validate daysOfWeek in `createHabit` endpoint. Ensure it's array of integers 0-6. Return 400 if invalid.
- Test coverage: No tests for edge cases (empty daysOfWeek, invalid day numbers, null daysOfWeek).

---

## Test Coverage Gaps

**Zero Unit/Integration Tests:**
- What's not tested: All API endpoints, all controller logic, Prisma queries, SM-2 algorithm, error cases.
- Files: No test files exist (checked: no .test.js or .spec.js files)
- Risk: Changes to planController could break hidden dependencies. SM-2 algorithm has complex logic with no tests for edge cases (0 easeFactor, negative intervals, etc.).
- Priority: High—backend is untested and handles critical user data.

**No Frontend Component Tests:**
- What's not tested: React components (GoalSpecify, DeckDetail, etc.), form validation, error handling.
- Files: All client/src/components/*.jsx and client/src/pages/*.jsx have no tests.
- Risk: Regressions in UI go unnoticed. Complex components like GoalSpecify (587 lines) have unmeasured test coverage.
- Priority: Medium—breaks are visible in development, but QA burden is high.

**No E2E Tests:**
- What's not tested: User flows (sign-up → onboarding → create goal → generate plan). Clerk auth integration. API proxy in dev.
- Risk: End-to-end flows could be broken without detection. Auth middleware changes could silently break protected routes.
- Priority: Medium-High—critical user paths untested.

---

## Scaling Limits

**Database Connection Pool (Supabase):**
- Current capacity: Default Prisma pool is 10 connections (production might have more).
- Limit: With N concurrent users, each opening ~2-3 DB connections, pool exhausts at ~300-500 concurrent users.
- Scaling path: Monitor Prisma pool usage. Configure `connection_limit` and `idle_timeout` in `DATABASE_URL`. Implement connection pooling proxy (PgBouncer) between app and Supabase.

**AI Generation Queue (Synchronous Blocking):**
- Current capacity: Each Groq request blocks 1 request handler. Express with default 10 workers can handle ~10 concurrent AI requests.
- Limit: If 15 users try to generate plans simultaneously, 5+ requests queue in OS socket backlog and timeout after 60s.
- Scaling path: Implement async job queue (BullMQ + Redis or similar). Decouple AI requests from HTTP request cycle.

**Notification Polling Load:**
- Current capacity: 1000 users polling every 60s = ~17 requests/sec to `/api/notifications/unread-count`.
- Limit: Each query counts notifications per user. At 10K users, this becomes 167 requests/sec, overwhelming database.
- Scaling path: Implement counter caching. When notification created, increment Redis counter. Polling reads cache instead of DB.

**File Export (CSV Generation):**
- Current capacity: `exportDeck` generates CSV in-memory. A deck with 100K cards (~50MB CSV) could cause OOM.
- Limit: Large CSV files hang server; can trigger out-of-memory restart.
- Scaling path: Stream CSV response instead of buffering. Use Readable stream and write to response incrementally.

---

## Dependencies at Risk

**OpenAI SDK for Groq API:**
- Risk: Using OpenAI SDK as client for Groq (non-standard use). Groq is not officially OpenAI-compatible, relying on undocumented compatibility.
- Impact: Groq API changes could break all AI features. SDK version bumps might drop Groq support.
- Migration plan: Switch to official Groq SDK (@groq/sdk) if available, or implement direct REST client to reduce coupling.

**Clerk Webhook Event Handling:**
- Risk: Code only handles `user.created` event. If Clerk adds required events (e.g., `user.deleted`) or deprecates event format, code silently ignores them.
- Impact: User deletion not handled—orphaned records remain in DB.
- Migration plan: Add `user.deleted` handler to clean up UserProfile, goals, habits, etc. Add version checking for webhook format.

---

## Missing Critical Features

**Soft Delete/Data Archiving:**
- Problem: `DELETE` endpoints physically remove data (e.g., `deleteTest`, `deleteDeck`). No undo. Users can lose months of study history with one click.
- Blocks: Full data recovery. Compliance with data retention policies.
- Recommendation: Implement soft delete pattern: add `isDeleted` or `archivedAt` field to deletable models. Mark as deleted instead of removing. Provide recovery UI or 30-day grace period.

**Offline Support / Sync:**
- Problem: App requires live API connection. Offline data changes (e.g., habit completion on airplane) are lost.
- Blocks: Mobile users, users in areas with spotty connectivity.
- Recommendation: Implement local-first storage (IndexedDB or SQLite on React Native). Sync changes when online.

**Data Export (Except CSV):**
- Problem: Users can export decks as CSV only. No export for goals, habits, plans, progress history.
- Blocks: User data portability. Switching study apps loses history.
- Recommendation: Add JSON export endpoints for all models. Bundle as full data archive.

---

## Known Issues

**Placeholder Emails Create Non-Unique Email Constraint Risk:**
- Symptoms: If two users sign up with same ID pattern (unlikely but possible in dev), upsert tries to create duplicate emails, violating unique constraint.
- Files: `server/prisma/schema.prisma:14` (email unique constraint), all upsert calls
- Trigger: Concurrent sign-ups with webhook race condition
- Workaround: Currently no workaround; issue is in code design.

**Notification API Accepts Invalid `unreadOnly` Query Parameter:**
- Symptoms: `GET /api/notifications?unreadOnly=false` returns all notifications (expected) but `unreadOnly=0` also works, interpreted as falsy string.
- Files: `server/src/controllers/notificationController.js:16`
- Trigger: Client passes wrong type (`unreadOnly === 'true'` string comparison)
- Workaround: Always pass boolean string ('true'/'false') or implement strict type checking.

---

*Concerns audit: 2026-03-02*
