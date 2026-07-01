# app/canvas/ — ReactFlow UI

The client canvas. This folder holds the canvas component and its helpers — **not** a route (there is no `page.tsx` here). Rendered by `app/page.tsx`.

## Files

- `Canvas.tsx` — Main Client Component (`'use client'`), `InfiniteCanvas`. The source of truth for `nodes`/`edges`/`layout` state, which it **seeds from a `data?: PackagedData | null` prop** (`PackagedData` from `@/app/lib/db`) passed by `app/page.tsx`. It:
  - renders the `<ReactFlow>` graph, toolbar, prompt input, and streamed response box;
  - registers the custom node type via `nodeTypes = { canvasNode: CanvasNode }`;
  - on submit, POSTs `{ prompt, currentGraph }` to `/api/generate` and streams the response;
  - round-trips the graph through the compact text format using `graphToCompact()` and `parseCompactGraphToFull()` from `@/app/lib/compactGraph`. Malformed model output is caught and the canvas is left as-is;
  - persists the graph server-side by POSTing `{ nodes, edges, layout }` to `/api/save` in a `useEffect` on `[nodes, edges]` changes. A local `saveable` flag gates the save — `onNodeDragStart`/`onNodeDragStop` toggle it so intermediate drag positions aren't saved. Initial state is hydrated from the `data` prop (not loaded client-side). A `showingExamples` boolean is initialized to `data == null`, so the placeholder nodes show only when the server provided no saved graph; the first generate or manual add clears them.
- `CanvasNode.tsx` — The custom ReactFlow node (`type: 'canvasNode'`). Renders the label with source/target `Handle`s; double-click to edit, Enter/blur to commit (writes back via `useReactFlow().setNodes`), Escape to cancel.
- `_components.tsx` — Small canvas-local helpers (e.g. `LogState`, a debug button that logs nodes/edges to the console). Underscore prefix = non-route helper module.
- `Canvas.css` — Styles scoped to the canvas UI (imported by `Canvas.tsx` alongside ReactFlow's stylesheet).

The layout engine (`applyLayout`/`LayoutType`) now lives in `app/lib/graphLayout.ts` — see `app/lib/CLAUDE.md`.

## ReactFlow docs

Fetch https://reactflow.dev/llms.txt for up-to-date ReactFlow documentation whenever needed.
