import InfiniteCanvas from './canvas/Canvas';
import { auth } from '@clerk/nextjs/server';
import { getDb, logData } from './lib/db';
import React from 'react';

export default async function CanvasPage() {


  const { userId } = await auth()
  console.log(userId)

  return (
    <main>
      <InfiniteCanvas />
    </main>
  );
}
