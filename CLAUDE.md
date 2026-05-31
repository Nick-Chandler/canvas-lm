# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


## Commands

```bash
bun run dev      # start dev server at localhost:3000
bun run build    # production build (output: .next/)
bun run start    # serve production build
bun run lint     # run ESLint
```

## Architecture

This is a Next.js 16 App Router project. All routes live under `app/`. Pages are Server Components by default; anything needing browser APIs or React hooks must have `'use client'` at the top.

### Canvas route (`/canvas`)

`app/canvas/page.tsx` is the route entry point (Server Component). It imports and renders a canvas Client Component.

Two canvas implementations exist side-by-side:

- **`KonvaCanvas.tsx`** — imperative canvas via the `konva` library. Initializes a `Konva.Stage` in a `useEffect`, supports pan (draggable stage) and scroll-to-zoom anchored to the pointer position. Cleans up with `stage.destroy()` on unmount.
- **`RFlowCanvas.tsx`** — declarative node graph via `@xyflow/react`. Renders `<ReactFlow>` with `<Background>` and `<Controls>`, uses `defaultNodes`/`defaultEdges` for initial state.

`page.tsx` currently imports from `RFlowCanvas`. Swap the import to switch implementations.

### ReactFlow docs

Fetch https://reactflow.dev/llms.txt for up-to-date ReactFlow documentation whenever needed.

### Path alias

`@/*` maps to the project root, so `@/app/...` works anywhere.
