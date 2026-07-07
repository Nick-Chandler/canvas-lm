'use server';

import { auth } from '@clerk/nextjs/server';
import type { Node, Edge } from '@xyflow/react';
import type { LayoutType } from './graphLayout';
import { saveWorkspace, getMostRecentWorkspace } from './db';

export async function saveWorkspaceAction(nodes: Node[], edges: Edge[], layout: LayoutType, wsName?: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existing = await getMostRecentWorkspace(userId);
  return saveWorkspace(userId, nodes, edges, layout, existing?.id, wsName);
}
