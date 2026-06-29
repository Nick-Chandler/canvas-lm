# app/canvas/ — ReactFlow UI & layout engine

The client canvas. This folder holds the canvas component and its helpers — **not** a route (there is no `page.tsx` here). Rendered by `app/page.tsx`.

## Files

- `Canvas.tsx` — Main Client Component (`'use client'`), `InfiniteCanvas`. The source of truth for `nodes`/`edges`/`layout` state. It:
  - renders the `<ReactFlow>` graph, toolbar, prompt input, and streamed response box;
  - registers the custom node type via `nodeTypes = { canvasNode: CanvasNode }`;
  - on submit, POSTs `{ prompt, currentGraph }` to `/api/generate` and streams the response;
  - round-trips the graph through the compact text format using `graphToCompact()` and `parseCompactGraphToFull()` from `@/app/lib/compactGraph`. Malformed model output is caught and the canvas is left as-is;
  - persists the graph to `localStorage` (saves on node drag stop, loads on mount). A `showingExamples` boolean tracks whether the initial placeholder nodes are showing; the first generate or manual add clears them.
- `graphLayout.ts` — The deterministic geometry engine. `applyLayout(layout, nodes, edges)` takes position-less nodes plus a `LayoutType` (`'radial' | 'hierarchical' | 'flowchart' | 'network' | 'mindmap'`) and returns nodes with computed `(x, y)` positions. Pure, no side effects. See companion `graphLayout.explained.txt` for a full walkthrough.
- `CanvasNode.tsx` — The custom ReactFlow node (`type: 'canvasNode'`). Renders the label with source/target `Handle`s; double-click to edit, Enter/blur to commit (writes back via `useReactFlow().setNodes`), Escape to cancel.
- `_components.tsx` — Small canvas-local helpers (e.g. `LogState`, a debug button that logs nodes/edges to the console). Underscore prefix = non-route helper module.
- `Canvas.css` — Styles scoped to the canvas UI (imported by `Canvas.tsx` alongside ReactFlow's stylesheet).

## Dependency note

`graphLayout.ts` is imported by `app/lib/compactGraph.ts` and `app/lib/db.ts` (`lib` → `canvas`, one-directional). Keep `graphLayout.ts` free of dependencies on `lib` to avoid a cycle.

## ReactFlow docs

Fetch https://reactflow.dev/llms.txt for up-to-date ReactFlow documentation whenever needed.
