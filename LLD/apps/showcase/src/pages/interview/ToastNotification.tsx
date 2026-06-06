import React, { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, XCircle, X, Terminal, RefreshCw } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export const ToastNotification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Shared toast trigger
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast["type"], message: string, duration = 3000) => {
    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ==========================================
  // --- BASIC TAB (Simple top-right toast) ---
  // ==========================================
  const triggerBasicToast = () => {
    addToast("success", "Basic alert completed successfully!", 3000);
  };

  // ==========================================
  // --- MID TAB (Multi-type Stack) -----------
  // ==========================================
  const triggerStackedToast = (type: Toast["type"]) => {
    const msgs = {
      success: "System compiled. 0 warnings.",
      error: "NullPointerException resolved inside state provider.",
      warning: "Disk utilization exceeds 85% cache capacity.",
      info: "Thread count synchronized at port 8080.",
    };
    addToast(type, msgs[type], 4000);
  };

  // ==========================================
  // --- ADVANCE TAB (Swipe & Placement portals) -
  // ==========================================
  const [placement, setPlacement] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right">("top-right");
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);

  // Single Toast wrapper that manages its own auto-dismiss timer and pauses on hover
  const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const timerRef = useRef<any>(null);
    const [progress, setProgress] = useState(100);
    const remainingTimeRef = useRef(toast.duration || 3000);
    const startTimestampRef = useRef(Date.now());
    const isPausedRef = useRef(false);

    const startTimer = useCallback(() => {
      isPausedRef.current = false;
      startTimestampRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimestampRef.current;
        const remaining = remainingTimeRef.current - elapsed;
        
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          onRemove(toast.id);
        } else {
          const percent = (remaining / (toast.duration || 3000)) * 100;
          setProgress(percent);
        }
      }, 50);
    }, [toast.id, toast.duration, onRemove]);

    const pauseTimer = () => {
      isPausedRef.current = true;
      clearInterval(timerRef.current);
      const elapsed = Date.now() - startTimestampRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    };

    useEffect(() => {
      startTimer();
      return () => clearInterval(timerRef.current);
    }, [toast, startTimer]);

    const handleMouseEnter = () => {
      setHoveredToastId(toast.id);
      pauseTimer();
    };

    const handleMouseLeave = () => {
      setHoveredToastId(null);
      startTimer();
    };

    const getIcon = () => {
      switch (toast.type) {
        case "success": return <CheckCircle size={18} style={{ color: "#10b981" }} />;
        case "error": return <XCircle size={18} style={{ color: "#ef4444" }} />;
        case "warning": return <AlertTriangle size={18} style={{ color: "#f59e0b" }} />;
        case "info": return <Info size={18} style={{ color: "#3b82f6" }} />;
      }
    };

    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "12px 16px",
          width: "280px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          position: "relative",
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          {getIcon()}
          <span style={{ fontSize: "0.82rem", color: "var(--text-h)", flex: 1 }}>{toast.message}</span>
          <X size={14} onClick={() => onRemove(toast.id)} style={{ cursor: "pointer", color: "var(--text-muted)", marginTop: "2px" }} />
        </div>
        
        {/* Countdown micro progress bar */}
        <div style={{ width: "100%", height: "3px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary)", transition: "width 0.05s linear" }} />
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Terminal className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Toast Notifications Suite</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("basic"); setToasts([]); }}
        >
          Basic (Dismiss Alert)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setToasts([]); }}
        >
          Mid (Alert Types Stack)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setToasts([]); }}
        >
          Advance (Positioning & Hover Pause)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Controller Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4>Basic dismiss notification</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Click the button to spawn a basic notification in the top-right corner. It dismisses itself in 3 seconds.
              </p>
              <button className="btn btn-primary" onClick={triggerBasicToast}>Spawn Alert</button>
            </div>
          )}

          {/* TAB 2: MID MULTI-TYPE */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4>System Alerts Stack Manager</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Spawn different types of notification messages. The layout stacks them up to 5 items simultaneously.
              </p>
              
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="btn btn-secondary" onClick={() => triggerStackedToast("success")} style={{ borderLeft: "4px solid #10b981" }}>Success</button>
                <button className="btn btn-secondary" onClick={() => triggerStackedToast("error")} style={{ borderLeft: "4px solid #ef4444" }}>Error</button>
                <button className="btn btn-secondary" onClick={() => triggerStackedToast("warning")} style={{ borderLeft: "4px solid #f59e0b" }}>Warning</button>
                <button className="btn btn-secondary" onClick={() => triggerStackedToast("info")} style={{ borderLeft: "4px solid #3b82f6" }}>Info</button>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE HOVER & PLACEMENT */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4>Advance Placement Selection & Hover Pause</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Configure the target positioning portal and trigger alerts. Hovering over a toast pauses its auto-dismiss countdown timer.
              </p>

              {/* Placement Selector */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Choose Placement Portal:</label>
                <select value={placement} onChange={(e) => setPlacement(e.target.value as any)} className="select-input" style={{ width: "100%", marginTop: "6px", background: "var(--input-bg)" }}>
                  <option value="top-left">Top Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                  <option value="bottom-right">Bottom Right Corner</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={() => addToast("info", "Portal message dispatched successfully.", 4000)}>Spawn Portal Toast</button>
            </div>
          )}

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Active Toast Watcher</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Active Stack Size:</span> {toasts.length} items
            </div>
            {toasts.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                <span style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Stack Log:</span>
                <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {toasts.map((t) => (
                    <div key={t.id} style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      id: {t.id} | type: <span style={{ textTransform: "uppercase" }}>{t.type}</span> {hoveredToastId === t.id && <strong style={{ color: "var(--primary)" }}>(PAUSED)</strong>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <span style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}><RefreshCw size={14} style={{ display: "inline", marginRight: "4px" }} /> Timing Loop Rules</span>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block" }}>
                We avoid single setTimeout hooks because they cannot be paused on mouse hover.
                Instead, we run small interval ticks checking elapsed timestamp diffs.
                If hovered, we store the remaining duration and clear intervals until unhovered.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GLOBAL TOAST RENDERING PORTAL CONTAINER AT SPECIFIED POS */}
      {/* ======================================================== */}
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none", // click through container wrapper
          
          // Position mappings
          top: (activeTab === "advance" && placement.startsWith("bottom")) ? "auto" : "24px",
          bottom: (activeTab === "advance" && placement.startsWith("bottom")) ? "24px" : "auto",
          left: (activeTab === "advance" && placement.endsWith("left")) ? "24px" : "auto",
          right: (activeTab === "advance" && placement.endsWith("left")) ? "auto" : "24px",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastNotification;
