# CLAUDE.md

This file provides high-level guidance for working in this repository. Each subdirectory under `app/` has its own `CLAUDE.md` with more specific detail — those are loaded automatically when you work on files in that area.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
bun run dev      # start dev server at localhost:3000 (Turbopack)
bun run build    # production build (output: .next/)
bun run start    # serve production build
bun run lint     # run ESLint
```

## Environment

Required env vars (`.env.local` locally, Vercel dashboard in production):

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | AI model calls via `/api/generate` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (client + proxy) |
| `CLERK_SECRET_KEY` | Clerk secret key (server only) |
| `DATABASE_URL` | Neon Postgres connection (Prisma) |

## Architecture

Next.js 16 App Router project. It's an AI diagram generator: the user types a prompt, a model returns a graph as **compact text** (not coordinates), the client parses it, computes node positions locally, and renders it with ReactFlow (`@xyflow/react`). The model never emits coordinates — it only declares one of several layout *shapes*.

### Directory map — where deeper guidance lives

| Directory | Scope | See |
|---|---|---|
| `app/` | App Router shell, Clerk/Analytics providers, auth-gated pages | `app/CLAUDE.md` |
| `app/api/` | Model calls (OpenRouter via Vercel AI SDK) + the compact-text contract | `app/api/CLAUDE.md` |
| `app/canvas/` | Client ReactFlow UI + the deterministic layout engine | `app/canvas/CLAUDE.md` |
| `app/lib/` | Shared infra: Prisma/Neon DB + graph serialization | `app/lib/CLAUDE.md` |

## Conventions

- **Components**: Pages are Server Components by default; anything needing browser APIs or React hooks must have `'use client'` at the top.
- **Styling**: Put all styles in `.css` files. Avoid inline styles.
- **Path alias**: `@/*` maps to the project root, so `@/app/...` works anywhere.
- **Database**: Prisma v7 + Neon Postgres. v7 has breaking changes vs. v5/v6 — see `app/lib/CLAUDE.md` before touching DB code.
