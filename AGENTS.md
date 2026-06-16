# AGENTS.md — FitTrack Frontend (guidance for AI coding agents)

Purpose
- Provide focused, actionable guidance for an AI coding agent to be productive working on the FitTrack frontend.

Quick checklist (what I'll assume/verify before making changes)
- Start the frontend with: `npm install` then `npm run dev` (see `package.json`).
- The frontend talks to a backend at `http://localhost:8080` (configurable via `VITE_API_BASE` env var). Backend must be running (README: Spring Boot in demo folder).
- Lint with `npm run lint` (ESLint config in `eslint.config.js`).
- Backend must support CORS for the dev origin (check browser console if you see CORS errors).

Key architecture overview (big picture)
- Multi-component React app (entry: `src/main.jsx`) with client-side auth routing.
- `src/App.jsx` is a session router that conditionally renders Login, Register, or Dashboard based on JWT token.
- `src/Dashboard.jsx` contains the main authenticated UI (profile stats, AI generation, exercise logging, metrics).
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` plugin in `vite.config.js` and `@import "tailwindcss"` in `src/index.css`.
- Component tree: App → (Login | Register | Dashboard) → Sidebar + MetricsRow + Dashboard content.
- Integration boundary: frontend <-> backend over REST. API_BASE is set from `import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'` (all components use this pattern).
- **Important REST endpoints**:
  - POST /api/users/login (auth) — Login.jsx lines ~17-27
  - POST /api/users/register (auth) — Register.jsx lines ~19-28
  - PUT /api/users/{id} (update profile: bodyWeight, goal) — Dashboard.jsx lines ~104-114
  - GET /api/users/{id}/history (fetch workout history) — Dashboard.jsx lines ~25-39
  - GET /api/users/{id}/recommendation (AI generation) — Dashboard.jsx lines ~81-92
  - GET /api/users/{id}/exercises (fetch exercise logs) — Dashboard.jsx lines ~41-53
  - POST /api/users/{id}/exercises (log a new exercise) — Dashboard.jsx lines ~140-152
  - GET /api/users/{id}/stats (fetch profile metrics) — Dashboard.jsx lines ~54-66

Developer workflows & commands (concrete)
- Install & run dev server:
  - npm install
  - npm run dev  (maps to `vite`) — see `package.json` scripts.
  - Optional: Create `.env` at project root with `VITE_API_BASE=http://localhost:8080` to override default backend URL.
- Build and preview:
  - npm run build
  - npm run preview
- Linting: npm run lint (runs `eslint .` using `eslint.config.js`).
- Backend: README instructs running the Spring Boot app from the `demo` folder with `mvn spring-boot:run` after updating `application.properties` (Postgres credentials & Gemini API key).
- Testing auth flows: Use browser devtools Console/Network tab to inspect JWT tokens and requests. Login/Register components talk to `/api/users/login` and `/api/users/register`.

Project-specific conventions & patterns
- Backend base URL: All components use `import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'` as their API_BASE. Set `VITE_API_BASE` in `.env` to override for non-local backends.
- **Session management**: `App.jsx` manages JWT token and userId in localStorage ('jwtToken' and 'userId' keys). Tokens are included in all API calls via `Authorization: Bearer ${jwtToken}` header.
- **Auth routing**: App.jsx conditionally renders Login, Register, or Dashboard based on `jwtToken` and `activeUserId` state. Logout clears localStorage and resets state.
- **State in Dashboard.jsx**:
  - `weight`, `goal` (profile inputs) — sent to PUT /api/users/{id}
  - `aiPlan`, `isGenerating`, `aiError` (AI coach state) — controlled by generate button
  - `exerciseLogs` (exercise history) — fetched from GET /api/users/{id}/exercises, displayed in reverse chronological order
  - `exerciseForm` (new lift form) — structure: { exerciseName, weight, sets, reps }
  - `stats` (metrics) — structure: { workoutStreak, weeklyVolume, recoveryScore, currentWeight } fetched from GET /api/users/{id}/stats
  - `message` (profile update feedback) — auto-clears after 3 seconds
  - `logMessage` (lift logging feedback) — auto-clears after 3 seconds
  - `sessionMessage` (auth expiry) — displays on 403 responses
- **Error handling**: 403 responses trigger session expiry messages. Other errors show lightweight user-facing strings; console logs contain full error details.
- **Components**:
  - `Sidebar.jsx` — static navigation sidebar (currently all items non-functional, ready for future routing)
  - `MetricsRow.jsx` — displays stats in a 4-column grid (workoutStreak, weeklyVolume, recoveryScore, currentWeight)
  - `Login.jsx`, `Register.jsx` — auth forms that call `/api/users/login` and `/api/users/register` respectively
- **JWT token extraction**: On successful login (POST /api/users/login), backend returns `{ jwt, userId }`. CRITICAL: Frontend must use `userId` (not decode JWT payload) for API calls.

Integration & external dependencies worth noting
- Google Gemini AI is referenced in the README as the AI backend (actual calls to Gemini happen server-side in the Spring Boot backend, not in this repo).
- PostgreSQL is the data store (backend). Frontend only communicates via REST.
- Tailwind configuration is provided by `@tailwindcss/vite` plugin; styles are applied inline via utility classes (dark theme, e.g. `bg-black`, `bg-gray-900`).
- ESLint setup uses: `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (see `eslint.config.js`).

Files to inspect for changes / touchpoints when implementing features
- `src/App.jsx` — session router; manages JWT + userId. Modify to add auth provider or global state.
- `src/Dashboard.jsx` — main authenticated UI. Contains all dashboard state, API calls, and layout. Largest file; any feature addition likely touches here.
- `src/Login.jsx`, `src/Register.jsx` — auth flows; handle login/register API calls and form state.
- `src/Sidebar.jsx` — static navigation component. Currently placeholder; extend here for multi-view navigation.
- `src/MetricsRow.jsx` — reusable metrics display component. Props: `stats` object with workoutStreak, weeklyVolume, recoveryScore, currentWeight.
- `src/main.jsx` — mounting point; keep SRP (single responsibility) when adding providers or global context.
- `vite.config.js` & `src/index.css` — Tailwind integration and plugin usage.
- `package.json` — scripts and dependency versions (React 19, Vite 8, Tailwind 4).
- `README.md` — authoritative developer notes for backend setup and env var documentation.

Testing & debugging tips specific to this repo
- **Auth flows**: To test Login/Register, ensure backend is running and CORS is enabled. Check browser devtools Console for auth errors. Successful login stores JWT in localStorage and redirects to Dashboard.
- **Session expiry**: Backend returns 403 on expired/invalid tokens. Frontend displays "Session expired." and clears localStorage. Catch this in Dashboard.jsx's useCallback dependencies when refreshing data.
- **API calls**: All endpoints require `Authorization: Bearer ${jwtToken}` header (see fetch calls in Login, Register, Dashboard). Browser Network tab shows full request/response for debugging.
- **Local storage**: Use `localStorage.getItem('jwtToken')` and `localStorage.getItem('userId')` in browser console to inspect session state. Both must be present for Dashboard to render.
- **Metrics/stats**: MetricsRow displays stats from GET /api/users/{id}/stats. If metrics show as 0, check backend returns valid stat structure: { workoutStreak, weeklyVolume, recoveryScore, currentWeight }.
- **Exercise logs**: Recently logged exercises appear in reverse chronological order in "Recent Lifts" feed. Date format uses `new Date(log.dateLogged).toLocaleDateString()`.
- **Common failure modes**:
  1. Backend not running → network errors in Console; CORS won't help.
  2. CORS misconfiguration → browser blocks requests; check backend CORS config.
  3. Expired JWT → 403 responses trigger sessionMessage; user must log in again.
  4. Invalid userId → API calls fail silently (check Console for 404/400); verify userId from login response matches header extraction.

Conservative change policy for AI agents
- **API base URL**: Do not hardcode `http://localhost:8080` anywhere. Always use `import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'` as in Login.jsx line 3, Register.jsx line 3, Dashboard.jsx line 5. If you add a new component that makes API calls, follow this pattern.
- **Auth state**: Never store full JWT in localStorage keys other than 'jwtToken' or userId other than 'userId'. App.jsx is the single source of truth for session state; keep it there.
- **Session management**: When adding new API calls in Dashboard or other components, use `useCallback` with `[activeUserId, jwtToken]` dependencies to ensure calls refresh when auth state changes. Always include `Authorization: Bearer ${jwtToken}` header in fetches.
- **Adding new endpoints**: Update all three places: (1) the fetch call, (2) add the endpoint to the "Integration boundary" section in AGENTS.md, (3) update README if user-facing workflow changes.
- **New dependencies**: Update `package.json` manually or run `npm install <package>` and commit lockfile. ESLint must pass before merging.
- **UI consistency**: Tailwind utility classes are the primary styling mechanism. Use existing color scheme (dark background #080C10, #0f141a, emerald accents). Avoid inline styles.
- **Session expiry handling**: Always check for 403 status in fetch responses (see Dashboard.jsx lines 28-30, 85-87, 116-118, 154-157); set sessionMessage and return early, do not throw.

Example snippets (exact locations to reference)
- Session router: src/App.jsx lines ~6-36 (conditionally renders Login/Register/Dashboard based on JWT)
  - `const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || null)`
- Auth header pattern: Dashboard.jsx line ~26, Login.jsx line ~19, Register.jsx line ~19
  - `headers: { 'Authorization': `Bearer ${jwtToken}` }`
- API_BASE reference: Login.jsx line ~3, Register.jsx line ~3, Dashboard.jsx line ~5
  - `const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'`
- New exercise fetch: Dashboard.jsx lines ~41-53 (GET /api/users/{id}/exercises)
- Exercise logging: Dashboard.jsx lines ~133-172 (POST with exerciseForm structure)
- Profile update call: Dashboard.jsx lines ~102-131 (PUT /api/users/{id})
- AI generation: Dashboard.jsx lines ~75-100 (GET /api/users/{id}/recommendation + fetchHistory refresh)
- Metrics display: Dashboard.jsx line ~203 (`<MetricsRow stats={stats} />`)
- Session expiry: Dashboard.jsx lines ~28-30, ~85-87, ~116-118 (check `if (response.status === 403)`)
- Scripts: package.json lines ~6-11 (dev, build, lint, preview)

If you need me to:
- Add a new authenticated endpoint to Dashboard — I will handle the fetch call pattern, JWT header, and 403 handling automatically following existing conventions.
- Add a new component — I will follow the pattern: export a functional component, accept props for data/callbacks, use `import.meta.env.VITE_API_BASE` for any API calls, apply Tailwind styling, and integrate into Dashboard parent.
- Modify Login/Register flows — I will preserve the existing JWT extraction logic and localStorage patterns.
- Debug auth issues — I will check localStorage, JWT header inclusion, backend CORS, and session expiry handling via browser devtools.

---
Generated by an automated analysis of the repository to help AI agents onboard quickly. Last updated June 2026. Inspect `src/Dashboard.jsx` and `src/App.jsx` first for runtime assumptions.

