'use client';

type ToolbarProps = {
  onAddNode: () => void;
  onClear: () => void;
};

export default function Toolbar({ onAddNode, onClear }: ToolbarProps) {
  return (
    <div className="canvas-toolbar">
      <button onClick={onAddNode}>+ Add Node</button>
      <button onClick={onClear}>Clear</button>
    </div>
  );
}
