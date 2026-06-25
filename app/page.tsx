import InfiniteCanvas from './canvas/Canvas';
import { auth } from '@clerk/nextjs/server';

export default async function CanvasPage() {

  const { userId } = await auth()
  
  console.log(userId)

  return (
    <main>
      <InfiniteCanvas />
    </main>
  );
}
