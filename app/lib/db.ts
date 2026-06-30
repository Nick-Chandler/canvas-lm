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

export function saveToDb() {
  
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