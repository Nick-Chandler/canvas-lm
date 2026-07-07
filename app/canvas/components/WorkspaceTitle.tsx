'use client';

import { useState } from 'react';

type WorkspaceTitleProps = {
  value: string;
  onCommit: (value: string) => void;
};

export default function WorkspaceTitle({ value, onCommit }: WorkspaceTitleProps) {
  const [draft, setDraft] = useState(value);

  return (
    <input
      className="workspace-title"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onFocus={e => e.target.select()}
      onBlur={() => onCommit(draft)}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      aria-label="Workspace name"
    />
  );
}
