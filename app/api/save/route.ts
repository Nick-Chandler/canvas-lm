import { auth } from '@clerk/nextjs/server';
import { saveWorkspace, getMostRecentWorkspace } from '@/app/lib/db';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { nodes, edges, layout } = await req.json();
  const existing = await getMostRecentWorkspace(userId);
  const saved = await saveWorkspace(userId, nodes, edges, layout, existing?.id);
  return Response.json(saved);
}
