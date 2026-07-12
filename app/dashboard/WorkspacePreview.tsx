'use client';

import React from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@/app/canvas/Canvas.css';
import type { PackagedData } from '@/app/lib/db';
import CanvasNode from '@/app/canvas/CanvasNode';
import FitOnReady from '@/app/canvas/FitOnReady';

const nodeTypes = { canvasNode: CanvasNode };

// A static thumbnail of a saved workspace. The saved nodes already carry their
// positions, so this just renders the stored graph — no layout pass needed.
export default function WorkspacePreview({ data }: { data: PackagedData | null }) {
  // Hide the graph until nodes are measured, to avoid the fitView flash on load.
  const [ready, setReady] = React.useState(false);

  if (!data?.nodes?.length) return null;

  return (
    <ReactFlow
      className={ready ? 'canvas-ready' : 'canvas-loading'}
      nodes={data.nodes}
      edges={data.edges}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.05}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
    >
      <FitOnReady onReady={() => setReady(true)} />
    </ReactFlow>
  );
}
