import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Workflow,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface WorkloopStep {
  flowNode: string;
  flowNodeLabel: string;
  wipNode: string | null;
  completedNodes: string[];
  description: string;
}

const workloopSteps: WorkloopStep[] = [
  {
    flowNode: 'Start',
    flowNodeLabel: 'Render Phase Starts',
    wipNode: 'App',
    completedNodes: [],
    description: 'Reconciliation begins at the root component (App). We allocate the first workInProgress Fiber.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE',
    wipNode: 'App',
    completedNodes: [],
    description: 'The workLoop retrieves the current workInProgress. workInProgress is pointing to App.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? No',
    wipNode: 'App',
    completedNodes: [],
    description:
      'Check if the browser has urgent events (user inputs, repaint tasks). We have remaining frame budget (5ms), so continue.',
  },
  {
    flowNode: 'BeginWork',
    flowNodeLabel: 'beginWork(App)',
    wipNode: 'App',
    completedNodes: [],
    description: 'beginWork is executed on App. It evaluates state/props and creates/reconciles child fibers.',
  },
  {
    flowNode: 'ChildCheck',
    flowNodeLabel: 'Child exists? Yes',
    wipNode: 'App',
    completedNodes: [],
    description: 'App has a child node (Header). The tree traversal prepares to go deeper.',
  },
  {
    flowNode: 'SetChild',
    flowNodeLabel: 'workInProgress = child',
    wipNode: 'Header',
    completedNodes: [],
    description: 'workInProgress points to Header. We loop back to process the child node next.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE',
    wipNode: 'Header',
    completedNodes: [],
    description: 'workLoop tick: workInProgress is Header.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? No',
    wipNode: 'Header',
    completedNodes: [],
    description: 'Remaining frame time is sufficient. Proceed to execute work on Header.',
  },
  {
    flowNode: 'BeginWork',
    flowNodeLabel: 'beginWork(Header)',
    wipNode: 'Header',
    completedNodes: [],
    description: 'beginWork executes on Header. It runs Header functional component and returns JSX.',
  },
  {
    flowNode: 'ChildCheck',
    flowNodeLabel: 'Child exists? No',
    wipNode: 'Header',
    completedNodes: [],
    description: 'Header has no child nodes. It is a leaf in the component tree.',
  },
  {
    flowNode: 'CompleteWork',
    flowNodeLabel: 'completeWork(Header)',
    wipNode: 'Header',
    completedNodes: ['Header'],
    description: 'completeWork compiles properties, creates host DOM node references, and gathers side effect flags.',
  },
  {
    flowNode: 'SiblingCheck',
    flowNodeLabel: 'Sibling exists? Yes',
    wipNode: 'Header',
    completedNodes: ['Header'],
    description: 'Header has a sibling node (Main) to evaluate.',
  },
  {
    flowNode: 'SetSibling',
    flowNodeLabel: 'workInProgress = sibling',
    wipNode: 'Main',
    completedNodes: ['Header'],
    description: 'workInProgress is updated to Main. We return to the main loop to process it.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE',
    wipNode: 'Main',
    completedNodes: ['Header'],
    description: 'workLoop tick: workInProgress is Main.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? No',
    wipNode: 'Main',
    completedNodes: ['Header'],
    description: 'Frame deadline not exceeded. Continue executing.',
  },
  {
    flowNode: 'BeginWork',
    flowNodeLabel: 'beginWork(Main)',
    wipNode: 'Main',
    completedNodes: ['Header'],
    description: "beginWork executes on Main. It reconciles Main's child: List.",
  },
  {
    flowNode: 'ChildCheck',
    flowNodeLabel: 'Child exists? Yes',
    wipNode: 'Main',
    completedNodes: ['Header'],
    description: 'Main has a child node (List). We prepare to traverse down.',
  },
  {
    flowNode: 'SetChild',
    flowNodeLabel: 'workInProgress = child',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'workInProgress is updated to List.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'workLoop tick: workInProgress is List.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? YES',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'Frame deadline hit! React yields control to the browser so the UI remains responsive.',
  },
  {
    flowNode: 'EndOrPause',
    flowNodeLabel: 'Is WIP null? No',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'workInProgress is still List (not null), meaning the render phase is suspended, not completed.',
  },
  {
    flowNode: 'PauseBrowser',
    flowNodeLabel: 'Yield to Browser Loop',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'React yields thread. Browser performs layout, paint, and events. React schedules resume task.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE (Resume)',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'Browser yields back. Scheduler restarts workLoop from where it left off, on List.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? No',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'Fresh frame budget (5ms). We continue processing List.',
  },
  {
    flowNode: 'BeginWork',
    flowNodeLabel: 'beginWork(List)',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'beginWork runs on List. It evaluates list items and reconciles children.',
  },
  {
    flowNode: 'ChildCheck',
    flowNodeLabel: 'Child exists? Yes',
    wipNode: 'List',
    completedNodes: ['Header'],
    description: 'List has child node ItemA. Traversing down.',
  },
  {
    flowNode: 'SetChild',
    flowNodeLabel: 'workInProgress = child',
    wipNode: 'ItemA',
    completedNodes: ['Header'],
    description: 'workInProgress is updated to ItemA.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE',
    wipNode: 'ItemA',
    completedNodes: ['Header'],
    description: 'workLoop tick: workInProgress is ItemA.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? No',
    wipNode: 'ItemA',
    completedNodes: ['Header'],
    description: 'Budget is fine, proceeding.',
  },
  {
    flowNode: 'BeginWork',
    flowNodeLabel: 'beginWork(ItemA)',
    wipNode: 'ItemA',
    completedNodes: ['Header'],
    description: 'beginWork evaluates ItemA (leaf node).',
  },
  {
    flowNode: 'ChildCheck',
    flowNodeLabel: 'Child exists? No',
    wipNode: 'ItemA',
    completedNodes: ['Header'],
    description: 'ItemA has no child. We prepare to complete its work.',
  },
  {
    flowNode: 'CompleteWork',
    flowNodeLabel: 'completeWork(ItemA)',
    wipNode: 'ItemA',
    completedNodes: ['Header', 'ItemA'],
    description: 'completeWork finishes ItemA, compiling DOM property updates.',
  },
  {
    flowNode: 'SiblingCheck',
    flowNodeLabel: 'Sibling exists? Yes',
    wipNode: 'ItemA',
    completedNodes: ['Header', 'ItemA'],
    description: 'ItemA has a sibling node: ItemB.',
  },
  {
    flowNode: 'SetSibling',
    flowNodeLabel: 'workInProgress = sibling',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA'],
    description: 'workInProgress updates to ItemB.',
  },
  {
    flowNode: 'WorkLoop',
    flowNodeLabel: 'WORKLOOP CORE',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA'],
    description: 'workLoop ticks on ItemB.',
  },
  {
    flowNode: 'YieldCheck',
    flowNodeLabel: 'Should yield? No',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA'],
    description: 'Continuing.',
  },
  {
    flowNode: 'BeginWork',
    flowNodeLabel: 'beginWork(ItemB)',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA'],
    description: 'beginWork evaluates ItemB (leaf node).',
  },
  {
    flowNode: 'ChildCheck',
    flowNodeLabel: 'Child exists? No',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA'],
    description: 'ItemB has no child. Preparing to complete.',
  },
  {
    flowNode: 'CompleteWork',
    flowNodeLabel: 'completeWork(ItemB)',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA', 'ItemB'],
    description: 'completeWork runs on ItemB.',
  },
  {
    flowNode: 'SiblingCheck',
    flowNodeLabel: 'Sibling exists? No',
    wipNode: 'ItemB',
    completedNodes: ['Header', 'ItemA', 'ItemB'],
    description: 'ItemB has no sibling. We begin walking up the parent scope chain.',
  },
  {
    flowNode: 'SetParent',
    flowNodeLabel: 'workInProgress = parent',
    wipNode: 'List',
    completedNodes: ['Header', 'ItemA', 'ItemB'],
    description: 'Since siblings are exhausted, workInProgress retreats back up to parent (List).',
  },
  {
    flowNode: 'ParentNullCheck',
    flowNodeLabel: 'Is parent null? No',
    wipNode: 'List',
    completedNodes: ['Header', 'ItemA', 'ItemB'],
    description: 'Parent (List) is valid. Complete work on List.',
  },
  {
    flowNode: 'CompleteWork',
    flowNodeLabel: 'completeWork(List)',
    wipNode: 'List',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List'],
    description: 'completeWork compiles List properties and consolidates hooks/effect lists.',
  },
  {
    flowNode: 'SiblingCheck',
    flowNodeLabel: 'Sibling exists? No',
    wipNode: 'List',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List'],
    description: 'List has no sibling. Retreating to parent Main.',
  },
  {
    flowNode: 'SetParent',
    flowNodeLabel: 'workInProgress = parent',
    wipNode: 'Main',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List'],
    description: 'workInProgress is set to Main.',
  },
  {
    flowNode: 'ParentNullCheck',
    flowNodeLabel: 'Is parent null? No',
    wipNode: 'Main',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List'],
    description: 'Parent (Main) is valid. Complete Main.',
  },
  {
    flowNode: 'CompleteWork',
    flowNodeLabel: 'completeWork(Main)',
    wipNode: 'Main',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main'],
    description: 'completeWork completes Main.',
  },
  {
    flowNode: 'SiblingCheck',
    flowNodeLabel: 'Sibling exists? No',
    wipNode: 'Main',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main'],
    description: 'Main has no sibling. Retreating to parent App.',
  },
  {
    flowNode: 'SetParent',
    flowNodeLabel: 'workInProgress = parent',
    wipNode: 'App',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main'],
    description: 'workInProgress is set to App.',
  },
  {
    flowNode: 'ParentNullCheck',
    flowNodeLabel: 'Is parent null? No',
    wipNode: 'App',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main'],
    description: 'Parent (App) is valid. Complete App.',
  },
  {
    flowNode: 'CompleteWork',
    flowNodeLabel: 'completeWork(App)',
    wipNode: 'App',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main', 'App'],
    description: 'completeWork completes App. Root reconciliation finishes.',
  },
  {
    flowNode: 'SiblingCheck',
    flowNodeLabel: 'Sibling exists? No',
    wipNode: 'App',
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main', 'App'],
    description: 'App has no sibling. Final retreat.',
  },
  {
    flowNode: 'SetParent',
    flowNodeLabel: 'workInProgress = parent',
    wipNode: null,
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main', 'App'],
    description: "workInProgress retreats to App's parent (null).",
  },
  {
    flowNode: 'ParentNullCheck',
    flowNodeLabel: 'Is parent null? Yes',
    wipNode: null,
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main', 'App'],
    description: 'Parent is null. The tree has been completely reconciled!',
  },
  {
    flowNode: 'EndRender',
    flowNodeLabel: 'End Render: Enter Commit',
    wipNode: null,
    completedNodes: ['Header', 'ItemA', 'ItemB', 'List', 'Main', 'App'],
    description:
      'Render phase ends. React takes the final fiber tree and enters the synchronous Commit Phase to flush updates to the real DOM.',
  },
];

export const FiberWorkloop: React.FC = () => {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1200); // ms per step

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < workloopSteps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const activeStep = workloopSteps[stepIdx];

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.min(workloopSteps.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(0);
  };

  const renderFiberTree = (activeNode: string | null, completed: string[]) => {
    const treeNodes = [
      { id: 'App', label: 'App', x: 130, y: 30 },
      { id: 'Header', label: 'Header', x: 60, y: 100 },
      { id: 'Main', label: 'Main', x: 200, y: 100 },
      { id: 'List', label: 'List', x: 200, y: 170 },
      { id: 'ItemA', label: 'ItemA', x: 130, y: 240 },
      { id: 'ItemB', label: 'ItemB', x: 270, y: 240 },
    ];

    const parentChildConnections = [
      { from: 'App', to: 'Header' },
      { from: 'App', to: 'Main' },
      { from: 'Main', to: 'List' },
      { from: 'List', to: 'ItemA' },
    ];

    const siblingArrows = [
      { from: 'Header', to: 'Main' },
      { from: 'ItemA', to: 'ItemB' },
    ];

    return (
      <svg viewBox="0 0 320 280" style={{ width: '100%', maxHeight: '280px' }}>
        <defs>
          <marker
            id="arrow-sibling-guide"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#c65911" />
          </marker>
        </defs>

        {/* Parent-child links */}
        {parentChildConnections.map((c, idx) => {
          const fromNode = treeNodes.find((n) => n.id === c.from);
          const toNode = treeNodes.find((n) => n.id === c.to);
          if (!fromNode || !toNode) return null;
          return (
            <line
              key={`link-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="var(--border)"
              strokeWidth="2.5"
            />
          );
        })}

        {/* Sibling pointers */}
        {siblingArrows.map((sa, idx) => {
          const fromNode = treeNodes.find((n) => n.id === sa.from);
          const toNode = treeNodes.find((n) => n.id === sa.to);
          if (!fromNode || !toNode) return null;
          return (
            <path
              key={`sibling-${idx}`}
              d={`M ${fromNode.x + 22} ${fromNode.y} Q ${(fromNode.x + toNode.x) / 2} ${fromNode.y - 12} ${toNode.x - 22} ${toNode.y}`}
              stroke="#c65911"
              strokeWidth="2"
              strokeDasharray="4 3"
              fill="none"
              markerEnd="url(#arrow-sibling-guide)"
            />
          );
        })}

        {/* Nodes */}
        {treeNodes.map((node) => {
          const isActive = activeNode === node.id;
          const isCompleted = completed.includes(node.id);

          let circleStroke = 'var(--border)';
          let circleFill = 'var(--card-bg)';
          let circleStrokeWidth = 2;

          if (isActive) {
            circleStroke = '#fb7185';
            circleStrokeWidth = 4;
          } else if (isCompleted) {
            circleStroke = '#10b981';
            circleFill = 'var(--input-bg)';
          }

          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r="22"
                fill={circleFill}
                stroke={circleStroke}
                strokeWidth={circleStrokeWidth}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.7))' : 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
              <text textAnchor="middle" dy="4" fontSize="9" fontWeight="bold" fill="var(--text-h)">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const flowNodes = {
    Start: { x: 220, y: 35, type: 'capsule', fill: '#e2f0d9', stroke: '#385723', label: 'Render Starts' },
    WorkLoop: { x: 220, y: 105, type: 'rect', fill: '#fff2cc', stroke: '#d6b656', label: 'WORKLOOP CORE' },
    YieldCheck: { x: 220, y: 190, type: 'diamond', fill: '#fce4d6', stroke: '#c65911', label: 'Should yield?' },
    EndOrPause: { x: 440, y: 190, type: 'diamond', fill: '#fce4d6', stroke: '#c65911', label: 'wip == null?' },
    EndRender: { x: 620, y: 190, type: 'capsule', fill: '#deeaf6', stroke: '#2f5597', label: 'Enter Commit' },
    PauseBrowser: { x: 440, y: 290, type: 'rect', fill: '#deeaf6', stroke: '#2f5597', label: 'Yield to Browser' },
    BeginWork: { x: 220, y: 290, type: 'rect', fill: '#fff2cc', stroke: '#d6b656', label: 'beginWork' },
    ChildCheck: { x: 220, y: 375, type: 'diamond', fill: '#fce4d6', stroke: '#c65911', label: 'Child exists?' },
    SetChild: { x: 80, y: 375, type: 'rect', fill: '#e2f0d9', stroke: '#385723', label: 'wip = child' },
    CompleteWork: { x: 220, y: 465, type: 'rect', fill: '#fff2cc', stroke: '#d6b656', label: 'completeWork' },
    SiblingCheck: { x: 220, y: 550, type: 'diamond', fill: '#fce4d6', stroke: '#c65911', label: 'Sibling exists?' },
    SetSibling: { x: 80, y: 550, type: 'rect', fill: '#e2f0d9', stroke: '#385723', label: 'wip = sibling' },
    SetParent: { x: 400, y: 550, type: 'rect', fill: '#e2f0d9', stroke: '#385723', label: 'wip = parent' },
    ParentNullCheck: { x: 400, y: 465, type: 'diamond', fill: '#fce4d6', stroke: '#c65911', label: 'Is parent null?' },
  };

  return (
    <div className="page-container fiber-workloop-page">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: '20px' }}>
        <div className="todos-header-title">
          <Workflow className="todos-title-icon" style={{ color: 'var(--primary)' }} />
          <h3>React Fiber WorkLoop Visual Animator</h3>
        </div>
        <span className="info-badge font-mono" style={{ fontSize: '0.8rem' }}>
          Reconciliation Engine
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Playback Controls Panel */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--card-bg)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="btn btn-secondary"
              style={{ padding: '6px 12px' }}
              title="Previous step"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handlePlayPause}
              className="btn btn-primary"
              style={{ padding: '6px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
            </button>
            <button
              onClick={handleNext}
              disabled={stepIdx === workloopSteps.length - 1}
              className="btn btn-secondary"
              style={{ padding: '6px 12px' }}
              title="Next step"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ padding: '6px 12px' }}
              title="Restart simulation"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Simulation Speed:</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="select-input"
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              <option value={2000}>Slow (2s)</option>
              <option value={1200}>Medium (1.2s)</option>
              <option value={600}>Fast (0.6s)</option>
            </select>

            <span className="font-mono info-badge" style={{ fontSize: '0.75rem' }}>
              Step {stepIdx + 1} / {workloopSteps.length}
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Fiber Tree State (Left) */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--card-bg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Fiber Tree Pointers</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                DFS path sequence (App $\rightarrow$ Header $\rightarrow$ Main $\rightarrow$ List $\rightarrow$ ItemA
                $\rightarrow$ ItemB).
              </p>
            </div>

            {renderFiberTree(activeStep.wipNode, activeStep.completedNodes)}

            {/* Tree Legend */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                fontSize: '0.7rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--card-bg)',
                    border: '2px solid var(--border)',
                    display: 'inline-block',
                  }}
                ></span>
                <span>Unvisited</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--card-bg)',
                    border: '2px solid #fb7185',
                    display: 'inline-block',
                    boxShadow: '0 0 4px rgba(251, 113, 133, 0.6)',
                  }}
                ></span>
                <span>workInProgress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--input-bg)',
                    border: '2px solid #10b981',
                    display: 'inline-block',
                  }}
                ></span>
                <span>completedWork</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ borderBottom: '2.5px dashed #c65911', width: '14px', display: 'inline-block' }}></span>
                <span style={{ color: '#c65911' }}>sibling pointer</span>
              </div>
            </div>
          </div>

          {/* Flowchart Panel (Right) */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--card-bg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>WorkInProgress Traversal Loop</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Flow chart showing state checks, began work steps, and yields.
              </p>
            </div>

            {/* SVG Flowchart */}
            <div
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--border-radius)',
                padding: '16px',
                overflow: 'hidden',
              }}
            >
              <svg viewBox="0 0 720 620" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <filter id="neon-glow-wip" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Connecting Paths */}
                {/* Start -> WorkLoop */}
                <path
                  d="M 220 53 L 220 87"
                  stroke={activeStep.flowNode === 'WorkLoop' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* WorkLoop -> YieldCheck */}
                <path
                  d="M 220 123 L 220 162"
                  stroke={activeStep.flowNode === 'YieldCheck' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* YieldCheck -> EndOrPause */}
                <path
                  d="M 265 190 L 395 190"
                  stroke={activeStep.flowNode === 'EndOrPause' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="320" y="182" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  Yes (Yield/null)
                </text>

                {/* YieldCheck -> BeginWork */}
                <path
                  d="M 220 218 L 220 272"
                  stroke={activeStep.flowNode === 'BeginWork' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="228" y="245" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  No
                </text>

                {/* EndOrPause -> EndRender */}
                <path
                  d="M 485 190 L 575 190"
                  stroke={activeStep.flowNode === 'EndRender' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="525" y="182" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  Yes
                </text>

                {/* EndOrPause -> PauseBrowser */}
                <path
                  d="M 440 218 L 440 272"
                  stroke={activeStep.flowNode === 'PauseBrowser' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="448" y="245" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  No
                </text>

                {/* PauseBrowser -> WorkLoop */}
                <path
                  d="M 440 308 L 440 325 L 530 325 L 530 105 L 270 105"
                  stroke={
                    activeStep.flowNode === 'WorkLoop' && activeStep.description.includes('Resume')
                      ? '#fb7185'
                      : 'var(--border)'
                  }
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* BeginWork -> ChildCheck */}
                <path
                  d="M 220 308 L 220 347"
                  stroke={activeStep.flowNode === 'ChildCheck' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* ChildCheck -> SetChild */}
                <path
                  d="M 175 375 L 130 375"
                  stroke={activeStep.flowNode === 'SetChild' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="150" y="367" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  Yes
                </text>

                {/* SetChild -> WorkLoop */}
                <path
                  d="M 30 375 L 15 375 L 15 105 L 170 105"
                  stroke={
                    activeStep.flowNode === 'WorkLoop' && activeStep.description.includes('child')
                      ? '#fb7185'
                      : 'var(--border)'
                  }
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* ChildCheck -> CompleteWork */}
                <path
                  d="M 220 403 L 220 447"
                  stroke={activeStep.flowNode === 'CompleteWork' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="228" y="425" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  No
                </text>

                {/* CompleteWork -> SiblingCheck */}
                <path
                  d="M 220 483 L 220 522"
                  stroke={activeStep.flowNode === 'SiblingCheck' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* SiblingCheck -> SetSibling */}
                <path
                  d="M 175 550 L 130 550"
                  stroke={activeStep.flowNode === 'SetSibling' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="150" y="542" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  Yes
                </text>

                {/* SetSibling -> WorkLoop */}
                <path
                  d="M 30 550 L 15 550 L 15 375"
                  stroke={
                    activeStep.flowNode === 'WorkLoop' && activeStep.description.includes('sibling')
                      ? '#fb7185'
                      : 'var(--border)'
                  }
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* SiblingCheck -> SetParent */}
                <path
                  d="M 265 550 L 350 550"
                  stroke={activeStep.flowNode === 'SetParent' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="300" y="542" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  No
                </text>

                {/* SetParent -> ParentNullCheck */}
                <path
                  d="M 400 532 L 400 493"
                  stroke={activeStep.flowNode === 'ParentNullCheck' ? '#fb7185' : 'var(--border)'}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* ParentNullCheck -> EndRender */}
                <path
                  d="M 445 465 L 620 465 L 620 208"
                  stroke={
                    activeStep.flowNode === 'EndRender' && activeStep.description.includes('null')
                      ? '#fb7185'
                      : 'var(--border)'
                  }
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="520" y="457" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  Yes
                </text>

                {/* ParentNullCheck -> CompleteWork */}
                <path
                  d="M 355 465 L 270 465"
                  stroke={
                    activeStep.flowNode === 'CompleteWork' && activeStep.description.includes('parent')
                      ? '#fb7185'
                      : 'var(--border)'
                  }
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="310" y="457" fontSize="9" fontWeight="bold" fill="var(--text-muted)">
                  No
                </text>

                {/* Nodes */}
                {Object.entries(flowNodes).map(([id, n]) => {
                  const isWip = activeStep.flowNode === id;

                  let shapeNode = null;
                  if (n.type === 'capsule') {
                    shapeNode = (
                      <rect
                        x={n.x - 45}
                        y={n.y - 18}
                        width={90}
                        height={36}
                        rx={18}
                        fill={n.fill}
                        stroke={isWip ? '#fb7185' : n.stroke}
                        strokeWidth={isWip ? 3.5 : 2}
                        filter={isWip ? 'url(#neon-glow-wip)' : 'none'}
                      />
                    );
                  } else if (n.type === 'rect') {
                    shapeNode = (
                      <rect
                        x={n.x - 50}
                        y={n.y - 18}
                        width={100}
                        height={36}
                        rx={4}
                        fill={n.fill}
                        stroke={isWip ? '#fb7185' : n.stroke}
                        strokeWidth={isWip ? 3.5 : 2}
                        filter={isWip ? 'url(#neon-glow-wip)' : 'none'}
                      />
                    );
                  } else if (n.type === 'diamond') {
                    shapeNode = (
                      <polygon
                        points={`${n.x},${n.y - 28} ${n.x + 45},${n.y} ${n.x},${n.y + 28} ${n.x - 45},${n.y}`}
                        fill={n.fill}
                        stroke={isWip ? '#fb7185' : n.stroke}
                        strokeWidth={isWip ? 3.5 : 2}
                        filter={isWip ? 'url(#neon-glow-wip)' : 'none'}
                      />
                    );
                  }

                  return (
                    <g key={id} style={{ transition: 'all 0.3s ease' }}>
                      {shapeNode}
                      <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#111827">
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Execution Description Context */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--border-radius)',
                background: 'var(--input-bg)',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <Activity size={16} style={{ color: '#ec4899' }} />
                <span
                  style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Loop state: {activeStep.flowNodeLabel}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-h)' }}>
                {activeStep.description}
              </p>

              {/* Memory stack registers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  borderTop: '1px solid var(--border)',
                  marginTop: '12px',
                  paddingTop: '12px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Layers size={12} /> workInProgress:
                  </span>
                  <span style={{ color: activeStep.wipNode ? '#fb7185' : 'var(--text-muted)', fontWeight: 'bold' }}>
                    {activeStep.wipNode ? `${activeStep.wipNode} (Fiber)` : 'null'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Clock size={12} /> Time Slice Budget:
                  </span>
                  <span
                    style={{
                      color: activeStep.flowNode === 'PauseBrowser' ? '#fb7185' : '#10b981',
                      fontWeight: 'bold',
                    }}
                  >
                    {activeStep.flowNode === 'YieldCheck' && activeStep.flowNodeLabel.includes('YES')
                      ? '0 ms (yielding)'
                      : '5 ms (stable)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* React Fiber Traversal Explanations */}
      <section style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
          <Cpu style={{ color: 'var(--primary)' }} /> Core React Fiber Engine Mechanics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>DFS LinkedList Traversal</h5>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              React doesn't recursively evaluate elements. Instead, it utilizes a singly-linked list structure. Pointers
              are checked sequentially: `child` moves down, `sibling` moves horizontally, and `return` (parent) moves
              back up.
            </p>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>beginWork Phase</h5>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              The step where React evaluates a Fiber. It reads props, processes state hooks queue, runs component
              function logic, and performs reconciliation to append or remove child node definitions.
            </p>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>completeWork Phase</h5>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Called when a Fiber has no children left (or child completed). It instantiates native browser elements
              (e.g. HTML input/div), registers styles, and aggregates side-effect logs to prepare for flushing to
              screen.
            </p>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>Time Slicing Yields</h5>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              To avoid locking up the main thread during huge renders, React checks the browser scheduler deadline
              (usually 5ms slots). If expired, it yields control back to the Event Loop and schedules a task to resume
              from where it paused.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
