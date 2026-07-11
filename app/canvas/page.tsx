import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Canvas from './Canvas';
import { getMostRecentWorkspace } from '../lib/db';

// A shortcut into the user's most recent workspace. Signed-out visitors (and
// signed-in users with no workspaces yet) get an unsaved playground canvas.
export default async function CanvasPage() {
  const { userId } = await auth();
  const workspace = userId ? await getMostRecentWorkspace(userId) : null;
  if (workspace) redirect(`/canvas/${workspace.id}`);

  return (
    <main>
      <Canvas workspaceId={null} data={null} />
    </main>
  );
}
