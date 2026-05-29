'use client';

import React from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 1. Define initial nodes (shapes)
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Node A' },
    type: 'input', // React Flow built-in type
    style: { background: '#ff5555', color: 'white', borderRadius: '8px' }
  },
  {
    id: '2',
    position: { x: 300, y: 250 },
    data: { label: 'Node B' },
    style: { background: '#5555ff', color: 'white', borderRadius: '8px' }
  },
];

// 2. Define the connection between them
const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    animated: false // Makes the connection line animate
  },
];

export default function InfiniteCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        {/* Adds a grid background that updates infinitely while panning */}
        <Background gap={16} size={1} />
        
        {/* Adds UI controls for zoom-in, zoom-out, and lock features */}
        <Controls />
      </ReactFlow>
    </div>
  );
}