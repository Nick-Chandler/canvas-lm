# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Authentication

The app uses [Clerk](https://clerk.com) for authentication. The root layout wraps the app in `<ClerkProvider>` from `@clerk/nextjs`, and Clerk's middleware runs via `clerkMiddleware` in `proxy.ts`.

Note: In Next.js 16 the `middleware.ts` file convention is deprecated in favor of `proxy.ts`. Use `proxy.ts` (not `middleware.ts`) for Clerk's middleware in this project. Do not create a `middleware.ts` alongside it — the matcher is already configured in `proxy.ts` to run auth on everything except `_next/static`, `_next/image`, `favicon.ico`, files with extensions, and the `/api` routes.

### Clerk docs

Fetch https://clerk.com/docs for up-to-date Clerk documentation whenever needed.

## Architecture

Next.js 16 App Router project. All routes live under `app/`. Pages are Server Components by default; anything needing browser APIs or React hooks must have `'use client'` at the top.

The app is an AI diagram generator: the user types a prompt, a model returns a graph as **compact text** (not coordinates), the client parses it, computes node positions locally, and renders it with ReactFlow (`@xyflow/react`). The model never emits coordinates — it only declares one of four layout *shapes*.

### Canvas (root route `/`)

`app/page.tsx` is the route entry point (Server Component). It renders `InfiniteCanvas` from `app/canvas/Canvas.tsx`. (There is no `app/canvas/page.tsx`; the `canvas/` folder holds the canvas component and its helpers, not a route.)

`Canvas.tsx` is the main Client Component and the source of truth for `nodes`/`edges`/`layout` state. It:
- renders the `<ReactFlow>` graph, toolbar, prompt input, and streamed response box;
- registers the custom node type via `nodeTypes = { canvasNode: CanvasNode }`;
- on submit, POSTs `{ prompt, currentGraph }` to `/api/generate` and streams the response;
- round-trips the graph through a compact text format using `graphToCompact()` and `parseCompactGraphToFull()` from `app/lib/compactGraph.ts`. Malformed model output is caught and the canvas is left as-is.
- persists the graph to `localStorage` (saves on node drag stop, loads on mount). A `showingExamples` boolean tracks whether the initial placeholder nodes are showing; the first generate or manual add clears them.

`graphLayout.ts` — the deterministic geometry engine. `applyLayout(layout, nodes, edges)` takes position-less nodes plus a `LayoutType` (`'radial' | 'hierarchical' | 'flowchart' | 'network' | 'mindmap'`) and returns nodes with computed `(x, y)` positions. Pure, no side effects. Imported only by `Canvas.tsx`. See `graphLayout.explained.txt` for a full walkthrough.

`CanvasNode.tsx` — the custom ReactFlow node (`type: 'canvasNode'`). Renders the label with source/target `Handle`s; double-click to edit, Enter/blur to commit (writes back via `useReactFlow().setNodes`), Escape to cancel.

`_components.tsx` — small canvas-local helpers (e.g. `LogState`, a debug button that logs nodes/edges to the console).

### API route (`/api/generate`)

`app/api/generate/route.ts` — POST endpoint. Accepts `{ prompt, currentGraph? }`, calls OpenRouter via the Vercel AI SDK (`streamText`), and returns a **streamed plain-text** response (`toTextStreamResponse()`).

The system prompt lives in `app/api/generate/systems/systemPrompt.ts`. It defines the compact graph text contract the client parses: a `layout: <type>` line, then `id|label` node lines, then a `---` separator, then `source>target` edge lines — and explicitly forbids coordinates. When `currentGraph` is present the prompt instructs the model to update/extend the existing diagram.

The active model is selected by `const activeModel = models.<key>` from a `models` map (currently `gemini` → `google/gemini-3.5-flash:nitro`); swap the key to change models. The compact-text format keeps responses small/fast across models.

### ReactFlow docs

Fetch https://reactflow.dev/llms.txt for up-to-date ReactFlow documentation whenever needed.

### Vercel AI SDK docs

Fetch https://sdk.vercel.ai/llms.txt for up-to-date Vercel AI SDK documentation whenever needed.

### OpenRouter / model-specific docs

- OpenRouter provider types (authoritative, local): `node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts`
- OpenRouter API docs: https://openrouter.ai/docs
- DeepSeek model parameters: https://api-docs.deepseek.com
- Qwen model list and parameters: https://openrouter.ai/models?q=qwen

## Database

The app uses [Prisma](https://www.prisma.io) (ORM) with PostgreSQL. The schema lives in `prisma/schema.prisma`, and `app/lib/db.ts` exposes a singleton `getDb(): PrismaClient` (created via the `@prisma/adapter-neon` driver adapter, connecting through `DATABASE_URL`).

The single table in use is `user_workspaces`, mapped from the `UserWorkspace` model (`@@map("user_workspaces")` in the schema). It stores one row per user with their canvas graph packed as JSON in the `data` column. The generated Prisma type is importable as `import type { UserWorkspace } from "@prisma/client"`.

> **Prisma is on v7** (`@prisma/client` / `prisma` both `^7.8.0`). v7 has **breaking changes** vs. v5/v6 — APIs, generator output, and driver-adapter signatures may differ from your training data. Before assuming a Prisma API shape, check the generated client in `node_modules/.prisma/client/index.d.ts` and the adapter types in `node_modules/@prisma/adapter-neon/dist/index.d.ts`. For example, `PrismaNeon` takes a `PoolConfig` object, not a `Pool` instance. After any schema change, run `bunx prisma generate` to refresh types.

## Styling

Put all styles in `.css` files. Avoid inline styles.

### Path alias

`@/*` maps to the project root, so `@/app/...` works anywhere.
