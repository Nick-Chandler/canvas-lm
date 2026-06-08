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

`OPENROUTER_API_KEY` is required for the `/api/generate` route.

## Architecture

Next.js 16 App Router project. All routes live under `app/`. Pages are Server Components by default; anything needing browser APIs or React hooks must have `'use client'` at the top.

### Canvas route (`/canvas`)

`app/canvas/page.tsx` is the route entry point (Server Component). It renders `InfiniteCanvas` from `RFlowCanvas.tsx`.

`RFlowCanvas.tsx` is a Client Component: declarative node graph via `@xyflow/react`. Manages `nodes`/`edges` state, handles user connections, and submits prompts to `/api/generate`. Sample graph data lives in `data.json` (not currently wired to state — initial nodes/edges are hardcoded in the component).

### API route (`/api/generate`)

`app/api/generate/route.ts` — POST endpoint. Accepts `{ prompt }`, calls OpenRouter (`qwen/qwen3.5-9b`) via the Vercel AI SDK, returns `{ text }`.

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
