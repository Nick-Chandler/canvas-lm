import InfiniteCanvas from './canvas/Canvas';
import { auth } from '@clerk/nextjs/server';
import { getMostRecentWorkspace, type PackagedData } from './lib/db';
import React from 'react';

export default async function CanvasPage() {
  const { userId } = await auth()
  if (!(userId == null)) {
    console.log("User signed in!")
    console.log(userId)
  }
  else console.log("User NOT signed in")

  const workspace = userId ? await getMostRecentWorkspace(userId) : null;
  console.log(workspace)
  const data = (workspace?.data ?? null) as PackagedData | null;

  return (
    <main>
      <InfiniteCanvas data={data} />
    </main>
  );
}
