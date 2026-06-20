import { Node, Edge } from '@xyflow/react';

export type LayoutType = 'flowchart' | 'hierarchical' | 'mindmap' | 'network' | 'radial';

// Compute node positions from the graph structure and the chosen layout type.
export function applyLayout(layout: LayoutType, nodes: Node[], edges: Edge[]): Node[] {
  switch (layout) {
    case 'radial':
      return radial(nodes, edges);
    case 'hierarchical':
      return hierarchical(nodes, edges);
    case 'flowchart':
      return flowchart(nodes, edges);
    case 'mindmap':
      return mindmap(nodes, edges);
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
  return nodes.map((n) => {
    const position = pos.get(n.id) ?? { x: 0, y: 0 };
    return { ...n, position };
  });
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

// Top-down process flow. A post-order walk from the roots: leaves claim the
// next x slot left-to-right, and every parent is centred over the children it
// owns. So a single chain stays vertical while a decision that forks into
// distinct paths fans them out. Edges back to an already-placed node (branches
// that rejoin) keep their connection but don't move anything.
function flowchart(nodes: Node[], edges: Edge[]): Node[] {
  const { outgoing, indegree } = buildMaps(nodes, edges);
  const pos = new Map<string, { x: number; y: number }>();
  const seen = new Set<string>();
  let nextX = 0;

  const place = (id: string, depth: number): number => {
    seen.add(id);
    const kids = (outgoing.get(id) ?? []).filter((k) => !seen.has(k));
    const x = kids.length
      ? kids.reduce((sum, k) => sum + place(k, depth + 1), 0) / kids.length
      : (nextX += 350) - 350;
    pos.set(id, { x, y: depth * 250 });
    return x;
  };

  // Start from the roots (no incoming edges), then anything left over (cycles).
  nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).forEach((n) => place(n.id, 0));
  nodes.forEach((n) => { if (!seen.has(n.id)) place(n.id, 0); });

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

// Center node at the origin; the tree fans out in rings of increasing radius.
// Each node owns an angular sector, splits it evenly among its children, and
// recurses — so the layout handles arbitrary depth, not just two levels.
function mindmap(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;
  const { outgoing, indegree } = buildMaps(nodes, edges);

  // Center = a root (no incoming edges), else the first node.
  const center = nodes.find((n) => (indegree.get(n.id) ?? 0) === 0)?.id ?? nodes[0].id;

  const pos = new Map<string, { x: number; y: number }>();
  pos.set(center, { x: 0, y: 0 });

  const RING_GAP = 450; // distance between depth levels
  const seen = new Set<string>([center]); // guard against cycles

  // Place a node's children across the angular sector [start, end), then recurse.
  function place(parentId: string, depth: number, start: number, end: number) {
    const children = (outgoing.get(parentId) ?? []).filter((c) => !seen.has(c));
    if (children.length === 0) return;
    const span = (end - start) / children.length;
    children.forEach((childId, i) => {
      seen.add(childId);
      const childStart = start + i * span;
      const childEnd = childStart + span;
      const angle = (childStart + childEnd) / 2;
      const r = depth * RING_GAP;
      pos.set(childId, { x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) });
      place(childId, depth + 1, childStart, childEnd);
    });
  }

  place(center, 1, 0, 2 * Math.PI);

  return applyPositions(nodes, pos);
}

// Loose square grid for graphs with no clear shape.
function network(nodes: Node[]): Node[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  const pos = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, i) => {
    const x = (i % cols) * 400;
    const y = Math.floor(i / cols) * 400;
    pos.set(n.id, { x, y });
  });
  return applyPositions(nodes, pos);
}
