import React, { useState } from 'react';
import './styles.css';
import { TemplateState } from './types';

export const TemplateProblem: React.FC = () => {
  const [state] = useState<TemplateState>({
    items: [],
    status: 'idle',
    error: null,
  });

  return (
    <div className="template-problem-container">
      <header className="template-header">
        <h2>Problem Name Template</h2>
        <p>Design description, state management strategy, and implementation.</p>
      </header>

      <div className="template-content">
        <p>
          Status: <strong>{state.status}</strong>
        </p>
        <p>Start your implementation here following the problem's README.md plan.</p>
      </div>
    </div>
  );
};

export default TemplateProblem;
