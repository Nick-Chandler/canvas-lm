'use client';

import React from 'react';
import { useNodesInitialized } from '@xyflow/react';

// Signals once ReactFlow has measured every node (and thus fit the view correctly).
// Render inside <ReactFlow> so it has access to the flow context.
export default function FitOnReady({ onReady }: { onReady: () => void }) {
  const initialized = useNodesInitialized();
  React.useEffect(() => { if (initialized) onReady(); }, [initialized, onReady]);
  return null;
}
