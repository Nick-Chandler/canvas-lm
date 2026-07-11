# app/ — App Router shell

This directory is the application shell: the root layout, the home route, and app-wide wiring. Subdirectories (`api/`, `canvas/`, `dashboard/`, `lib/`) have their own `CLAUDE.md` with more specific detail.

## Files

- `layout.tsx` — Root layout. Wraps the app in `<ClerkProvider>` from `@clerk/nextjs`, imports `globals.css`, adds Vercel `Analytics` + `SpeedInsights`, and sets metadata (title "Canvas LM").
- `page.tsx` — Home route (`/`). A Server Component that does nothing but `redirect('/dashboard')` from `next/navigation`.
- `dashboard/` — The `/dashboard` route: the workspace picker users land on. An async Server Component that lists the user's real workspaces via `getAllWorkspaces(userId)`, each card a `<Link>` to `/canvas/<id>` showing `ws_name` (falling back to "Untitled diagram") and `timeAgo(updated_at)`. Card previews are still blank placeholders — there are no thumbnails yet. "New diagram" is a `<form action={createWorkspaceAction}>`, which is what lets the page stay a Server Component while still mutating. Clerk's `<UserButton>` sits top-right; the page assumes a signed-in user and is **not** auth-gated yet. `Dashboard.css` holds its styles.
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
