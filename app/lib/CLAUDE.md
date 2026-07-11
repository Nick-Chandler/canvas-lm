# app/lib/ — Shared infra (DB & graph serialization)

## Files

- `db.ts` — The database layer (the Data Access Layer — no `'use server'` directive; not all its exports are async server-action-shaped). Exposes a singleton `getDb(): PrismaClient` created via the `@prisma/adapter-neon` driver adapter, connecting through `DATABASE_URL`. Also defines a `PackagedData` type with `packageData`/`unpackageData` helpers (layout + nodes + edges) and a `logData()` debug helper for a `UserWorkspace`. Exposes the workspace read/write API used by `actions.ts` and `app/page.tsx`:
  - `saveWorkspace(userId, nodes, edges, layout, workspaceId?, wsName?)` — updates the row with `workspaceId` when given, otherwise creates a **new** workspace row for the user;
  - `getWorkspace(id, user_id)` — one workspace by id, **scoped to its owner** (`findFirst`, so a user can't open someone else's workspace by guessing its UUID). This is the read behind the `/canvas/[id]` route and the ownership check in `saveWorkspaceAction`;
  - `getMostRecentWorkspace(user_id)` — the most recently updated workspace (`orderBy updated_at desc, take 1`);
  - `getMostRecentWorkspaces(user_id, n)` — the `n` most recent;
  - `getAllWorkspaces(user_id)` — all of the user's workspaces, newest first.
- `actions.ts` — `'use server'` file, callable directly from Client Components. Both actions re-authenticate via Clerk's `auth()` (server actions are reachable independent of any page-level auth check).
  - `saveWorkspaceAction(workspaceId, nodes, edges, layout, wsName?)` — the workspace is identified **explicitly by id**, never inferred from "most recent". Verifies ownership with `getWorkspace(workspaceId, userId)` (throws if it's missing or not the caller's), then updates that row via `saveWorkspace`. Called directly from `app/canvas/Canvas.tsx` — this is the only way a workspace gets saved (there is no `/api/save` route).
  - `createWorkspaceAction()` — creates an empty workspace row and `redirect`s to `/canvas/<new id>`. Used as the `action` of the "New diagram" form on `app/dashboard/page.tsx`, which is what keeps that page a Server Component.
- `utils.ts` — Small shared helpers. `timeAgo(date)` formats a `Date` as "5 months ago" via `Intl.RelativeTimeFormat`; used by the dashboard's workspace cards.
- `compactGraph.ts` — **Lives here, not in `app/canvas/`.** The bidirectional serializer between the ReactFlow graph and the compact text format:
  - `graphToCompact(nodes, edges, layout)` → compact text for model context;
  - `parseCompactGraphToFull(text)` → nodes/edges, then positioned via `applyLayout`.
  - Imports `applyLayout` / `LayoutType` from `./graphLayout`.
- `graphLayout.ts` — The deterministic geometry engine. `applyLayout(layout, nodes, edges)` takes position-less nodes plus a `LayoutType` (`'radial' | 'hierarchical' | 'flowchart' | 'network' | 'mindmap'`) and returns nodes with computed `(x, y)` positions. Pure, no side effects. Imported by `app/canvas/Canvas.tsx` via `@/app/lib/graphLayout`. See companion `graphLayout.explained.txt` for a full walkthrough.

## Database

The app uses [Prisma](https://www.prisma.io) (ORM) with PostgreSQL. The schema lives in `prisma/schema.prisma`. The single table in use is `user_workspaces`, mapped from the `UserWorkspace` model (`@@map("user_workspaces")`). Each row is **one workspace**, not one user: a row holds a canvas graph packed as JSON in the `data` column, an optional `ws_name` title, and a `user_id` owner. `user_id` is **not** unique — a user may own many workspaces, so always scope reads by `user_id` and expect a collection (`getAllWorkspaces`) unless you specifically want the latest one. Rows are keyed by a UUID `id`, which is what `saveWorkspace` targets when updating an existing workspace. The generated type is importable as `import type { UserWorkspace } from "@prisma/client"`.

> **Prisma is on v7** (`@prisma/client` / `prisma` both `^7.8.0`). v7 has **breaking changes** vs. v5/v6 — APIs, generator output, and driver-adapter signatures may differ from your training data. Before assuming a Prisma API shape, check the generated client in `node_modules/.prisma/client/index.d.ts` and the adapter types in `node_modules/@prisma/adapter-neon/dist/index.d.ts`. For example, `PrismaNeon` takes a `PoolConfig` object, not a `Pool` instance. After any schema change, run `bunx prisma generate` to refresh types.
