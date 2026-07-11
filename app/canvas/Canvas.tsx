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
  useNodesInitialized,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Canvas.css';
import { useAuth } from '@clerk/nextjs';
import { LayoutType } from '@/app/lib/graphLayout';
import type { PackagedData } from '@/app/lib/db';
import { saveWorkspaceAction } from '@/app/lib/actions';
import CanvasNode from './CanvasNode';
import { useGenerateGraph } from './hooks/useGenerateGraph';
import { useGraphActions } from './hooks/useGraphActions';
import Toolbar from './components/Toolbar';
import Navbar from './components/Navbar';
import ResponseBox from './components/ResponseBox';
import PromptInput from './components/PromptInput';
import WorkspaceTitle from './components/WorkspaceTitle';

const nodeTypes = { canvasNode: CanvasNode };

// Signals once ReactFlow has measured every node (and thus fit the view correctly).
// Rendered inside <ReactFlow> so it has access to the flow context.
function FitOnReady({ onReady }: { onReady: () => void }) {
  const initialized = useNodesInitialized();
  React.useEffect(() => { if (initialized) onReady(); }, [initialized, onReady]);
  return null;
}

const initialNodes: Node[] = [
  { id: '1', type: 'canvasNode', position: { x: 100, y: 50 }, data: { label: 'Enter what you want to visualize' } },
  { id: '2', type: 'canvasNode', position: { x: 125, y: 200 }, data: { label: 'Ask for changes/edits' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

export default function Canvas({ workspaceId, data, wsName }: { workspaceId: string | null; data?: PackagedData | null; wsName?: string | null }) {

  // A brand-new workspace is saved with an empty graph, so "no saved nodes"
  // — not "no saved workspace" — is what means we should show the examples.
  const isEmpty = !data?.nodes?.length;

  // Diagram State
  const [nodes, setNodes] = React.useState<Node[]>(isEmpty ? initialNodes : data!.nodes);
  const [edges, setEdges] = React.useState<Edge[]>(isEmpty ? initialEdges : data!.edges);
  const [layout, setLayout] = React.useState<LayoutType>(data?.layout ?? 'network');

  // Workspace Title
  const [title, setTitle] = React.useState(wsName ?? 'Untitled workspace');

  // Tutorial Nodes Showing?
  const [showingExamples, setShowingExamples] = React.useState(isEmpty);

  // Hide the canvas until nodes are measured, to avoid the fitView flash on load.
  const [ready, setReady] = React.useState(false);

  // Save State
  const [saveable, setSaveable] = React.useState(true);
  const [saveStatus, setSaveStatus] = React.useState<'saving' | 'success' | 'error' | null>(null);

  // Auth
  const { isSignedIn } = useAuth();

  // Generate Graph Hook
  const { response, setResponse, loading, generate } = useGenerateGraph({
    nodes, edges, layout, showingExamples, setNodes, setEdges, setLayout,
  });

  // Graph Actions Hook - eg. addNode, clear, etc.
  const { addNode, clear } = useGraphActions({
    nodes, showingExamples, setNodes, setEdges, setShowingExamples, setResponse,
  });

  // Triggers save on change. No workspace (signed-out playground) means nowhere
  // to save; the placeholder examples aren't the user's content, so skip those too.
  React.useEffect(() => {
    if (!saveable || !workspaceId || showingExamples) return;
    let cancelled = false;
    (async () => {
      setSaveStatus('saving');
      try {
        await saveWorkspaceAction(workspaceId, nodes, edges, layout, title);
        if (!cancelled) setSaveStatus('success');
      } catch {
        if (!cancelled) setSaveStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [workspaceId, nodes, edges, layout, title, saveable, showingExamples]);

  // Submit
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
      <Navbar />
      <div className="canvas-topbar">
        <Toolbar onAddNode={addNode} onClear={clear} />
        <WorkspaceTitle value={title} onCommit={setTitle} />
        <div className="top-right-overlay">
          {isSignedIn && saveStatus && (
            <div className={`save-status save-status-${saveStatus}`}>
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'success' && 'Saved'}
              {saveStatus === 'error' && 'Save failed'}
            </div>
          )}
          <ResponseBox response={response} />
        </div>
      </div>
      {loading && <div className="loading-watermark">Generating diagram...</div>}
      <PromptInput onSubmitAction={handleSubmit} />
      <ReactFlow
        className={ready ? 'canvas-ready' : 'canvas-loading'}
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
        <FitOnReady onReady={() => setReady(true)} />
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
