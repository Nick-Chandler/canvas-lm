import { Node, Edge } from '@xyflow/react';

type Args = {
  nodes: Node[];
  showingExamples: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setShowingExamples: (value: boolean) => void;
  setResponse: (value: string) => void;
};

export function useGraphActions({
  nodes,
  showingExamples,
  setNodes,
  setEdges,
  setShowingExamples,
  setResponse,
}: Args) {
  function addNode() {
    const base = showingExamples ? [] : nodes;
    const id = String(base.length + 1);
    const node: Node = { id, type: 'canvasNode', position: { x: 0, y: 0 }, data: { label: `Node ${id}` } };
    setNodes([...base, node]);
    if (showingExamples) { setEdges([]); setShowingExamples(false); }
  }

  function clear() {
    setNodes([]);
    setEdges([]);
    setResponse('');
  }

  return { addNode, clear };
}
