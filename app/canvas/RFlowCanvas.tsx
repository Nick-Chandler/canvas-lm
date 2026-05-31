'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './RFlowCanvas.css';

// Node Cordinates (x,y)
type Position = { x: number; y: number };

// Sample positions
let p1: Position = { x: 100, y: 100 }
let p2: Position = { x: 300, y: 200 }
let origin: Position = { x: 0, y: 0 }

// Sample nodes on load
const initialNodes: Node[] = [
  {
    id: '1',
    position: p1,
    data: { label: 'Node 1' },
    type: 'input',
  },
  {
    id: '2',
    position: p2,
    data: { label: 'Node 2' },
    type: 'output',
  },
];

// Sample edge connecting them
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
  },
];

export default function InfiniteCanvas() {

  // Node source of truth
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  // Edge source of truth
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);
  const [input, setInput] = React.useState('');


  const handleAddNode = () => {
    const id = String(nodes.length + 1);
    const node: Node = {
      id,
      position: origin,
      data: { label: `Node ${id}` },
    };
    setNodes([...nodes, node]);
  };

  // Debug
  React.useEffect(() => {
    console.log('nodes:', JSON.stringify(nodes, null, 2));
    console.log('edges:', JSON.stringify(edges, null, 2));
  }, [nodes, edges]);

  return (
    <div className="canvas-wrapper">
      <button onClick={handleAddNode} className="canvas-add-button">+</button>
      <form onSubmit={async (e) => {
        e.preventDefault();
        console.log(`submitted: "${input}"`);
        setInput('');
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input }),
        });
        const { text } = await res.json();
        console.log(text);
      }}>
        <input
          className="user-input"
          placeholder="What do you want to graph..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes))}
        onEdgesChange={(changes: EdgeChange[]) => setEdges(applyEdgeChanges(changes, edges))}
        onConnect={(connection: Connection) => setEdges(addEdge(connection, edges))}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}