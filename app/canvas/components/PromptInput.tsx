'use client';

import React, { useState } from 'react';

export default function PromptInput({ onSubmitAction }: { onSubmitAction: (value: string) => void }) {
  const [input, setInput] = useState('');

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setInput('');
    onSubmitAction(input);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="user-input"
        placeholder="What do you want to visualize..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </form>
  );
}
