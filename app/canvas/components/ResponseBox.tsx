'use client';

import { useState } from 'react';

type ResponseBoxProps = {
  response: string;
};

export default function ResponseBox({ response }: ResponseBoxProps) {
  const [responseExpanded, setResponseExpanded] = useState(false);
  return (
    <div className="response-box">
      <div className="response-box-header" onClick={() => setResponseExpanded(e => !e)}>
        <span>Response</span>
        <span>{responseExpanded ? '▲' : '▼'}</span>
      </div>
      {responseExpanded && response && <pre className="response-box-content">{response}</pre>}
    </div>
  );
}
