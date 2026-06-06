import React, { useState, useCallback, useMemo, useRef } from "react";
import { translate } from "@statelab/theme";
import { Layers, Code} from "lucide-react";

// --- Types & Interfaces ---
export interface VirtualListParams {
  itemCount: number;
  itemHeight: number;
  viewportHeight: number;
  bufferSize?: number;
}

// --- Data Layer: Custom Hook ---
export function useVirtualList({
  itemCount,
  itemHeight,
  viewportHeight,
  bufferSize = 5}: VirtualListParams) {
  const [scrollTop, setScrollTop] = useState<number>(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = itemCount * itemHeight;

  // Math for viewport slice index offsets
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + viewportHeight) / itemHeight) + bufferSize
  );

  // Absolute offset translation
  const offsetTop = startIndex * itemHeight;

  // Slice items to draw
  const visibleIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      indices.push(i);
    }
    return indices;
  }, [startIndex, endIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const targetScroll = index * itemHeight;
      viewport.scrollTop = targetScroll;
      setScrollTop(targetScroll);
    },
    [itemHeight]
  );

  return {
    viewportRef,
    totalHeight,
    offsetTop,
    visibleIndices,
    scrollTop,
    startIndex,
    endIndex,
    scrollToIndex,
    handleScroll};
}

// --- Generate Mock Datastore (10,000 items) ---
interface MockItem {
  id: number;
  uuid: string;
  name: string;
  category: string;
  status: "active" | "pending" | "suspended";
}

const GENERATE_MOCK_ITEMS = (count: number): MockItem[] => {
  const categories = ["Security", "Payment", "Analytics", "Database", "Queue"];
  const statuses: ("active" | "pending" | "suspended")[] = ["active", "pending", "suspended"];
  
  return Array.from({ length: count }).map((_, idx) => ({
    id: idx,
    uuid: `SYS-${Math.floor(Math.random() * 900000 + 100000)}`,
    name: `Enterprise Process Service Node #${idx + 1}`,
    category: categories[idx % categories.length],
    status: statuses[idx % statuses.length]}));
};

const ITEMS_COUNT = 10000;
const MOCK_DB = GENERATE_MOCK_ITEMS(ITEMS_COUNT);

// --- UI Layer: Presentation Component ---
export const Virtualization: React.FC = () => {
  const itemHeight = 60; // Hardcoded fixed row height in px
  const viewportHeight = 400; // Viewport height in px

  const {
    viewportRef,
    totalHeight,
    offsetTop,
    visibleIndices,
    scrollTop,
    startIndex,
    endIndex,
    scrollToIndex,
    handleScroll} = useVirtualList({
    itemCount: ITEMS_COUNT,
    itemHeight,
    viewportHeight,
    bufferSize: 4});

  const [jumpInput, setJumpInput] = useState<string>("");

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idx = parseInt(jumpInput);
    if (!isNaN(idx) && idx >= 0 && idx < ITEMS_COUNT) {
      scrollToIndex(idx);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Layers className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Virtual Viewport List (10k items)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/Virtualization.tsx`}
            target="_blank"
            rel="noopener noreferrer"
            title={translate("viewSource")}
            className="challenge-code-link-header"
            style={{ marginLeft: "auto", color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <Code size={20} />
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Stats and Operations */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"}}
        >
          <h4>Virtual List Parameters</h4>

          {/* Quick Stats table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Total Database Size:</span>
              <strong style={{ color: "var(--text-h)" }}>{ITEMS_COUNT.toLocaleString()} rows</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Viewport Size:</span>
              <span>{viewportHeight}px / {itemHeight}px row</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Scroll Top Offset:</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{scrollTop}px</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>DOM Slices Rendered:</span>
              <strong style={{ color: "var(--success)" }}>{visibleIndices.length} nodes</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Render Range Indices:</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>[{startIndex} - {endIndex}]</span>
            </div>
          </div>

          {/* Jump To Index form */}
          <form onSubmit={handleJumpSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Jump to Index</label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="number"
                placeholder="Index (0-9999)"
                min="0"
                max={ITEMS_COUNT - 1}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="text-input"
              />
              <button type="submit" className="btn btn-primary">
                Go
              </button>
            </div>
          </form>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => scrollToIndex(0)}>
              Scroll Top
            </button>
            <button className="btn btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => scrollToIndex(4999)}>
              Scroll Mid (5000)
            </button>
            <button className="btn btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => scrollToIndex(ITEMS_COUNT - 1)}>
              Scroll Bottom
            </button>
          </div>
        </div>

        {/* Right Side: Scroll Viewport */}
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          style={{
            height: `${viewportHeight}px`,
            overflowY: "auto",
            position: "relative",
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)"}}
        >
          {/* Scroll spacer to maintain physical scroll height */}
          <div style={{ height: `${totalHeight}px`, width: "100%", position: "absolute", top: 0, left: 0 }} />

          {/* Translation wrapper rendering only the visible items */}
          <div
            style={{
              transform: `translateY(${offsetTop}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column"}}
          >
            {visibleIndices.map((idx) => {
              const item = MOCK_DB[idx];
              const statusColors = {
                active: { bg: "rgba(34, 197, 94, 0.15)", text: "var(--success)" },
                pending: { bg: "rgba(245, 158, 11, 0.15)", text: "orange" },
                suspended: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--danger)" }};
              const col = statusColors[item.status];

              return (
                <div
                  key={item.id}
                  style={{
                    height: `${itemHeight}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    borderBottom: "1px solid var(--border)",
                    boxSizing: "border-box",
                    background: "var(--card-bg)"}}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        minWidth: "42px"}}
                    >
                      #{item.id}
                    </span>
                    <div>
                      <strong style={{ color: "var(--text-h)", fontSize: "0.9rem" }}>{item.name}</strong>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        ID: {item.uuid} • Category: {item.category}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      background: col.bg,
                      color: col.text,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      textTransform: "uppercase"}}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Virtualization;
