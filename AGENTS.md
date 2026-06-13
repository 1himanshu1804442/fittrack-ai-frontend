# AGENTS.md — FitTrack Frontend (guidance for AI coding agents)

Purpose
- Provide focused, actionable guidance for an AI coding agent to be productive working on the FitTrack frontend.

Quick checklist (what I'll assume/verify before making changes)
- Start the frontend with: `npm install` then `npm run dev` (see `package.json`).
- The frontend talks to a backend at `http://localhost:8080` (endpoints are hardcoded in `src/App.jsx`). Backend must be running (README: Spring Boot in demo folder).
- Lint with `npm run lint` (ESLint config in `eslint.config.js`).

Key architecture overview (big picture)
- Single-page React app (entry: `src/main.jsx`) mounting `App` from `src/App.jsx`.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` plugin in `vite.config.js` and `@import "tailwindcss"` in `src/index.css`.
- No client-side routing or multiple pages — all UI lives in `App.jsx` (profile update, AI generation, history list).
- Integration boundary: frontend <-> backend over REST at `http://localhost:8080/api/users/{id}`. Important endpoints used:
  - GET /api/users/{id}/history (fetch workout history) — App.jsx lines ~15-19
  - GET /api/users/{id}/recommendation (trigger AI generation) — App.jsx lines ~36-45
  - PUT /api/users/{id} (update profile: bodyWeight, goal) — App.jsx lines ~53-62

Developer workflows & commands (concrete)
- Install & run dev server:
  - npm install
  - npm run dev  (maps to `vite`) — see `package.json` scripts.
- Build and preview:
  - npm run build
  - npm run preview
- Linting: npm run lint (runs `eslint .` using `eslint.config.js`).
- Backend: README instructs running the Spring Boot app from the `demo` folder with `mvn spring-boot:run` after updating `application.properties` (Postgres credentials & Gemini API key).

Project-specific conventions & patterns
- Backend base URL: the app defaults to `http://localhost:8080` but now reads `VITE_API_BASE` from the Vite environment when provided. See `.env.example` at project root. If you change endpoint strings, update the env var name and README accordingly.
- UI state lives in `App.jsx` using React hooks. Example state names:
  - `history`, `weight`, `goal`, `aiPlan`, `isGenerating`, `aiError`, `activeUserId`.
- Controlled inputs and optimistic UX: profile updates invoke PUT then show a small `message` string on success/failure (`setMessage`).
- Error handling is lightweight: App displays a generic AI-busy message when fetch fails (see lines ~46-50 and ~150-153).
- Date formatting is done in-place in render: `new Date(workout.createdAt).toLocaleDateString()` (lines ~174-176).

Integration & external dependencies worth noting
- Google Gemini AI is referenced in the README as the AI backend (actual calls to Gemini happen server-side in the Spring Boot backend, not in this repo).
- PostgreSQL is the data store (backend). Frontend only communicates via REST.
- Tailwind configuration is provided by `@tailwindcss/vite` plugin; styles are applied inline via utility classes (dark theme, e.g. `bg-black`, `bg-gray-900`).
- ESLint setup uses: `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (see `eslint.config.js`).

Files to inspect for changes / touchpoints when implementing features
- `src/App.jsx` — single largest file; contains REST calls and main UI. Any change to data flow or API shape should be reflected here.
- `src/main.jsx` — mounting point; keep SRP (single responsibility) when adding providers or routers.
- `vite.config.js` & `src/index.css` — Tailwind integration and plugin usage.
- `package.json` — scripts and dependency versions (React 19, Vite 8, Tailwind 4).
- `README.md` — authoritative developer notes for backend setup.

Testing & debugging tips specific to this repo
- Since endpoints are hardcoded to localhost:8080, run the backend locally and watch network calls in the browser devtools while clicking "Generate Plan" to reproduce AI flows.
- To simulate different users, use the "Simulate User ID" selector in the UI (values: 1, 2, 4) — helps exercise history and recommendation endpoints.
- Common failure mode: backend not running / CORS — check browser console for CORS errors; backend must expose CORS for the dev origin.

Conservative change policy for AI agents
- Do not change API endpoint strings in `App.jsx` without:
  1) adding a Vite env var (VITE_API_BASE) and
  2) updating all occurrences and README dev steps. The project currently expects a running Spring Boot server.
- When adding new dependencies, update `package.json` and ensure `npm install` in CI/dev instructions.

Example snippets (exact locations to reference)
- Hardcoded API call: src/App.jsx line ~17
  - fetch(`http://localhost:8080/api/users/${activeUserId}/history`)
- Recommendation trigger: src/App.jsx line ~37
  - fetch(`http://localhost:8080/api/users/${activeUserId}/recommendation`)
- Update profile: src/App.jsx lines ~55-62 (PUT body structure: { bodyWeight: Number(weight), goal })
- Scripts: package.json lines ~6-11 (dev, build, lint, preview)

If you need me to:
- Add a small `.env` + replace hardcoded endpoints with `import.meta.env.VITE_API_BASE` and update README — I can implement that change safely and update instructions.

---
Generated by an automated analysis of the repository to help AI agents onboard quickly. Inspect `src/App.jsx` and `README.md` first for runtime assumptions.
