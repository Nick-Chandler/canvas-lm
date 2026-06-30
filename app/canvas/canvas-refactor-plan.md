# Plan: Break up the `Canvas.tsx` god component

## Context

`app/canvas/Canvas.tsx` (~178 lines) is a single client component that owns **five
unrelated concerns** at once:

1. Graph state (`nodes`/`edges`/`layout`/`showingExamples`)
2. `localStorage` persistence (load-on-mount effect, save-on-change effect, drag `saveable` flag)
3. AI generation (fetch + streaming read loop + compact-graph parse)
4. Three UI overlays (toolbar, auth control, response box) + the prompt form
5. The core `<ReactFlow>` render

This makes the file hard to scan and hard to change one concern without touching the
others. The goal is a **thin orchestrator** `Canvas.tsx` that wires up small, single-purpose
hooks and presentational components — **no behavior changes**, pure restructuring.

Decisions: moderate split = 2 logic hooks + presentational UI components, organized into
new `app/canvas/hooks/` and `app/canvas/components/` subfolders.

## Target structure

```
app/canvas/
  Canvas.tsx              # thin orchestrator: owns graph state, wires hooks + components
  CanvasNode.tsx          # unchanged
  _components.tsx         # unchanged (LogState debug helper)
  Canvas.css              # unchanged (class names preserved)
  hooks/
    useGraphPersistence.ts   # localStorage load/save + saveable flag
    useGenerateGraph.ts      # /api/generate fetch, stream, parse
  components/
    Toolbar.tsx              # + Add Node / Clear buttons
    AuthControl.tsx          # Clerk UserButton / SignInButton
    ResponseBox.tsx          # collapsible streamed-response box
    PromptInput.tsx          # the prompt form + input
```

No new CSS — all existing class names (`.canvas-toolbar`, `.response-box`, `.auth-control`,
`.user-input`, etc.) move with their JSX unchanged. `Canvas.tsx` keeps importing `Canvas.css`,
which covers all child components.

## What goes where

### `hooks/useGraphPersistence.ts`
Encapsulates the two persistence effects + `saveGraph` (current `Canvas.tsx:56-75`) and the
`saveable` state (`Canvas.tsx:46`).
- Signature: `useGraphPersistence({ nodes, edges, showingExamples, setNodes, setEdges, setShowingExamples })`
- Owns `const [saveable, setSaveable] = useState(true)` internally.
- Load effect (mount): read `localStorage` `nodes`/`edges`, hydrate via the passed setters, set `showingExamples` false. Keep the existing `eslint-disable react-hooks/set-state-in-effect` comment.
- Save effect (`[nodes, edges, showingExamples, saveable]`): bail on `showingExamples || !saveable`, else write to `localStorage`. Keep existing `exhaustive-deps` disable comment.
- **Returns** `{ setSaveable }` so `Canvas` can wire ReactFlow's `onNodeDragStart`/`onNodeDragStop`.

### `hooks/useGenerateGraph.ts`
Encapsulates `handleGenerate` (`Canvas.tsx:77-113`).
- Signature: `useGenerateGraph({ nodes, edges, layout, showingExamples, setNodes, setEdges, setLayout })`
- Owns `response` and `loading` state.
- `generate(prompt)`: same fetch to `/api/generate`, same streaming `reader`/`TextDecoder` loop updating `response`, same `parseCompactGraphToFull` try/catch applying `setNodes`/`setEdges`/`setLayout`. Reuses `graphToCompact` / `parseCompactGraphToFull` from `@/app/lib/compactGraph` — no logic rewrite.
- **Returns** `{ response, setResponse, loading, generate }`. (`setResponse` is exposed so Clear can reset it.)

### `components/Toolbar.tsx` — `'use client'`
- Props: `{ onAddNode, onClear }`. Renders the `.canvas-toolbar` div with the two buttons (`Canvas.tsx:128-131`).

### `components/AuthControl.tsx` — `'use client'`
- No props; self-contained. Calls `useAuth()` and renders `<UserButton/>` or the modal `<SignInButton>` (`Canvas.tsx:133-141`). Moves the Clerk imports out of `Canvas.tsx`.

### `components/ResponseBox.tsx` — `'use client'`
- Props: `{ response }`. Owns `responseExpanded` state internally (`Canvas.tsx:42`). Renders the `.response-box` header/content (`Canvas.tsx:142-148`).

### `components/PromptInput.tsx` — `'use client'`
- Props: `{ onSubmit: (value: string) => void }`. Owns its own `input` state, renders the `.user-input` form, clears the field on submit, and calls `onSubmit(value)` (replaces `input` state + form at `Canvas.tsx:40,115-124,151-158`).

### `Canvas.tsx` (orchestrator) — keeps
- `'use client'`, `nodeTypes`, `initialNodes`, `initialEdges`.
- State: `nodes`, `edges`, `layout`, `showingExamples` (the shared source of truth).
- `useGraphPersistence(...)` → `setSaveable`; `useGenerateGraph(...)` → `{ response, setResponse, loading, generate }`.
- Handlers retained here: `handleAddNode` (`:48-54`), a `handleClear` (`setNodes([])`, `setEdges([])`, `setResponse('')`), and `handleSubmit(value)` (the `showingExamples` reset from `:118-122` then `await generate(value)`).
- Renders: `<Toolbar>`, `<AuthControl>`, `<ResponseBox>`, the `loading` watermark, `<PromptInput>`, and the unchanged `<ReactFlow>` block (`:159-175`) wiring `onNodeDragStart={() => setSaveable(false)}` / `onNodeDragStop={() => setSaveable(true)}`.

## Notes / constraints
- **Behavior must be identical** — this is a mechanical extraction. Preserve the existing
  closure semantics in `generate` (it reads `showingExamples`/`nodes` from render scope, same
  as today) and keep both eslint-disable comments verbatim.
- Hook files don't strictly need `'use client'` (they inherit the client boundary from
  `Canvas.tsx`); the four component files get `'use client'` to match `CanvasNode.tsx`.
- `app/page.tsx` passes no props to `<InfiniteCanvas />` and needs **no change**.
- Out of scope: the `app/CLAUDE.md` note about `page.tsx` fetching `userWorkspace` is already
  stale vs. live code — not touched here.

## Verification

1. `bun run lint` — clean (watch for unused-import / exhaustive-deps regressions).
2. `bun run dev`, open `localhost:3000`, and manually confirm each moved concern:
   - **Generate**: type a prompt → response streams into the box, canvas re-renders with new graph.
   - **Toolbar**: `+ Add Node` adds a node (clears example nodes on first add); `Clear` empties canvas and response.
   - **Persistence**: drag a node, release, reload page → graph restored from `localStorage`.
   - **ResponseBox**: collapse/expand toggle works.
   - **Auth**: signed-out shows `Sign In` modal trigger; signed-in shows `UserButton`.
3. Confirm `Canvas.tsx` is now a short orchestrator and no console errors appear.
