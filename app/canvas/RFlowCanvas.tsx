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
import { applyLayout, LayoutType } from './graphLayout';
// import { LogState } from './_components';
import CanvasNode from './CanvasNode';

const nodeTypes = { canvasNode: CanvasNode };

// Node Cordinates (x,y)
type Position = { x: number; y: number };

// Sample positions
const p1: Position = { x: 100, y: 50 }
const p2: Position = { x: 125, y: 200 }
const origin: Position = { x: 0, y: 0 }

const initialNodes: Node[] = [
  { id: '1', type: 'canvasNode', position: p1, data: { label: 'Enter what you want to visualize' } },
  { id: '2', type: 'canvasNode', position: p2, data: { label: 'Ask for changes/edits' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

/// Not going to lie these two function is one of the few vibe coded parts of the app
// 
//  Parse the model's compact text format back into ReactFlow nodes/edges
function graphToCompact(nodes: Node[], edges: Edge[], layout: LayoutType): string {
  const nodeLines = nodes.map(n => `${n.id}|${n.data.label}`).join('\n');
  const edgeLines = edges.map(e => `${e.source}>${e.target}`).join('\n');
  return `layout: ${layout}\n${nodeLines}\n---\n${edgeLines}`;
}
// Parse the model's compact text format back into ReactFlow nodes/edges
function parseCompactGraphToFull(text: string): { nodes: Node[]; edges: Edge[]; layout: LayoutType } {
  const [nodeSection = '', edgeSection = ''] = text.split(/^---$/m);

  const nodeLines = nodeSection
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const layoutMatch = nodeLines[0]?.match(/^layout:\s*(\w+)/);
  const layout = (layoutMatch?.[1] ?? 'network') as LayoutType;
  if (layoutMatch) nodeLines.shift();

  const parsedNodes: Node[] = nodeLines.map((line) => {
    const [id, label] = line.split('|');
    return { id, type: 'canvasNode', position: { x: 0, y: 0 }, data: { label } };
  });

  const edges: Edge[] = edgeSection
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [source, target] = line.split('>');
      return { id: `e${source}-${target}`, source, target };
    });

  const nodes = applyLayout(layout, parsedNodes, edges);
  return { nodes, edges, layout };
}

export default function InfiniteCanvas() {

  // Node source of truth
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  // Edge source of truth
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);
  
  const [input, setInput] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [responseExpanded, setResponseExpanded] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [layout, setLayout] = React.useState<LayoutType>('network');


  function handleAddNode() {
    const id = String(nodes.length + 1);
    const node: Node = {
      id,
      type: 'canvasNode',
      position: origin,
      data: { label: `Node ${id}` },
    };
    setNodes([...nodes, node]);
  }

  async function handleGenerate(prompt: string) {
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        currentGraph: nodes.length > 0 ? graphToCompact(nodes, edges, layout) : undefined,
      }),
    });
    if (!res.ok) {
      setResponse(`Error: ${res.status} ${res.statusText}`);
      setLoading(false);
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
      const { nodes: newNodes, edges: newEdges, layout: newLayout } = parseCompactGraphToFull(full);
      setNodes(newNodes);
      setEdges(newEdges);
      setLayout(newLayout);
    } catch {
      // response wasn't in the expected format — leave the canvas as-is
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setInput('');
    await handleGenerate(input);
  }

  return (
    <div className="canvas-wrapper">
      <div className="canvas-toolbar">
        <button onClick={handleAddNode}>+ Add Node</button>
        <button onClick={() => { setNodes([]); setEdges([]); setResponse(''); }}>Clear</button>
      </div>
      <div className="response-box">
        <div className="response-box-header" onClick={() => setResponseExpanded(e => !e)}>
          <span>Response</span>
          <span>{responseExpanded ? '▲' : '▼'}</span>
        </div>
        {responseExpanded && <pre className="response-box-content">{response}</pre>}
      </div>
      {loading && <div className="loading-watermark">Generating diagram...</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="user-input"
          placeholder="What do you want to visualize..."
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
        nodeTypes={nodeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}