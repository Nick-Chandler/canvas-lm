# app/ — App Router shell

This directory is the application shell: the root layout, the home route, and app-wide wiring. Subdirectories (`api/`, `canvas/`, `lib/`) have their own `CLAUDE.md` with more specific detail.

## Files

- `layout.tsx` — Root layout. Wraps the app in `<ClerkProvider>` from `@clerk/nextjs`, imports `globals.css`, adds Vercel `Analytics` + `SpeedInsights`, and sets metadata (title "Canvas LM").
- `page.tsx` — Home route (`/`). A Server Component that does nothing but `redirect('/canvas')` from `next/navigation`. The canvas itself lives at the `/canvas` route — see `app/canvas/page.tsx`.
- `globals.css` — Global stylesheet (Tailwind v4 entry).
- `icon.png` — App icon (Next.js convention file).
- `misc/` — Sample/fixture data (`sample-compact-graph.txt`, `sample-packaged-data.json`) used by dev scripts.
- `scripts/` — One-off dev/migration scripts (e.g. `add-ws-name-column.ts`, `sample-add-row.ts`).

## Authentication

The app uses [Clerk](https://clerk.com). Clerk's middleware runs via `clerkMiddleware` in `proxy.ts` at the project root.

Note: In Next.js 16 the `middleware.ts` file convention is deprecated in favor of `proxy.ts`. Use `proxy.ts` (not `middleware.ts`) for Clerk's middleware. Do not create a `middleware.ts` alongside it — the matcher in `proxy.ts` already runs auth on everything except `_next/static`, `_next/image`, `favicon.ico`, files with extensions, and the `/api` routes.

This means **pages are auth-gated, but API routes are not** (the matcher excludes `api`). Anything under `api/` or in a Server Action that needs auth (e.g. `app/lib/actions.ts`) must call Clerk's `auth()` itself.

### Clerk docs

Fetch https://clerk.com/docs for up-to-date Clerk documentation whenever needed.
