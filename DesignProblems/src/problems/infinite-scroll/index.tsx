import React, { useState } from 'react';
import { AppNew } from './AppNew';
import { AppWindowScroll } from './AppWindowScroll';
import './index.css';

export const InfiniteScrollProblem: React.FC = () => {
  const [activeApproach, setActiveApproach] = useState<'intersection' | 'windowScroll'>(
    'intersection'
  );

  return (
    <div className="problem-container">
      <nav className="approach-switcher" aria-label="Infinite Scroll Approach Switcher">
        <button
          className={`switch-btn ${activeApproach === 'intersection' ? 'active' : ''}`}
          onClick={() => setActiveApproach('intersection')}
        >
          Approach 1: IntersectionObserver (Sentinel)
        </button>
        <button
          className={`switch-btn ${activeApproach === 'windowScroll' ? 'active' : ''}`}
          onClick={() => setActiveApproach('windowScroll')}
        >
          Approach 2: Window Scroll (scrollY + innerHeight)
        </button>
      </nav>

      {activeApproach === 'intersection' ? <AppNew /> : <AppWindowScroll />}
    </div>
  );
};

export default InfiniteScrollProblem;
