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
import './Canvas.css';
import { LayoutType } from '@/app/lib/graphLayout';
import type { PackagedData } from '@/app/lib/db';
import CanvasNode from './CanvasNode';
import { useGenerateGraph } from './hooks/useGenerateGraph';
import { useGraphActions } from './hooks/useGraphActions';
import Toolbar from './components/Toolbar';
import AuthControl from './components/AuthControl';
import ResponseBox from './components/ResponseBox';
import PromptInput from './components/PromptInput';

const nodeTypes = { canvasNode: CanvasNode };

const initialNodes: Node[] = [
  { id: '1', type: 'canvasNode', position: { x: 100, y: 50 }, data: { label: 'Enter what you want to visualize' } },
  { id: '2', type: 'canvasNode', position: { x: 125, y: 200 }, data: { label: 'Ask for changes/edits' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

export default function InfiniteCanvas({ data }: { data?: PackagedData | null }) {
  const [nodes, setNodes] = React.useState<Node[]>(data?.nodes ?? initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(data?.edges ?? initialEdges);
  const [layout, setLayout] = React.useState<LayoutType>(data?.layout ?? 'network');
  const [showingExamples, setShowingExamples] = React.useState(data == null);

  const [saveable, setSaveable] = React.useState(true);

  const { response, setResponse, loading, generate } = useGenerateGraph({
    nodes, edges, layout, showingExamples, setNodes, setEdges, setLayout,
  });

  const { addNode, clear } = useGraphActions({
    nodes, showingExamples, setNodes, setEdges, setShowingExamples, setResponse,
  });

  React.useEffect(() => {
    if (!saveable) return;
    console.log("Calling Save API")
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges, layout }),
    });
  }, [nodes, edges]);

  async function handleSubmit(value: string) {
    if (showingExamples) {
      setNodes([]);
      setEdges([]);
      setShowingExamples(false);
    }
    await generate(value);
  }

  return (
    <div className="canvas-wrapper">
      <Toolbar onAddNode={addNode} onClear={clear} />
      <div className="top-right-overlay">
        <AuthControl />
        <ResponseBox response={response} />
      </div>
      {loading && <div className="loading-watermark">Generating diagram...</div>}
      <PromptInput onSubmitAction={handleSubmit} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes))}
        onEdgesChange={(changes: EdgeChange[]) => setEdges(applyEdgeChanges(changes, edges))}
        onNodeDragStart={() => setSaveable(false)}
        onNodeDragStop={() => setSaveable(true)}
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
