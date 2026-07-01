import { PrismaClient } from "@prisma/client";
import type { UserWorkspace } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import type { Edge, Node } from "@xyflow/react";
import type { LayoutType } from "./graphLayout";

let prisma: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!prisma) {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export type PackagedData = {
  layout: LayoutType;
  nodes: Node[];
  edges: Edge[];
};

export function packageData(
  layout: LayoutType,
  nodes: Node[],
  edges: Edge[]
): PackagedData {
  return { layout, nodes, edges };
}

export function unpackageData(data: PackagedData): {
  layout: LayoutType;
  nodes: Node[];
  edges: Edge[];
} {
  const { layout, nodes, edges } = data;
  return { layout, nodes: nodes ?? [], edges: edges ?? [] };
}

export async function saveWorkspace(
  userId: string,
  nodes: Node[],
  edges: Edge[],
  layout: LayoutType,
  workspaceId?: string | null
): Promise<UserWorkspace> {
  console.log("Saving Workspace...")
  const data = JSON.parse(JSON.stringify(packageData(layout, nodes, edges)));
  if (workspaceId != null) {
    return getDb().userWorkspace.update({
      where: { id: workspaceId },
      data: { data },
    });
  }
  return getDb().userWorkspace.create({
    data: { user_id: userId, data },
  });
}

export async function getMostRecentWorkspaces(
  user_id: string,
  n: number
): Promise<UserWorkspace[]> {
  return getDb().userWorkspace.findMany({
    where: { user_id },
    orderBy: { updated_at: "desc" },
    take: n,
  });
}

export async function getMostRecentWorkspace(
  user_id: string
): Promise<UserWorkspace | null> {
  const [workspace] = await getMostRecentWorkspaces(user_id, 1);
  return workspace ?? null;
}

export function logData(data: UserWorkspace | null) {
  if (data == null) { return }
  console.log("data:")
  console.log("Workspace ID:", data.id)
  console.log("User ID:", data.user_id)
  console.log("Workspace Created At:", data.created_at)
  console.log("Workspace Last Updated:", data.updated_at)
  console.log("data...")
  console.log(data.data)
}