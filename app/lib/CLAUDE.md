# app/lib/ — Shared infra (DB & graph serialization)

## Files

- `db.ts` — The database layer. Exposes a singleton `getDb(): PrismaClient` created via the `@prisma/adapter-neon` driver adapter, connecting through `DATABASE_URL`. Also defines a `PackagedData` type with `packageData`/`unpackageData` helpers (layout + nodes + edges) and a `logData()` debug helper for a `UserWorkspace`.
- `compactGraph.ts` — **Lives here, not in `app/canvas/`.** The bidirectional serializer between the ReactFlow graph and the compact text format:
  - `graphToCompact(nodes, edges, layout)` → compact text for model context;
  - `parseCompactGraphToFull(text)` → nodes/edges, then positioned via `applyLayout`.
  - Imports `applyLayout` / `LayoutType` from `./graphLayout`.
- `graphLayout.ts` — The deterministic geometry engine. `applyLayout(layout, nodes, edges)` takes position-less nodes plus a `LayoutType` (`'radial' | 'hierarchical' | 'flowchart' | 'network' | 'mindmap'`) and returns nodes with computed `(x, y)` positions. Pure, no side effects. Imported by `app/canvas/Canvas.tsx` via `@/app/lib/graphLayout`. See companion `graphLayout.explained.txt` for a full walkthrough.

## Database

The app uses [Prisma](https://www.prisma.io) (ORM) with PostgreSQL. The schema lives in `prisma/schema.prisma`. The single table in use is `user_workspaces`, mapped from the `UserWorkspace` model (`@@map("user_workspaces")`). It stores one row per user with their canvas graph packed as JSON in the `data` column. The generated type is importable as `import type { UserWorkspace } from "@prisma/client"`.

> **Prisma is on v7** (`@prisma/client` / `prisma` both `^7.8.0`). v7 has **breaking changes** vs. v5/v6 — APIs, generator output, and driver-adapter signatures may differ from your training data. Before assuming a Prisma API shape, check the generated client in `node_modules/.prisma/client/index.d.ts` and the adapter types in `node_modules/@prisma/adapter-neon/dist/index.d.ts`. For example, `PrismaNeon` takes a `PoolConfig` object, not a `Pool` instance. After any schema change, run `bunx prisma generate` to refresh types.
