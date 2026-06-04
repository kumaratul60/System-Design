import React, { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, Layers, Layers3, ArrowUpDown } from "lucide-react";

// --- Types & Interfaces ---
export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface UseAccordionParams {
  items: AccordionItem[];
  initialAllowMultiple?: boolean;
  initialExpanded?: string[];
}

// --- Data Layer: Custom Hook ---
export function useAccordionLogic({
  items,
  initialAllowMultiple = false,
  initialExpanded = [],
}: UseAccordionParams) {
  const [expandedIds, setExpandedIds] = useState<string[]>(initialExpanded);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(initialAllowMultiple);

  const toggleItem = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        if (allowMultiple) {
          return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        } else {
          return prev.includes(id) ? [] : [id];
        }
      });
    },
    [allowMultiple]
  );

  const toggleMode = useCallback(() => {
    setAllowMultiple((prev) => {
      const nextMode = !prev;
      if (!nextMode) {
        // Switching to single-expand mode: keep only the first active accordion
        setExpandedIds((curr) => (curr.length > 0 ? [curr[0]] : []));
      }
      return nextMode;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (allowMultiple) {
      setExpandedIds(items.map((item) => item.id));
    }
  }, [allowMultiple, items]);

  const collapseAll = useCallback(() => {
    setExpandedIds([]);
  }, []);

  return {
    expandedIds,
    allowMultiple,
    toggleItem,
    toggleMode,
    expandAll,
    collapseAll,
  };
}

// --- Helper Child Component for Height Transitions ---
interface AccordionSectionProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ item, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | string>(0);

  useEffect(() => {
    if (isOpen) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.target.scrollHeight);
        }
      });

      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
        setHeight(contentRef.current.scrollHeight);
      }

      return () => resizeObserver.disconnect();
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--border-radius)",
        background: "var(--card-bg)",
        overflow: "hidden",
        transition: "var(--transition)",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-h)",
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          fontWeight: 600,
          textAlign: "left",
          outline: "none",
        }}
      >
        <span>{item.title}</span>
        <ChevronDown
          size={18}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            color: "var(--text-muted)",
          }}
        />
      </button>
      <div
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          overflow: "hidden",
          transition: "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: "0 16px 16px 16px",
            color: "var(--text)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          {item.content}
        </div>
      </div>
    </div>
  );
};

// --- Dummy Data ---
const DEFAULT_ITEMS: AccordionItem[] = [
  {
    id: "fsm",
    title: "Finite State Machine (FSM) in UI Engineering",
    content:
      "A Finite State Machine is a mathematical model of computation. In frontend LLD, it models components with a finite number of states (e.g., Idle, Loading, Success, Error). State transitions are deterministic and occur only in response to explicit actions, eliminating unpredictable 'impossible states'.",
  },
  {
    id: "virtualization",
    title: "How Virtual Viewports Work",
    content:
      "Virtualization handles rendering high-frequency tables or lists by only rendering elements that are inside the visible window. By calculating scroll offset, total container height, and child heights, it computes a starting index and slices the elements, rendering a container placeholder with absolute offsets.",
  },
  {
    id: "reconciliation",
    title: "React Reconciliation & Virtual DOM",
    content:
      "Reconciliation is React's diffing algorithm. It uses a heuristic algorithm with O(n) complexity. Key properties like stable 'key' props allow React to track element identity across renders, minimizing DOM insertions and updates for performance-critical components.",
  },
];

// --- UI Layer: Main Component ---
export const Accordions: React.FC = () => {
  const {
    expandedIds,
    allowMultiple,
    toggleItem,
    toggleMode,
    expandAll,
    collapseAll,
  } = useAccordionLogic({
    items: DEFAULT_ITEMS,
    initialAllowMultiple: false,
  });

  return (
    <div className="page-container">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ArrowUpDown className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Accordion System</h3>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          background: "var(--input-bg)",
          padding: "16px",
          borderRadius: "var(--border-radius)",
          alignItems: "center",
        }}
      >
        <button className="btn btn-primary" onClick={toggleMode}>
          {allowMultiple ? <Layers3 size={16} /> : <Layers size={16} />}
          Mode: {allowMultiple ? "Multi-Expand Enabled" : "Single-Expand Only"}
        </button>

        {allowMultiple && (
          <button className="btn btn-secondary" onClick={expandAll}>
            Expand All
          </button>
        )}

        <button className="btn btn-secondary" onClick={collapseAll}>
          Collapse All
        </button>

        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginLeft: "auto",
          }}
        >
          Active Expands: <strong>{expandedIds.length}</strong>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "12px",
        }}
      >
        {DEFAULT_ITEMS.map((item) => (
          <AccordionSection
            key={item.id}
            item={item}
            isOpen={expandedIds.includes(item.id)}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Accordions;
