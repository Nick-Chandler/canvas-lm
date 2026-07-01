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
import CanvasNode from './CanvasNode';
import { useGraphPersistence } from './hooks/useGraphPersistence';
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

export default function InfiniteCanvas() {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);
  const [layout, setLayout] = React.useState<LayoutType>('network');
  const [showingExamples, setShowingExamples] = React.useState(true);

  const { setSaveable } = useGraphPersistence({
    nodes, edges, showingExamples, setNodes, setEdges, setShowingExamples,
  });

  const { response, setResponse, loading, generate } = useGenerateGraph({
    nodes, edges, layout, showingExamples, setNodes, setEdges, setLayout,
  });

  const { addNode, clear } = useGraphActions({
    nodes, showingExamples, setNodes, setEdges, setShowingExamples, setResponse,
  });

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
