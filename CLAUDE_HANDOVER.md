# FitTrack AI — Redesign Handover

## Purpose

Continue the frontend-only, production-safe visual redesign on branch `ui-redesign-placement-safe`.

## Non-negotiable safety contract

- Do not modify backend files, deployment configuration, CI/CD, Docker files, `package.json`, `package-lock.json`, Vite configuration, or `vercel.json`.
- Do not commit, push, deploy, install dependencies, or use destructive Git commands.
- Keep every `const API_BASE = ''` declaration exactly empty.
- Preserve all existing endpoint paths, HTTP methods, JSON payloads, `Authorization: Bearer ${jwtToken}` headers, and JSON `Content-Type` headers.
- Preserve App.jsx JWT/localStorage flow using the exact keys `jwtToken` and `userId`.
- Do not create test accounts or send write requests to the deployed backend during UI review.
- The USDA food-search request in `Nutrition.jsx` is pre-existing functionality; do not alter it during the redesign.

## Baseline

- Branch: `ui-redesign-placement-safe` (created from clean `main`).
- Baseline build: passed.
- Baseline lint: 0 errors, 14 pre-existing warnings.
- Baseline build warning: Vite chunk size only.

## Completed work

- Added the shared Performance Intelligence design system in `src/index.css`:
  - graphite surface hierarchy
  - emerald primary and slate-blue data accents
  - utility classes for panels, controls, buttons, typography, training-grid treatment, metrics, auth forms, accessibility focus, and reduced motion
- Removed unused Vite boilerplate styles from `src/App.css`.
- Updated `index.html` title to `FitTrack AI — Performance Intelligence`.
- Updated `App.jsx` toast styling only; authentication/view-routing logic is unchanged.
- Rebuilt `Login.jsx` and `Register.jsx` visually as responsive split-panel authentication pages while preserving their fetch logic, state, callbacks, payloads, and toast behavior.

## Remaining work

1. Update `Sidebar.jsx` with Lucide navigation icons and unified graphite/emerald navigation styling.
2. Update `MetricsRow.jsx` with Lucide icons and calibration-line metric cards.
3. Restyle `Dashboard.jsx` while leaving all state, callbacks, fetch calls, payloads, inline editing, ReactMarkdown, and mobile Sidebar integration unchanged.
4. Restyle `AIWorkout.jsx`, `AICoach.jsx`, `Nutrition.jsx`, `History.jsx`, and `Analytics.jsx` without altering behavior.
5. Run `npm run build` and `npm run lint`; no errors are acceptable and lint warnings must not exceed the 14 baseline warnings.
6. Verify login/register at desktop and mobile widths without interacting with live write endpoints.
7. Run an API-contract diff/audit to prove that relative endpoints, headers, payloads, and API_BASE declarations remain intact.

## Design direction

"Performance Intelligence": a precise athlete-training interface using deep graphite surfaces, electric emerald for action/performance, cool blue for secondary data, compact data typography, fine dividers, restrained radii, and a "training signal" accent line. Avoid emojis, broad neon glows, generic dark SaaS cards, glassmorphism, and arbitrary gradients.

## Important component invariants

- `App.jsx` owns login state and current view. Valid views: `dashboard`, `history`, `analytics`, `ai-workout`, `ai-coach`, `nutrition`.
- All authenticated screens receive `jwtToken`, `activeUserId`, `onLogout`, `currentView`, and `setCurrentView`.
- `Sidebar.jsx` reads `jwtToken` and `userId` directly from localStorage; preserve that behavior.
- Dashboard and Nutrition both use `PUT /api/users/{id}` with different payload shapes. Never unify or change them.
- Keep ReactMarkdown behavior in Dashboard, AIWorkout, AICoach, and History.
- Keep the six AICoach response sections and its sessionStorage keys `aiCoachData` / `aiCoachLastGenerated` unchanged.
- Preserve History zero-based pagination and Nutrition `daily` / `weekly` / `monthly` literals.

## Continuation command

Before editing, inspect `git diff`, this file, `AGENTS.md`, and the current source. Preserve existing correct changes; do not restart the redesign from scratch.
