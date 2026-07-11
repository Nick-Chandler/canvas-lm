# app/canvas/ — ReactFlow UI

The client canvas, and the `/canvas` route that serves it. `app/page.tsx` (the `/` route) just redirects here.

## Files

- `page.tsx` — The `/canvas` route (Server Component, `CanvasPage`). Reads the Clerk `userId` via `auth()`, and when signed in fetches the user's most recent workspace via `getMostRecentWorkspace(userId)`, unwraps `workspace.data` to a `PackagedData | null`, then renders `<Canvas data={data} wsName={workspace?.ws_name ?? null} />` — hydrating the canvas from the saved workspace.
- `Canvas.tsx` — Main Client Component (`'use client'`), `Canvas`. The source of truth for `nodes`/`edges`/`layout`/`title` state, which it **seeds from the `data` and `wsName` props** passed by `page.tsx`. It:
  - renders the `<ReactFlow>` graph plus the topbar (`Toolbar`, `WorkspaceTitle`, `AuthControl`, `ResponseBox`) and `PromptInput`;
  - registers the custom node type via `nodeTypes = { canvasNode: CanvasNode }`;
  - delegates generation to `useGenerateGraph` and node add/clear to `useGraphActions` (see `hooks/` below);
  - persists the graph server-side by calling `saveWorkspaceAction(nodes, edges, layout, title)` (a `'use server'` action from `@/app/lib/actions`) in a `useEffect` on `[nodes, edges, layout, title, saveable]`, surfacing a saving/success/error indicator. A local `saveable` flag gates the save — `onNodeDragStart`/`onNodeDragStop` toggle it so intermediate drag positions aren't saved. A `showingExamples` boolean is initialized to `data == null`, so the placeholder nodes show only when the server provided no saved graph; the first generate or manual add clears them;
  - hides the graph until ReactFlow has measured every node (`FitOnReady` + `useNodesInitialized`) to avoid a `fitView` flash on load.
- `CanvasNode.tsx` — The custom ReactFlow node (`type: 'canvasNode'`). Renders the label with source/target `Handle`s; double-click to edit, Enter/blur to commit (writes back via `useReactFlow().setNodes`), Escape to cancel.
- `hooks/`
  - `useGenerateGraph.ts` — Owns `response`/`loading` and the `generate(prompt)` flow: POSTs `{ prompt, currentGraph }` to `/api/generate`, streams the response into `response`, then round-trips the graph through the compact text format via `graphToCompact()` / `parseCompactGraphToFull()` from `@/app/lib/compactGraph`. Malformed model output is caught and the canvas is left as-is.
  - `useGraphActions.ts` — `addNode` and `clear`, both aware of the `showingExamples` placeholder state.
- `components/` — Presentational pieces of the canvas chrome: `Toolbar`, `PromptInput`, `ResponseBox`, `AuthControl`, `WorkspaceTitle`.
- `_components.tsx` — Small canvas-local helpers (e.g. `LogState`, a debug button that logs nodes/edges to the console). Underscore prefix = non-route helper module.
- `Canvas.css` — Styles scoped to the canvas UI (imported by `Canvas.tsx` alongside ReactFlow's stylesheet).

The layout engine (`applyLayout`/`LayoutType`) now lives in `app/lib/graphLayout.ts` — see `app/lib/CLAUDE.md`.

## ReactFlow docs

Fetch https://reactflow.dev/llms.txt for up-to-date ReactFlow documentation whenever needed.
