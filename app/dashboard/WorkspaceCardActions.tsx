'use client';

import { renameWorkspaceAction, deleteWorkspaceAction } from '@/app/lib/actions';

export default function WorkspaceCardActions({ id, name }: { id: string; name: string }) {
  async function rename() {
    const next = window.prompt('Rename diagram', name)?.trim();
    if (next && next !== name) await renameWorkspaceAction(id, next);
  }

  async function remove() {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) {
      await deleteWorkspaceAction(id);
    }
  }

  return (
    <div className="workspace-card-actions">
      <button type="button" onClick={rename}>Rename</button>
      <button type="button" onClick={remove}>Delete</button>
    </div>
  );
}
