import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { LayoutType } from '@/app/lib/graphLayout';
import { graphToCompact, parseCompactGraphToFull } from '@/app/lib/compactGraph';

type Args = {
  nodes: Node[];
  edges: Edge[];
  layout: LayoutType;
  showingExamples: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setLayout: (layout: LayoutType) => void;
};

export function useGenerateGraph({
  nodes,
  edges,
  layout,
  showingExamples,
  setNodes,
  setEdges,
  setLayout,
}: Args) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate(prompt: string) {
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

  return { response, setResponse, loading, generate };
}
