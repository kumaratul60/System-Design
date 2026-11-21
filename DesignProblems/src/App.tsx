import React, { useState } from 'react';
import { PROBLEMS_REGISTRY } from './problems';

export const App: React.FC = () => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    PROBLEMS_REGISTRY[0]?.id || 'infinite-scroll'
  );

  const activeProblem =
    PROBLEMS_REGISTRY.find((p) => p.id === selectedProblemId) || PROBLEMS_REGISTRY[0];

  const ActiveComponent = activeProblem ? activeProblem.component : () => null;

  return (
    <div className="lld-studio-root">
      <header className="lld-studio-header">
        <div className="header-brand">
          <div className="brand-badge">LLD Studio</div>
          <h1>Frontend Design Problems</h1>
        </div>

        <nav className="problem-nav" aria-label="Problems list">
          {PROBLEMS_REGISTRY.map((problem) => (
            <button
              key={problem.id}
              className={`problem-nav-btn ${selectedProblemId === problem.id ? 'active' : ''}`}
              onClick={() => setSelectedProblemId(problem.id)}
            >
              <span className="btn-title">{problem.title}</span>
              <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            </button>
          ))}
        </nav>
      </header>

      {activeProblem && (
        <section className="problem-meta-banner">
          <div className="meta-info">
            <h2>{activeProblem.title}</h2>
            <p>{activeProblem.description}</p>
          </div>
          <div className="meta-tags">
            <span className="meta-category">{activeProblem.category}</span>
            {activeProblem.tags.map((tag) => (
              <span key={tag} className="meta-tag">
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      <main className="problem-workspace">
        <ActiveComponent />
      </main>
    </div>
  );
};

export default App;
