import React, { useState, useRef, useMemo } from "react";
import { Columns, Layers, Copy, Check, Info, FileCode, Sparkles } from "lucide-react";

// Pre-defined initial mock values for testing diff checks
const INITIAL_LEFT = `// Project Config v1
const settings = {
  theme: "dark",
  enableTelemetry: true,
  ports: [8080, 9000],
  db: {
    host: "localhost",
    user: "root",
  }
};

function init() {
  console.log("Starting server...");
  connectDb();
}`;

const INITIAL_RIGHT = `// Project Config v2
const settings = {
  theme: "light",
  enableTelemetry: false,
  ports: [8080, 5000, 9000],
  db: {
    host: "127.0.0.1",
    user: "admin",
  }
};

function init() {
  console.log("Initializing server components...");
  connectDb();
  startCron();
}`;

// Myers-like LCS (Longest Common Subsequence) Algorithm for line diffing
interface LineDiffResult {
  type: "added" | "removed" | "unchanged";
  value: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function computeLineDiff(oldLines: string[], newLines: string[]): LineDiffResult[] {
  const n = oldLines.length;
  const m = newLines.length;
  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const diffs: LineDiffResult[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diffs.unshift({ type: "unchanged", value: oldLines[i - 1], oldLineNum: i, newLineNum: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffs.unshift({ type: "added", value: newLines[j - 1], newLineNum: j });
      j--;
    } else {
      diffs.unshift({ type: "removed", value: oldLines[i - 1], oldLineNum: i });
      i--;
    }
  }

  return diffs;
}

// Character level diffing logic for detailed inline highlighting
interface CharDiffResult {
  type: "added" | "removed" | "unchanged";
  value: string;
}

function computeCharDiff(oldStr: string, newStr: string): CharDiffResult[] {
  const n = oldStr.length;
  const m = newStr.length;
  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldStr[i - 1] === newStr[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const result: CharDiffResult[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
      result.unshift({ type: "unchanged", value: oldStr[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", value: newStr[j - 1] });
      j--;
    } else {
      result.unshift({ type: "removed", value: oldStr[i - 1] });
      i--;
    }
  }

  // Merge contiguous cells of the same diff type
  const grouped: CharDiffResult[] = [];
  for (const cell of result) {
    const last = grouped[grouped.length - 1];
    if (last && last.type === cell.type) {
      last.value += cell.value;
    } else {
      grouped.push({ ...cell });
    }
  }

  return grouped;
}

export const DiffChecker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");
  
  const [leftText, setLeftText] = useState(INITIAL_LEFT);
  const [rightText, setRightText] = useState(INITIAL_RIGHT);
  
  // Advance Config States
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [scrollSync, setScrollSync] = useState(true);
  const [copied, setCopied] = useState(false);

  // Sync scroll references
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const activeSide = useRef<"left" | "right" | null>(null);

  // Parse lines
  const leftLines = useMemo(() => leftText.split("\n"), [leftText]);
  const rightLines = useMemo(() => rightText.split("\n"), [rightText]);

  // Compute Line Diffs
  const lineDiffs = useMemo(() => {
    return computeLineDiff(leftLines, rightLines);
  }, [leftLines, rightLines]);

  // Compute Similarity Metrics
  const similarityScore = useMemo(() => {
    const oldStr = leftText;
    const newStr = rightText;
    if (!oldStr && !newStr) return 100;
    if (!oldStr || !newStr) return 0;
    
    // Character LCS score for similarity percentage
    const n = oldStr.length;
    const m = newStr.length;
    
    // Memory limit safeguard for extremely large inputs
    if (n > 2000 || m > 2000) {
      // Fallback to simpler word level matching calculation
      const w1 = oldStr.split(/\s+/);
      const w2 = newStr.split(/\s+/);
      const common = w1.filter(w => w2.includes(w)).length;
      return Math.round((2 * common) / (w1.length + w2.length) * 100);
    }

    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (oldStr[i - 1] === newStr[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    return Math.round((2 * dp[n][m]) / (n + m) * 100);
  }, [leftText, rightText]);

  // Scroll event synchronizer handlers
  const handleScroll = (side: "left" | "right") => {
    if (!scrollSync) return;
    if (activeSide.current && activeSide.current !== side) return;
    
    activeSide.current = side;
    const activeRef = side === "left" ? leftScrollRef : rightScrollRef;
    const targetRef = side === "left" ? rightScrollRef : leftScrollRef;
    
    if (activeRef.current && targetRef.current) {
      targetRef.current.scrollTop = activeRef.current.scrollTop;
      targetRef.current.scrollLeft = activeRef.current.scrollLeft;
    }
  };

  const handleTouchStart = (side: "left" | "right") => {
    activeSide.current = side;
  };

  const handleMouseEnter = (side: "left" | "right") => {
    activeSide.current = side;
  };

  // Reset scroll sync lock
  const handleScrollEnd = () => {
    // Clear lock on scroll idle
    setTimeout(() => {
      activeSide.current = null;
    }, 100);
  };

  const handleCopyUnified = () => {
    const unifiedContent = lineDiffs
      .map(d => {
        if (d.type === "added") return `+ ${d.value}`;
        if (d.type === "removed") return `- ${d.value}`;
        return `  ${d.value}`;
      })
      .join("\n");
    navigator.clipboard.writeText(unifiedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mid tab helper: character diff formatter for side-by-side lines
  const renderMidInlineDiff = (diffCell: LineDiffResult, pairedCell?: LineDiffResult) => {
    if (diffCell.type === "unchanged") {
      return <span>{diffCell.value}</span>;
    }

    // If we have a modification (removed line followed by/paired with an added line), we char diff
    if (diffCell.type === "removed" && pairedCell && pairedCell.type === "added") {
      const chars = computeCharDiff(diffCell.value, pairedCell.value);
      return (
        <>
          {chars.map((c, idx) => {
            if (c.type === "removed") {
              return (
                <span key={idx} style={{ background: "rgba(239, 68, 68, 0.45)", textDecoration: "line-through", borderRadius: "2px" }}>
                  {c.value}
                </span>
              );
            }
            if (c.type === "unchanged") return <span key={idx}>{c.value}</span>;
            return null; // Do not show added characters on the removed/left pane
          })}
        </>
      );
    }

    if (diffCell.type === "added" && pairedCell && pairedCell.type === "removed") {
      const chars = computeCharDiff(pairedCell.value, diffCell.value);
      return (
        <>
          {chars.map((c, idx) => {
            if (c.type === "added") {
              return (
                <span key={idx} style={{ background: "rgba(16, 185, 129, 0.45)", fontWeight: "bold", borderRadius: "2px" }}>
                  {c.value}
                </span>
              );
            }
            if (c.type === "unchanged") return <span key={idx}>{c.value}</span>;
            return null; // Do not show removed characters on the added/right pane
          })}
        </>
      );
    }

    // Default fallback simple colored lines
    return <span>{diffCell.value}</span>;
  };

  // Build paired alignment arrays for side-by-side visual columns in Mid/Advance
  const alignedRows = useMemo(() => {
    const rows: { left: LineDiffResult | null; right: LineDiffResult | null }[] = [];
    let i = 0;
    
    while (i < lineDiffs.length) {
      const current = lineDiffs[i];
      const next = lineDiffs[i + 1];

      // Detect paired replacement change: a REMOVE directly followed by an ADD
      if (current.type === "removed" && next && next.type === "added") {
        rows.push({ left: current, right: next });
        i += 2;
      } else if (current.type === "removed") {
        rows.push({ left: current, right: null });
        i++;
      } else if (current.type === "added") {
        rows.push({ left: null, right: current });
        i++;
      } else {
        rows.push({ left: current, right: current });
        i++;
      }
    }
    return rows;
  }, [lineDiffs]);

  return (
    <div className="page-container">
      {/* Header card */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <FileCode className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Text Diff Checker</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Line Highlighting)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => {
            setActiveTab("mid");
            setViewMode("split"); // Mid locks to side-by-side character diffs
          }}
        >
          Mid (Character Inline Diff)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Layouts, Sync Scroll & Metrics)
        </button>
      </div>

      {/* Text Area Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "16px" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: "bold", display: "block", marginBottom: "8px", color: "var(--text-h)" }}>Original Text (Left)</label>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            className="select-input"
            style={{ width: "100%", height: "120px", background: "var(--input-bg)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", resize: "vertical" }}
            placeholder="Type original source code or sentences..."
          />
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "16px" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: "bold", display: "block", marginBottom: "8px", color: "var(--text-h)" }}>Modified Text (Right)</label>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            className="select-input"
            style={{ width: "100%", height: "120px", background: "var(--input-bg)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", resize: "vertical" }}
            placeholder="Type modified target code or sentences..."
          />
        </div>
      </div>

      {/* Score bar & Advance actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", background: "var(--card-bg)", padding: "12px 20px", borderRadius: "10px", border: "1px solid var(--border)" }}>
        
        {/* Similarity Score */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "0.88rem", fontWeight: "bold" }}>LCS Similarity:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "100px", height: "10px", background: "var(--border)", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${similarityScore}%`,
                  height: "100%",
                  background: similarityScore > 75 ? "var(--success)" : similarityScore > 40 ? "#f59e0b" : "#ef4444",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <strong style={{ fontSize: "0.9rem", color: "var(--text-h)" }}>{similarityScore}%</strong>
          </div>
        </div>

        {/* Configurations (Advance tab only) */}
        {activeTab === "advance" && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {/* View Mode */}
            <div style={{ display: "flex", gap: "4px", background: "var(--input-bg)", padding: "2px", borderRadius: "6px", border: "1px solid var(--border)" }}>
              <button
                className={`btn ${viewMode === "split" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setViewMode("split")}
                style={{ padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Columns size={12} /> Split View
              </button>
              <button
                className={`btn ${viewMode === "unified" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setViewMode("unified")}
                style={{ padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Layers size={12} /> Unified View
              </button>
            </div>

            {/* Scroll Sync Toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={scrollSync}
                onChange={(e) => setScrollSync(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              Sync Scrolling
            </label>

            {/* Copy diff report */}
            <button className="btn btn-secondary" onClick={handleCopyUnified} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", padding: "4px 10px" }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy Diff Patch"}
            </button>
          </div>
        )}
      </div>

      {/* RENDER DIFF WORKSPACE */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--input-bg)", overflow: "hidden" }}>
        
        {/* VIEW 1: SPLIT SCREEN (SIDE BY SIDE) */}
        {viewMode === "split" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative" }}>
            
            {/* Divider line */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px", background: "var(--border)", zIndex: 5 }} />

            {/* Left Column (Original/Removed) */}
            <div
              ref={leftScrollRef}
              onScroll={() => handleScroll("left")}
              onTouchStart={() => handleTouchStart("left")}
              onMouseEnter={() => handleMouseEnter("left")}
              onScrollEnd={handleScrollEnd}
              style={{
                height: "360px",
                overflow: "auto",
                background: "var(--card-bg)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                padding: "8px 0"
              }}
            >
              {alignedRows.map((row, idx) => {
                const isRemoved = row.left?.type === "removed";
                const bgColor = isRemoved ? "rgba(239, 68, 68, 0.12)" : row.left ? "transparent" : "var(--input-bg)";
                const textColor = isRemoved ? "#f87171" : "var(--text-h)";

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      background: bgColor,
                      color: textColor,
                      minHeight: "22px",
                      lineHeight: "22px",
                      paddingRight: "10px",
                      borderLeft: isRemoved ? "3px solid #ef4444" : "3px solid transparent",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all"
                    }}
                  >
                    {/* Line number */}
                    <div style={{ width: "36px", textAlign: "right", paddingRight: "8px", color: "var(--text-muted)", userSelect: "none", borderRight: "1px solid var(--border)", marginRight: "10px", fontSize: "0.75rem" }}>
                      {row.left?.oldLineNum || ""}
                    </div>
                    {/* Operation Indicator */}
                    <div style={{ width: "16px", color: "#f87171", fontWeight: "bold", userSelect: "none", marginRight: "4px" }}>
                      {isRemoved ? "-" : ""}
                    </div>
                    {/* Content line rendering */}
                    <div style={{ flex: 1 }}>
                      {row.left ? (
                        activeTab === "mid" || activeTab === "advance" ? (
                          renderMidInlineDiff(row.left, row.right || undefined)
                        ) : (
                          row.left.value
                        )
                      ) : (
                        // Empty line spacer
                        <span style={{ display: "inline-block", height: "22px" }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column (Modified/Added) */}
            <div
              ref={rightScrollRef}
              onScroll={() => handleScroll("right")}
              onTouchStart={() => handleTouchStart("right")}
              onMouseEnter={() => handleMouseEnter("right")}
              onScrollEnd={handleScrollEnd}
              style={{
                height: "360px",
                overflow: "auto",
                background: "var(--card-bg)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                padding: "8px 0"
              }}
            >
              {alignedRows.map((row, idx) => {
                const isAdded = row.right?.type === "added";
                const bgColor = isAdded ? "rgba(16, 185, 129, 0.12)" : row.right ? "transparent" : "var(--input-bg)";
                const textColor = isAdded ? "#34d399" : "var(--text-h)";

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      background: bgColor,
                      color: textColor,
                      minHeight: "22px",
                      lineHeight: "22px",
                      paddingRight: "10px",
                      borderLeft: isAdded ? "3px solid #10b981" : "3px solid transparent",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all"
                    }}
                  >
                    {/* Line number */}
                    <div style={{ width: "36px", textAlign: "right", paddingRight: "8px", color: "var(--text-muted)", userSelect: "none", borderRight: "1px solid var(--border)", marginRight: "10px", fontSize: "0.75rem" }}>
                      {row.right?.newLineNum || ""}
                    </div>
                    {/* Operation Indicator */}
                    <div style={{ width: "16px", color: "#34d399", fontWeight: "bold", userSelect: "none", marginRight: "4px" }}>
                      {isAdded ? "+" : ""}
                    </div>
                    {/* Content line rendering */}
                    <div style={{ flex: 1 }}>
                      {row.right ? (
                        activeTab === "mid" || activeTab === "advance" ? (
                          renderMidInlineDiff(row.right, row.left || undefined)
                        ) : (
                          row.right.value
                        )
                      ) : (
                        // Empty line spacer
                        <span style={{ display: "inline-block", height: "22px" }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: UNIFIED SCREEN (STACKED LIST - ADVANCE TAB ONLY) */}
        {viewMode === "unified" && (
          <div
            style={{
              height: "360px",
              overflowY: "auto",
              background: "var(--card-bg)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              padding: "8px 0"
            }}
          >
            {lineDiffs.map((diff, idx) => {
              const isAdded = diff.type === "added";
              const isRemoved = diff.type === "removed";
              
              let bgColor = "transparent";
              let borderLeft = "3px solid transparent";
              let indicator = " ";
              let color = "var(--text-h)";

              if (isAdded) {
                bgColor = "rgba(16, 185, 129, 0.12)";
                borderLeft = "3px solid #10b981";
                indicator = "+";
                color = "#34d399";
              } else if (isRemoved) {
                bgColor = "rgba(239, 68, 68, 0.12)";
                borderLeft = "3px solid #ef4444";
                indicator = "-";
                color = "#f87171";
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    background: bgColor,
                    color: color,
                    minHeight: "22px",
                    lineHeight: "22px",
                    paddingRight: "10px",
                    borderLeft: borderLeft,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all"
                  }}
                >
                  {/* Left Line Number */}
                  <div style={{ width: "36px", textAlign: "right", paddingRight: "8px", color: "var(--text-muted)", userSelect: "none", borderRight: "1px solid var(--border)", marginRight: "5px", fontSize: "0.75rem" }}>
                    {diff.oldLineNum || ""}
                  </div>
                  {/* Right Line Number */}
                  <div style={{ width: "36px", textAlign: "right", paddingRight: "8px", color: "var(--text-muted)", userSelect: "none", borderRight: "1px solid var(--border)", marginRight: "10px", fontSize: "0.75rem" }}>
                    {diff.newLineNum || ""}
                  </div>
                  {/* Operator */}
                  <div style={{ width: "16px", fontWeight: "bold", userSelect: "none", marginRight: "4px" }}>
                    {indicator}
                  </div>
                  {/* Content line */}
                  <div style={{ flex: 1 }}>
                    {diff.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "16px", marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <Info size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
          <strong>LCS Dynamic Diffing:</strong> This component uses a 2D Longest Common Subsequence (LCS) matrix array alignment algorithm. Under <strong>Mid</strong> and <strong>Advance</strong> tabs, inline character-level difference arrays are computed dynamically if adjacent lines are identified as replacement sets.
        </p>
      </div>
    </div>
  );
};

export default DiffChecker;
