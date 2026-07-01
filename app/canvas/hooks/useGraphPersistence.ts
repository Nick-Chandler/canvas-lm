import { useEffect, useState } from 'react';
import { Node, Edge } from '@xyflow/react';

type Args = {
  nodes: Node[];
  edges: Edge[];
  showingExamples: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setShowingExamples: (value: boolean) => void;
};

export function useGraphPersistence({
  nodes,
  edges,
  showingExamples,
  setNodes,
  setEdges,
  setShowingExamples,
}: Args) {
  const [saveable, setSaveable] = useState(true);

  useEffect(() => {
    const savedNodes = localStorage.getItem('nodes');
    const savedEdges = localStorage.getItem('edges');
    if (!savedNodes || !savedEdges) return;
    setNodes(JSON.parse(savedNodes));
    setEdges(JSON.parse(savedEdges));
    setShowingExamples(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showingExamples || !saveable) return;
    localStorage.setItem('nodes', JSON.stringify(nodes));
    localStorage.setItem('edges', JSON.stringify(edges));
  }, [nodes, edges, showingExamples, saveable]);

  return { setSaveable };
}
