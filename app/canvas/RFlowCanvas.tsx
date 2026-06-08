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
const p1: Position = { x: 100, y: 100 }
const p2: Position = { x: 300, y: 200 }
const origin: Position = { x: 0, y: 0 }

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
  const [response, setResponse] = React.useState('');
  const [responseExpanded, setResponseExpanded] = React.useState(false);


  const handleLogState = () => {
    console.log('nodes:', nodes);
    console.log(JSON.stringify(nodes, null, 2));
    console.log('edges:', edges);
    console.log(JSON.stringify(edges, null, 2));
  };

  const handleAddNode = () => {
    const id = String(nodes.length + 1);
    const node: Node = {
      id,
      position: origin,
      data: { label: `Node ${id}` },
    };
    setNodes([...nodes, node]);
  };

  const handleGenerate = async (prompt: string) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      setResponse(`Error: ${res.status} ${res.statusText}`);
      return;
    }
    setResponse('');
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      full += chunk;
      setResponse(full);
    }
    try {
      const { nodes: newNodes, edges: newEdges } = JSON.parse(full);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch {
      // response wasn't valid JSON — leave the canvas as-is
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInput('');
    await handleGenerate(input);
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-toolbar">
        <button onClick={handleAddNode}>+ Add Node</button>
        <button onClick={handleLogState}>Log State</button>
      </div>
      <div className="response-box">
        <div className="response-box-header" onClick={() => setResponseExpanded(e => !e)}>
          <span>Response</span>
          <span>{responseExpanded ? '▲' : '▼'}</span>
        </div>
        {responseExpanded && <pre className="response-box-content">{response}</pre>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="user-input"
          placeholder="What do you want to diagram..."
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