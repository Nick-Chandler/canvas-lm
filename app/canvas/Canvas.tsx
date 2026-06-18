'use client';

import React, { useEffect } from 'react';
import { UserButton } from '@clerk/nextjs'
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
import './Canvas.css';
import { LayoutType } from './graphLayout';
import CanvasNode from './CanvasNode';
import { graphToCompact, parseCompactGraphToFull } from '@/app/lib/compactGraph';

const nodeTypes = { canvasNode: CanvasNode };

const initialNodes: Node[] = [
  { id: '1', type: 'canvasNode', position: { x: 100, y: 50 }, data: { label: 'Enter what you want to visualize' } },
  { id: '2', type: 'canvasNode', position: { x: 125, y: 200 }, data: { label: 'Ask for changes/edits' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

export default function InfiniteCanvas() {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);
  const [input, setInput] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [responseExpanded, setResponseExpanded] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [layout, setLayout] = React.useState<LayoutType>('network');
  const [showingExamples, setShowingExamples] = React.useState(true);

  function handleAddNode() {
    const base = showingExamples ? [] : nodes;
    const id = String(base.length + 1);
    const node: Node = { id, type: 'canvasNode', position: { x: 0, y: 0 }, data: { label: `Node ${id}` } };
    setNodes([...base, node]);
    if (showingExamples) { setEdges([]); setShowingExamples(false); }
  }

  useEffect(() => {
    const savedNodes = localStorage.getItem('nodes');
    const savedEdges = localStorage.getItem('edges');
    if (!savedNodes || !savedEdges) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNodes(JSON.parse(savedNodes));
    setEdges(JSON.parse(savedEdges));
    setShowingExamples(false);
  }, []);

  function saveGraph() {
    if (showingExamples) return;
    localStorage.setItem('nodes', JSON.stringify(nodes));
    localStorage.setItem('edges', JSON.stringify(edges));
    console.log('Graph saved to localStorage');
  }

  async function handleGenerate(prompt: string) {
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        currentGraph: !showingExamples && nodes.length > 0 ? graphToCompact(nodes, edges, layout) : undefined,
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
    if (showingExamples) { setNodes([]); setEdges([]); setShowingExamples(false); }
    await handleGenerate(input);
  }

  return (
    <div className="canvas-wrapper">
      <div className="canvas-toolbar">
        <button onClick={handleAddNode}>+ Add Node</button>
        <button onClick={() => { setNodes([]); setEdges([]); setResponse(''); }}>Clear</button>
      </div>
      <div className="top-right-overlay">
        <UserButton />
        <div className="response-box">
          <div className="response-box-header" onClick={() => setResponseExpanded(e => !e)}>
            <span>Response</span>
            <span>{responseExpanded ? '▲' : '▼'}</span>
          </div>
          {responseExpanded && <pre className="response-box-content">{response}</pre>}
        </div>
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
        onNodeDragStop={saveGraph}
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
