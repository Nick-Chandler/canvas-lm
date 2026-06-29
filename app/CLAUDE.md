# app/ — App Router shell

This directory is the application shell: the root layout, the home route, and app-wide wiring. Subdirectories (`api/`, `canvas/`, `lib/`) have their own `CLAUDE.md` with more specific detail.

## Files

- `layout.tsx` — Root layout. Wraps the app in `<ClerkProvider>` from `@clerk/nextjs`, imports `globals.css`, adds Vercel `Analytics` + `SpeedInsights`, and sets metadata (title "Canvas LM").
- `page.tsx` — Home route entry point (Server Component, `CanvasPage`). Reads the Clerk `userId` via `auth()`, fetches the first `userWorkspace` row via `getDb()`, then renders the client `<InfiniteCanvas />` from `app/canvas/Canvas.tsx`. (There is no `app/canvas/page.tsx`; the `canvas/` folder holds the component and helpers, not a route.)
- `globals.css` — Global stylesheet (Tailwind v4 entry).
- `icon.png` — App icon (Next.js convention file).

## Authentication

The app uses [Clerk](https://clerk.com). Clerk's middleware runs via `clerkMiddleware` in `proxy.ts` at the project root.

Note: In Next.js 16 the `middleware.ts` file convention is deprecated in favor of `proxy.ts`. Use `proxy.ts` (not `middleware.ts`) for Clerk's middleware. Do not create a `middleware.ts` alongside it — the matcher in `proxy.ts` already runs auth on everything except `_next/static`, `_next/image`, `favicon.ico`, files with extensions, and the `/api` routes.

This means **pages are auth-gated, but API routes are not** (the matcher excludes `api`).

### Clerk docs

Fetch https://clerk.com/docs for up-to-date Clerk documentation whenever needed.
