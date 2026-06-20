import { Node, Edge } from '@xyflow/react';
import { applyLayout, LayoutType } from '@/app/canvas/graphLayout';

// Serializes the current graph into the compact text format sent to the model as context
export function graphToCompact(nodes: Node[], edges: Edge[], layout: LayoutType): string {
  const nodeLines = nodes.map(n => `${n.id}|${n.data.label}`).join('\n');
  const edgeLines = edges.map(e => {
    // Only flowcharts carry edge labels (e.g. the "Yes"/"No" off a decision).
    const label = layout === 'flowchart' && e.label ? `:${e.label}` : '';
    return `${e.source}>${e.target}${label}`;
  }).join('\n');
  return `layout: ${layout}\n${nodeLines}\n---\n${edgeLines}`;
}

// Parses the model's compact text response into ReactFlow nodes/edges with computed positions
export function parseCompactGraphToFull(text: string): { nodes: Node[]; edges: Edge[]; layout: LayoutType } {
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

  const isFlowchart = layout === 'flowchart';
  const edges: Edge[] = edgeSection
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [source = '', rest = ''] = line.split('>');
      let target = rest.trim();
      let label: string | undefined;
      // Flowchart edges may append ":<label>" to annotate a branch.
      if (isFlowchart) {
        const colon = target.indexOf(':');
        if (colon !== -1) {
          label = target.slice(colon + 1).trim();
          target = target.slice(0, colon).trim();
        }
      }
      const edge: Edge = { id: `e${source.trim()}-${target}`, source: source.trim(), target };
      if (label) edge.label = label;
      return edge;
    });

  const nodes = applyLayout(layout, parsedNodes, edges);
  return { nodes, edges, layout };
}
