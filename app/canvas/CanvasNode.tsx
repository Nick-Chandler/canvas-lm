'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

function CanvasNode({ id, data }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const { setNodes } = useReactFlow();

  useEffect(() => {
    console.log("NODE RENDERED")
  }, []);

  function startEdit() {
    setDraft(String(data.label));
    setEditing(true);
  }

  function commitEdit() {
    setEditing(false);
    setNodes(nodes => nodes.map(node => {
      if (node.id !== id) {
        return node;
      }
      return { ...node, data: { ...node.data, label: draft } };
    }));
  }

  return (
    <>
      <Handle type="target" position={Position.Top} />
      {editing ? (
        <input
          autoFocus
          className="nodrag"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <div onDoubleClick={startEdit}>{String(data.label)}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default memo(CanvasNode);
