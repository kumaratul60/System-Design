import React, { useState, useCallback } from "react";
import { translate } from "@statelab/theme";
import { ArrowUp, ArrowDown, Eye, Trash2, ListMinus, Plus, RefreshCw, Code} from "lucide-react";

// --- Types & Interfaces ---
export interface StackFrame {
  id: string;
  value: string;
  timestamp: string;
}

export interface UseStackParams {
  maxCapacity?: number;
}

// --- Data Layer: Custom Hook ---
export function useStackLogic({ maxCapacity = 8 }: UseStackParams = {}) {
  const [stack, setStack] = useState<StackFrame[]>([]);
  const [peekedFrameId, setPeekedFrameId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>(["Stack Initialized"]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addLog = useCallback((msg: string) => {
    setActivityLog((prev) => [msg, ...prev.slice(0, 9)]); // Keep last 10 logs
  }, []);

  const push = useCallback(
    (val: string) => {
      setErrorMsg(null);
      setPeekedFrameId(null);

      if (stack.length >= maxCapacity) {
        const error = "Stack Overflow: Maximum stack capacity reached.";
        setErrorMsg(error);
        addLog(error);
        return false;
      }

      const cleanVal = val.trim();
      if (!cleanVal) {
        setErrorMsg("Validation Error: Cannot push empty element.");
        return false;
      }

      const newFrame: StackFrame = {
        id: Math.random().toString(36).substring(2, 9),
        value: cleanVal,
        timestamp: new Date().toLocaleTimeString()};

      setStack((prev) => [newFrame, ...prev]); // Visual top is index 0
      addLog(`PUSH: "${cleanVal}" added to Stack Top`);
      return true;
    },
    [stack, maxCapacity, addLog]
  );

  const pop = useCallback(() => {
    setErrorMsg(null);
    setPeekedFrameId(null);

    if (stack.length === 0) {
      const error = "Stack Underflow: Cannot pop from empty stack.";
      setErrorMsg(error);
      addLog(error);
      return null;
    }

    const popped = stack[0];
    setStack((prev) => prev.slice(1));
    addLog(`POP: "${popped.value}" removed from Stack Top`);
    return popped;
  }, [stack, addLog]);

  const peek = useCallback(() => {
    setErrorMsg(null);
    if (stack.length === 0) {
      const error = "Peek Error: Stack is empty.";
      setErrorMsg(error);
      addLog(error);
      return null;
    }
    const topFrame = stack[0];
    setPeekedFrameId(topFrame.id);
    addLog(`PEEK: View Top Element -> "${topFrame.value}"`);
    return topFrame;
  }, [stack, addLog]);

  const clear = useCallback(() => {
    setErrorMsg(null);
    setStack([]);
    setPeekedFrameId(null);
    addLog("CLEAR: Flushed all elements from stack");
  }, [addLog]);

  return {
    stack,
    peekedFrameId,
    activityLog,
    errorMsg,
    push,
    pop,
    peek,
    clear,
    capacityUsed: stack.length,
    maxCapacity};
}

// --- UI Layer: Presentation Component ---
export const Stack: React.FC = () => {
  const maxCapacity = 8;
  const {
    stack,
    peekedFrameId,
    activityLog,
    errorMsg,
    push,
    pop,
    peek,
    clear,
    capacityUsed} = useStackLogic({ maxCapacity });

  const [inputVal, setInputVal] = useState<string>("");

  const handlePushSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = push(inputVal);
    if (success) {
      setInputVal("");
    }
  };

  const handleRandomPush = () => {
    const list = ["RenderTree", "FiberNode", "AuthCtx", "ReduxState", "DomNode", "EffectHook", "MemoValue", "FetchPromise"];
    const randomVal = list[Math.floor(Math.random() * list.length)];
    push(`${randomVal}#${Math.floor(Math.random() * 900 + 100)}`);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ListMinus className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Stack Visualizer (LIFO)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/Stack.tsx`}
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Left Side: Simulation Controls & Visualizer */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"}}
        >
          <h4>Stack Control Panel</h4>

          {/* Push Form */}
          <form onSubmit={handlePushSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Enter element payload..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="text-input"
              maxLength={15}
            />
            <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "4px" }}>
              <ArrowUp size={16} /> Push
            </button>
          </form>

          {/* Quick operations */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={handleRandomPush}>
              <Plus size={16} /> Push Random
            </button>
            <button className="btn btn-secondary" onClick={pop} disabled={stack.length === 0}>
              <ArrowDown size={16} /> Pop Element
            </button>
            <button className="btn btn-secondary" onClick={peek} disabled={stack.length === 0}>
              <Eye size={16} /> Peek Top
            </button>
            <button className="btn btn-secondary" onClick={clear} disabled={stack.length === 0}>
              <Trash2 size={16} /> Clear Stack
            </button>
          </div>

          {/* Status Indicators */}
          {errorMsg && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "var(--danger)",
                padding: "10px 14px",
                borderLeft: "3px solid var(--danger)",
                borderRadius: "var(--border-radius)",
                fontSize: "0.85rem"}}
            >
              {errorMsg}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              borderTop: "1px solid var(--border)",
              paddingTop: "12px"}}
          >
            <span>
              Stack Height: <strong>{capacityUsed}</strong> / {maxCapacity}
            </span>
            <span>
              Status:{" "}
              <strong style={{ color: capacityUsed === maxCapacity ? "var(--danger)" : capacityUsed === 0 ? "var(--text-muted)" : "var(--success)" }}>
                {capacityUsed === maxCapacity ? "FULL (Overflow risk)" : capacityUsed === 0 ? "EMPTY" : "OK"}
              </strong>
            </span>
          </div>

          {/* Vertical Stack Frame Visualizer */}
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--input-bg)",
              minHeight: "280px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: "8px",
              position: "relative"}}
          >
            {stack.length === 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem"}}
              >
                No frames allocated. Push data to visualize structure.
              </div>
            ) : (
              [...stack].reverse().map((frame, index) => {
                const isTop = index === stack.length - 1;
                const isPeeked = frame.id === peekedFrameId;
                return (
                  <div
                    key={frame.id}
                    style={{
                      background: isPeeked
                        ? "rgba(34, 197, 94, 0.15)"
                        : isTop
                        ? "var(--card-bg)"
                        : "var(--card-bg)",
                      border: isPeeked
                        ? "2px solid var(--success)"
                        : isTop
                        ? "2px solid var(--text-h)"
                        : "1px solid var(--border)",
                      padding: "12px",
                      borderRadius: "var(--border-radius)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transform: isTop ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.25s ease"}}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 6px",
                          background: "var(--input-bg)",
                          borderRadius: "4px",
                          fontWeight: "bold"}}
                      >
                        Idx {stack.length - 1 - index}
                      </span>
                      <strong style={{ color: "var(--text-h)" }}>{frame.value}</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{frame.timestamp}</span>
                      {isTop && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            background: "var(--text-h)",
                            color: "var(--bg)",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontWeight: "bold",
                            letterSpacing: "0.5px"}}
                        >
                          TOP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Execution Logs */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"}}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={16} /> Stack Frame Action History
            </h4>
          </div>

          <div
            style={{
              background: "#18181b",
              color: "#a1a1aa",
              borderRadius: "var(--border-radius)",
              padding: "16px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              flexGrow: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "360px"}}
          >
            {activityLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid #27272a",
                  paddingBottom: "6px",
                  color: log.startsWith("PUSH")
                    ? "#22c55e"
                    : log.startsWith("POP")
                    ? "#ef4444"
                    : log.startsWith("PEEK")
                    ? "#3b82f6"
                    : "#a1a1aa"}}
              >
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stack;
