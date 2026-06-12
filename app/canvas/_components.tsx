'use client';

import { Node, Edge } from '@xyflow/react';

interface LogStateProps {
  nodes: Node[];
  edges: Edge[];
}

export function LogState({ nodes, edges }: LogStateProps) {
  function handleLogState() {
    console.log('nodes:', nodes);
    console.log(JSON.stringify(nodes, null, 2));
    console.log('edges:', edges);
    console.log(JSON.stringify(edges, null, 2));
  }

  return <button onClick={handleLogState}>Log State</button>;
}
