# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**
- JavaScript (ES2020+) - Frontend and backend code
- JSX/TSX - React components in client
- SQL - Prisma ORM queries to PostgreSQL

**Secondary:**
- JSON - Configuration, translations, data fixtures
- CSS/Tailwind - Styling via Tailwind CSS v4

## Runtime

**Environment:**
- Node.js v23.7.0
- npm v11.1.0

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present in both `client/` and `server/`

## Frameworks

**Core:**
- React 19.2.0 - UI framework (client/)
- Express 5.2.1 - HTTP API server (server/)

**UI & Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/vite 4.1.18 - Vite plugin for Tailwind
- Framer Motion 12.34.0 - Animation library for React components
- Lucide React 0.564.0 - Icon library

**Routing & Navigation:**
- React Router DOM 7.13.0 - Client-side routing

**Data Management:**
- Prisma 6.19.2 - ORM for PostgreSQL
- @prisma/client 6.19.2 - Generated Prisma client
- Axios 1.13.5 - HTTP client for API calls

**Internationalization:**
- i18next 25.8.10 - i18n framework
- react-i18next 16.5.4 - React binding for i18next

**Authentication:**
- @clerk/clerk-react 5.60.1 - Clerk auth UI components (client)
- @clerk/clerk-sdk-node 4.13.23 - Clerk backend verification (server)

**Charting & Visualization:**
- recharts 3.7.0 - React charting library for progress dashboard

**AI Integration:**
- openai 6.22.0 - OpenAI SDK (used with Groq API via custom baseURL)

**Webhooks:**
- svix 1.85.0 - Webhook verification (Clerk webhook signature validation)

**Middleware & Utilities:**
- cors 2.8.6 - Cross-origin resource sharing for Express
- express-rate-limit 8.2.1 - Rate limiting middleware
- dotenv 17.3.1 - Environment variable loading

**Testing & Development:**
- nodemon 3.1.11 - Auto-reload server during development
- vite 7.3.1 - Frontend build tool and dev server

## Build Tools

**Frontend:**
- Vite 7.3.1 - Build tool with dev server and HMR
- @vitejs/plugin-react 5.1.1 - Vite React plugin with JSX compilation
- ESLint 9.39.1 - Code linting
- @eslint/js 9.39.1 - ESLint recommended config
- eslint-plugin-react-hooks 7.0.1 - React hooks linting rules
- eslint-plugin-react-refresh 0.4.24 - Vite React refresh linting

**Backend:**
- Node.js native modules - No additional build tool (ES modules via `"type": "module"` in package.json)

## Configuration

**Environment Variables:**

**Client:**
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key for authentication UI
- `VITE_BASE_PATH` - Base path for deployments (default: `/ONYX`)

**Server:**
- `DATABASE_URL` - PostgreSQL connection string with pgbouncer connection pooling
- `DIRECT_URL` - PostgreSQL direct connection (non-pooled, used by Prisma for migrations)
- `CLERK_SECRET_KEY` - Clerk secret for backend verification
- `CLERK_PUBLISHABLE_KEY` - Clerk public key (also used server-side)
- `CLERK_WEBHOOK_SECRET` - Webhook signature verification from Svix
- `GROQ_API_KEY` - API key for Groq (llama-3.3-70b-versatile model)
- `FRONTEND_URL` - Frontend origin for CORS (default: `http://localhost:5173`)
- `PORT` - Server port (default: 3000)

**Build Configuration:**

Frontend:
- `vite.config.js` - Vite configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint flat config with React hooks and refresh rules
- `tailwindcss` integrated via Vite plugin (no separate config file)

Backend:
- ES modules enabled via `"type": "module"` in `package.json`
- `dotenv` imported as first statement in `src/index.js` for immediate env loading

## Platform Requirements

**Development:**
- Node.js v18+ (tested with v23.7.0)
- npm v8+ (tested with v11.1.0)
- Git for version control
- UNIX-like environment (macOS/Linux) or WSL2 on Windows

**Production:**
- Node.js v18+ runtime
- PostgreSQL 12+ (via Supabase)
- Clerk account for auth management
- Groq API account for AI features
- Vercel or Node.js-compatible hosting for both server and client

**Database:**
- PostgreSQL 12+ hosted on Supabase
- Connection pooling via pgbouncer (DATABASE_URL with pooling)
- Direct connection available for migrations (DIRECT_URL)

---

*Stack analysis: 2026-03-02*
