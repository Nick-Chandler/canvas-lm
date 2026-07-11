import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import Canvas from '../Canvas';
import { getWorkspace, type PackagedData } from '@/app/lib/db';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const workspace = await getWorkspace(id, userId);
  if (!workspace) notFound();

  return (
    <main>
      <Canvas
        workspaceId={workspace.id}
        data={workspace.data as PackagedData | null}
        wsName={workspace.ws_name}
      />
    </main>
  );
}
