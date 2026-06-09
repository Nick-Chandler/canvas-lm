import { Node, Edge } from '@xyflow/react';

export type LayoutType = 'radial' | 'hierarchical' | 'linear' | 'network';

// Compute node positions from the graph structure and the chosen layout type.
// The model no longer emits coordinates — it just declares one of these shapes.
export function applyLayout(layout: LayoutType, nodes: Node[], edges: Edge[]): Node[] {
  switch (layout) {
    case 'radial':
      return radial(nodes, edges);
    case 'hierarchical':
      return hierarchical(nodes, edges);
    case 'linear':
      return linear(nodes, edges);
    default:
      return network(nodes);
  }
}

// --- helpers ---

// Outgoing adjacency list + indegree count, keyed by node id.
function buildMaps(nodes: Node[], edges: Edge[]) {
  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  nodes.forEach((n) => {
    outgoing.set(n.id, []);
    indegree.set(n.id, 0);
  });
  edges.forEach((e) => {
    outgoing.get(e.source)?.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  });
  return { outgoing, indegree };
}

// Apply a computed id -> position map, defaulting to the origin.
function applyPositions(nodes: Node[], pos: Map<string, { x: number; y: number }>): Node[] {
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? { x: 0, y: 0 } }));
}

// Visit order following edges from the roots, then any unvisited nodes in order.
function traversalOrder(nodes: Node[], edges: Edge[]): string[] {
  const { outgoing, indegree } = buildMaps(nodes, edges);
  const visited = new Set<string>();
  const order: string[] = [];
  const queue = nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    for (const child of outgoing.get(id) ?? []) if (!visited.has(child)) queue.push(child);
  }
  nodes.forEach((n) => {
    if (!visited.has(n.id)) order.push(n.id);
  });
  return order;
}

// --- layouts ---

// Top-down tree: longest-path level sets the row, siblings spread horizontally.
function hierarchical(nodes: Node[], edges: Edge[]): Node[] {
  const { outgoing, indegree } = buildMaps(nodes, edges);
  const level = new Map<string, number>();
  const remaining = new Map(indegree);
  const queue: string[] = [];
  nodes.forEach((n) => {
    if ((indegree.get(n.id) ?? 0) === 0) {
      level.set(n.id, 0);
      queue.push(n.id);
    }
  });
  while (queue.length) {
    const id = queue.shift()!;
    for (const child of outgoing.get(id) ?? []) {
      level.set(child, Math.max(level.get(child) ?? 0, (level.get(id) ?? 0) + 1));
      remaining.set(child, (remaining.get(child) ?? 0) - 1);
      if (remaining.get(child) === 0) queue.push(child);
    }
  }

  const byLevel = new Map<number, string[]>();
  nodes.forEach((n) => {
    const l = level.get(n.id) ?? 0;
    if (!byLevel.has(l)) byLevel.set(l, []);
    byLevel.get(l)!.push(n.id);
  });

  const pos = new Map<string, { x: number; y: number }>();
  for (const [l, ids] of byLevel) {
    ids.forEach((id, i) => {
      pos.set(id, { x: (i - (ids.length - 1) / 2) * 350, y: l * 250 });
    });
  }
  return applyPositions(nodes, pos);
}

// Hub (highest-degree node) at the center, peers spread evenly on a ring.
function radial(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  const degree = new Map<string, number>();
  nodes.forEach((n) => degree.set(n.id, 0));
  edges.forEach((e) => {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  });
  let hub = nodes[0].id;
  for (const n of nodes) if ((degree.get(n.id) ?? 0) > (degree.get(hub) ?? 0)) hub = n.id;

  const others = nodes.filter((n) => n.id !== hub).map((n) => n.id);
  const pos = new Map<string, { x: number; y: number }>();
  pos.set(hub, { x: 0, y: 0 });

  // One ring up to 12 nodes; split across two rings beyond that.
  const split = others.length > 12 ? Math.ceil(others.length / 2) : others.length;
  placeRing(others.slice(0, split), 500, pos);
  placeRing(others.slice(split), 900, pos);

  return applyPositions(nodes, pos);
}

function placeRing(ids: string[], r: number, pos: Map<string, { x: number; y: number }>) {
  ids.forEach((id, i) => {
    const angle = (2 * Math.PI / ids.length) * i;
    pos.set(id, { x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) });
  });
}

// Single left-to-right line in traversal order.
function linear(nodes: Node[], edges: Edge[]): Node[] {
  const pos = new Map<string, { x: number; y: number }>();
  traversalOrder(nodes, edges).forEach((id, i) => pos.set(id, { x: i * 400, y: 0 }));
  return applyPositions(nodes, pos);
}

// Loose square grid for graphs with no clear shape.
function network(nodes: Node[]): Node[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  const pos = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, i) => pos.set(n.id, { x: (i % cols) * 400, y: Math.floor(i / cols) * 400 }));
  return applyPositions(nodes, pos);
}
