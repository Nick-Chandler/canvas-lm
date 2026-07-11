'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Node, Edge } from '@xyflow/react';
import type { LayoutType } from './graphLayout';
import { saveWorkspace, getWorkspace, renameWorkspace, deleteWorkspace } from './db';

export async function saveWorkspaceAction(
  workspaceId: string,
  nodes: Node[],
  edges: Edge[],
  layout: LayoutType,
  wsName?: string | null
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existing = await getWorkspace(workspaceId, userId);
  if (!existing) throw new Error('Workspace not found');

  return saveWorkspace(userId, nodes, edges, layout, workspaceId, wsName);
}

export async function renameWorkspaceAction(workspaceId: string, wsName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const renamed = await renameWorkspace(workspaceId, userId, wsName);
  if (!renamed) throw new Error('Workspace not found');

  revalidatePath('/dashboard');
}

export async function deleteWorkspaceAction(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const deleted = await deleteWorkspace(workspaceId, userId);
  if (!deleted) throw new Error('Workspace not found');

  revalidatePath('/dashboard');
}

export async function createWorkspaceAction() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const workspace = await saveWorkspace(userId, [], [], 'network', null, 'Untitled workspace');
  redirect(`/canvas/${workspace.id}`);
}
