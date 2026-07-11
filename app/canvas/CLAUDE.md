# app/canvas/ — ReactFlow UI

The client canvas and the routes that serve it. A workspace is always identified **by id in the URL** (`/canvas/[id]`) — nothing here infers "the workspace you meant" from recency. Users normally arrive from `/dashboard`.

## Files

- `[id]/page.tsx` — The `/canvas/[id]` route (Server Component, `WorkspacePage`). `await params` for the id (params are async in Next.js 16), reads the Clerk `userId` via `auth()`, fetches that one workspace via `getWorkspace(id, userId)` and calls `notFound()` when it comes back null — which covers both "no such workspace" and "not yours". Renders `<Canvas workspaceId={id} data={...} wsName={...} />`, hydrating the canvas from the saved row.
- `page.tsx` — The bare `/canvas` route: a convenience shortcut, not where the canvas really lives. Signed in with at least one workspace ⇒ `redirect`s to `/canvas/<most recent id>`. Otherwise (signed out, or no workspaces yet) it renders `<Canvas workspaceId={null} data={null} />` — an unsaved playground canvas, since `proxy.ts` runs `clerkMiddleware` without `auth.protect()` and signed-out visitors do reach this page.
- `Canvas.tsx` — Main Client Component (`'use client'`), `Canvas`. The source of truth for `nodes`/`edges`/`layout`/`title` state, which it **seeds from the `data` and `wsName` props** passed by the route. It:
  - renders the `<ReactFlow>` graph plus the topbar (`Toolbar`, `WorkspaceTitle`, `AuthControl`, `ResponseBox`) and `PromptInput`;
  - registers the custom node type via `nodeTypes = { canvasNode: CanvasNode }`;
  - delegates generation to `useGenerateGraph` and node add/clear to `useGraphActions` (see `hooks/` below);
  - persists the graph server-side by calling `saveWorkspaceAction(workspaceId, nodes, edges, layout, title)` (a `'use server'` action from `@/app/lib/actions`) in a `useEffect`, surfacing a saving/success/error indicator. Three things gate the save: `saveable` (toggled by `onNodeDragStart`/`onNodeDragStop`, so intermediate drag positions aren't written), a non-null `workspaceId` (the playground canvas has no row to save to), and `!showingExamples` (the placeholder nodes are not the user's content and must never be persisted). A `showingExamples` boolean is initialized from whether the incoming `data` has any nodes — **not** from `data == null`, because a freshly created workspace is a real row holding an empty graph; the first generate or manual add clears the placeholders;
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
