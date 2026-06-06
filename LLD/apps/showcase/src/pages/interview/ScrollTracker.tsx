import React, { useState, useEffect, useRef } from "react";
import { translate } from "@statelab/theme";
import { Activity, Move, Maximize2, MousePointer, Info, Code} from "lucide-react";

// --- Data Layer 1: Custom Hook for Window Dimensions ---
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height});

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height});
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// --- Data Layer 2: Custom Hook for Mouse Positions ---
export function useMousePosition(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [globalPos, setGlobalPos] = useState({ x: 0, y: 0 });
  const [localPos, setLocalPos] = useState({ x: 0, y: 0, isOver: false });

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      setGlobalPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    return () => window.removeEventListener("mousemove", handleMouseMoveGlobal);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMoveLocal = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      const isOver = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      setLocalPos({ x, y, isOver });
    };

    const handleMouseLeave = () => {
      setLocalPos((prev) => ({ ...prev, isOver: false }));
    };

    container.addEventListener("mousemove", handleMouseMoveLocal);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMoveLocal);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);

  return { globalPos, localPos };
}

// --- Data Layer 3: Custom Hook for Scroll Positions & Directions ---
export interface ScrollMetrics {
  x: number;
  y: number;
  directionX: "left" | "right" | "none";
  directionY: "up" | "down" | "none";
  isAtTop: boolean;
  isAtBottom: boolean;
  isAtLeft: boolean;
  isAtRight: boolean;
}

export function useScrollPosition(threshold = 50) {
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    x: 0,
    y: 0,
    directionX: "none",
    directionY: "none",
    isAtTop: true,
    isAtBottom: false,
    isAtLeft: true,
    isAtRight: false});

  const lastScroll = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const x = window.scrollX || window.pageXOffset;
      const y = window.scrollY || window.pageYOffset;

      const diffX = x - lastScroll.current.x;
      const diffY = y - lastScroll.current.y;

      let directionX: "left" | "right" | "none" = "none";
      if (diffX > 0) directionX = "right";
      else if (diffX < 0) directionX = "left";

      let directionY: "up" | "down" | "none" = "none";
      if (diffY > 0) directionY = "down";
      else if (diffY < 0) directionY = "up";

      // Proximities
      const isAtTop = y <= threshold;
      const isAtLeft = x <= threshold;

      // Scroll height checks
      const docHeight = document.documentElement.scrollHeight;
      const docWidth = document.documentElement.scrollWidth;
      const winHeight = window.innerHeight;
      const winWidth = window.innerWidth;

      const isAtBottom = docHeight - y - winHeight <= threshold;
      const isAtRight = docWidth - x - winWidth <= threshold;

      setMetrics({
        x: Math.round(x),
        y: Math.round(y),
        directionX,
        directionY,
        isAtTop,
        isAtBottom,
        isAtLeft,
        isAtRight});

      lastScroll.current = { x, y };
    };

    window.addEventListener("scroll", handleScroll);
    // Execute once initially to populate layout metrics
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return metrics;
}

// --- UI Presentation Component ---
export const ScrollTracker: React.FC = () => {
  const [threshold, setThreshold] = useState(50);
  const scroll = useScrollPosition(threshold);
  const win = useWindowSize();

  const padRef = useRef<HTMLDivElement>(null);
  const { globalPos, localPos } = useMousePosition(padRef);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Activity className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Viewport, Scroll & Pointer Auditor</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/ScrollTracker.tsx`}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Scroll Coordinates & Boundaries */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"}}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Move size={18} style={{ color: "var(--primary)" }} />
            <h4 style={{ margin: 0 }}>Scroll Metrics</h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Scroll X Coordinate</span>
              <strong style={{ fontSize: "1.4rem", fontFamily: "var(--font-mono)", color: "var(--text-h)" }}>{scroll.x} px</strong>
            </div>
            <div style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Scroll Y Coordinate</span>
              <strong style={{ fontSize: "1.4rem", fontFamily: "var(--font-mono)", color: "var(--text-h)" }}>{scroll.y} px</strong>
            </div>
          </div>

          {/* Scrolling Direction */}
          <div style={{ display: "flex", gap: "10px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Scrolling Direction:</span>
            <span style={{ fontWeight: "bold" }}>
              Y-Axis: {scroll.directionY === "none" ? "Stationary" : scroll.directionY.toUpperCase()}
              {" | "}
              X-Axis: {scroll.directionX === "none" ? "Stationary" : scroll.directionX.toUpperCase()}
            </span>
          </div>

          {/* Threshold setup */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              Boundary Trigger Threshold (current: {threshold}px)
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          {/* Boundary flags */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: scroll.isAtTop ? "rgba(34, 197, 94, 0.1)" : "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.9rem" }}>At Top boundary?</span>
              <strong style={{ color: scroll.isAtTop ? "var(--success)" : "var(--text-muted)" }}>{scroll.isAtTop ? "YES" : "NO"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: scroll.isAtBottom ? "rgba(34, 197, 94, 0.1)" : "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.9rem" }}>At Bottom boundary?</span>
              <strong style={{ color: scroll.isAtBottom ? "var(--success)" : "var(--text-muted)" }}>{scroll.isAtBottom ? "YES" : "NO"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: scroll.isAtLeft ? "rgba(34, 197, 94, 0.1)" : "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.9rem" }}>At Left boundary?</span>
              <strong style={{ color: scroll.isAtLeft ? "var(--success)" : "var(--text-muted)" }}>{scroll.isAtLeft ? "YES" : "NO"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: scroll.isAtRight ? "rgba(34, 197, 94, 0.1)" : "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.9rem" }}>At Right boundary?</span>
              <strong style={{ color: scroll.isAtRight ? "var(--success)" : "var(--text-muted)" }}>{scroll.isAtRight ? "YES" : "NO"}</strong>
            </div>
          </div>
        </div>

        {/* Viewport & Mouse Auditor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Viewport size card */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"}}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Maximize2 size={18} style={{ color: "var(--primary)" }} />
              <h4 style={{ margin: 0 }}>Viewport Size</h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
              <div>Window Width: <strong>{win.width} px</strong></div>
              <div>Window Height: <strong>{win.height} px</strong></div>
              <div>Screen Width: <strong>{win.screenWidth} px</strong></div>
              <div>Screen Height: <strong>{win.screenHeight} px</strong></div>
            </div>
          </div>

          {/* Mouse pointer coordinates */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px"}}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MousePointer size={18} style={{ color: "var(--primary)" }} />
              <h4 style={{ margin: 0 }}>Pointer Tracker</h4>
            </div>

            <div style={{ display: "flex", gap: "16px", background: "var(--input-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Viewport Relative X</span>
                <strong style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", color: "var(--text-h)" }}>{globalPos.x} px</strong>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Viewport Relative Y</span>
                <strong style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", color: "var(--text-h)" }}>{globalPos.y} px</strong>
              </div>
            </div>

            {/* Local Pointer Box */}
            <div
              ref={padRef}
              style={{
                height: "120px",
                border: "2px dashed var(--border)",
                borderRadius: "8px",
                background: localPos.isOver ? "rgba(59, 130, 246, 0.05)" : "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "crosshair",
                transition: "background 0.2s",
                position: "relative"}}
            >
              {localPos.isOver ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: "bold", color: "var(--primary)" }}>Inside Target Container</div>
                  <div style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "4px" }}>
                    X: {localPos.x} px | Y: {localPos.y} px
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", gap: "6px", alignItems: "center" }}>
                  <Info size={14} />
                  <span>Hover mouse here to track local coordinates</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Helper Scroll Instructions */}
      <div style={{ height: "400px", marginTop: "24px", border: "1px dashed var(--border)", borderRadius: "var(--border-radius)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.95rem", background: "var(--card-bg)" }}>
        Scroll down to see scroll metrics update. (Added height placeholder to document body)
      </div>
    </div>
  );
};

export default ScrollTracker;
