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
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (public, safe to expose) |
| `CLERK_SECRET_KEY` | Clerk auth (server-side only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Set to `/auth` so Clerk redirects to the in-app sign-in page instead of `accounts.dev` |

## Architecture

Next.js 16 App Router project. All routes live under `app/`. Pages are Server Components by default; anything needing browser APIs or React hooks must have `'use client'` at the top.

The app is an AI diagram generator: the user types a prompt, a model returns a graph as **compact text** (not coordinates), the client parses it, computes node positions locally, and renders it with ReactFlow (`@xyflow/react`). The model never emits coordinates — it only declares one of four layout *shapes*.

### Canvas (root route `/`)

`app/page.tsx` is the route entry point (Server Component). It renders `InfiniteCanvas` from `app/canvas/Canvas.tsx`. (There is no `app/canvas/page.tsx`; the `canvas/` folder holds the canvas component and its helpers, not a route.)

`Canvas.tsx` is the main Client Component and the source of truth for `nodes`/`edges`/`layout` state. It:
- renders the `<ReactFlow>` graph, toolbar, prompt input, and streamed response box;
- registers the custom node type via `nodeTypes = { canvasNode: CanvasNode }`;
- on submit, POSTs `{ prompt, currentGraph }` to `/api/generate` and streams the response;
- round-trips the graph through a compact text format with two local helpers: `graphToCompact()` (serialize current graph for the "Current graph:" context sent to the model) and `parseCompactGraphToFull()` (parse the model's reply back into nodes/edges, then call `applyLayout`). Malformed model output is caught and the canvas is left as-is.

`graphLayout.ts` — the deterministic geometry engine. `applyLayout(layout, nodes, edges)` takes position-less nodes plus a `LayoutType` (`'radial' | 'hierarchical' | 'linear' | 'network' | 'mindmap'`) and returns nodes with computed `(x, y)` positions. Pure, no side effects. Imported only by `Canvas.tsx`. See `graphLayout.explained.txt` for a full walkthrough.

`CanvasNode.tsx` — the custom ReactFlow node (`type: 'canvasNode'`). Renders the label with source/target `Handle`s; double-click to edit, Enter/blur to commit (writes back via `useReactFlow().setNodes`), Escape to cancel.

`_components.tsx` — small canvas-local helpers (e.g. `LogState`, a debug button that logs nodes/edges to the console).

### API route (`/api/generate`)

`app/api/generate/route.ts` — POST endpoint. Accepts `{ prompt, currentGraph? }`, calls OpenRouter via the Vercel AI SDK (`streamText`), and returns a **streamed plain-text** response (`toTextStreamResponse()`).

A long `system` prompt defines the compact graph text contract the client parses: a `layout: <type>` line, then `id|label` node lines, then a `---` separator, then `source>target` edge lines — and explicitly forbids coordinates. When `currentGraph` is present the prompt instructs the model to update/extend the existing diagram.

The active model is selected by `const activeModel = models.<key>` from a `models` map (currently `gemini` → `google/gemini-3.5-flash:nitro`); swap the key to change models. The compact-text format keeps responses small/fast across models.

### Auth (Clerk)

`ClerkProvider` wraps the root layout in `app/layout.tsx`. The sign-in page lives at `app/auth/[[...sign-in]]/page.tsx` (the catch-all slug is required by Clerk).

Route protection is handled in `proxy.ts` at the project root (Next.js 16 renamed Middleware to Proxy — same functionality, new filename). It uses `clerkMiddleware` + `createRouteMatcher` to call `auth.protect()` on all routes except `/auth`.

To add route protection, create `middleware.ts` at the project root using `clerkMiddleware` from `@clerk/nextjs/server` and define a `matcher` config. See the Clerk Next.js docs.

### ReactFlow docs

Fetch https://reactflow.dev/llms.txt for up-to-date ReactFlow documentation whenever needed.

### Vercel AI SDK docs

Fetch https://sdk.vercel.ai/llms.txt for up-to-date Vercel AI SDK documentation whenever needed.

### OpenRouter / model-specific docs

- OpenRouter provider types (authoritative, local): `node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts`
- OpenRouter API docs: https://openrouter.ai/docs
- DeepSeek model parameters: https://api-docs.deepseek.com
- Qwen model list and parameters: https://openrouter.ai/models?q=qwen

## Styling

Put all styles in `.css` files. Avoid inline styles.

### Path alias

`@/*` maps to the project root, so `@/app/...` works anywhere.
