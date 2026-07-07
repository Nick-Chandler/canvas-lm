import { getDb } from "../lib/db";

const db = getDb();

await db.$executeRawUnsafe(
  'ALTER TABLE "user_workspaces" ADD COLUMN IF NOT EXISTS "ws_name" TEXT;'
);

console.log("Added ws_name column to user_workspaces (if it didn't already exist).");
