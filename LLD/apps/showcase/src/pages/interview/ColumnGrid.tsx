import React, { useState } from "react";
import { Grid, RefreshCw, Layers, Compass, HelpCircle } from "lucide-react";

export const ColumnGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Grid Dimensions
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  // Mid tab state: tracked active / clicked cells
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Advance tab state: Layout algorithm picker
  const [layoutMode, setLayoutMode] = useState<"serpentine" | "row-major" | "col-major">("serpentine");

  const resetGrid = () => {
    setRows(2);
    setCols(2);
    setSelectedCells(new Set());
    setLayoutMode("serpentine");
  };

  // Cell Click Handler (for Mid/Interactive tab)
  const toggleCell = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedCells(newSelected);
  };

  // Helper to calculate cell value based on layout mode
  const getCellValue = (r: number, c: number, mode: "serpentine" | "row-major" | "col-major") => {
    if (mode === "row-major") {
      return r * cols + c + 1;
    }
    if (mode === "col-major") {
      return c * rows + r + 1;
    }
    // Column-Serpentine (Snake) Layout
    if (c % 2 === 0) {
      return c * rows + r + 1;
    } else {
      return c * rows + (rows - 1 - r) + 1;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Grid className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Column Grid Layout Visualizer</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("basic"); resetGrid(); }}
        >
          Basic (Snake Grid)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); resetGrid(); }}
        >
          Mid (Interactive Selection)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); resetGrid(); }}
        >
          Advance (Algorithm Compare)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Grid Visualizer */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
          
          {/* Controls Configs */}
          <div style={{ display: "flex", gap: "30px", justifyContent: "flex-start", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-h)" }}>Rows</span>
              <input
                type="range"
                min="1"
                max="6"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                style={{ cursor: "pointer", width: "150px" }}
              />
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", width: "12px" }}>{rows}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-h)" }}>Columns</span>
              <input
                type="range"
                min="1"
                max="6"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                style={{ cursor: "pointer", width: "150px" }}
              />
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", width: "12px" }}>{cols}</span>
            </div>

            {/* Layout Mode Selector (Advance only) */}
            {activeTab === "advance" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Layout:</span>
                <select
                  value={layoutMode}
                  onChange={(e) => setLayoutMode(e.target.value as any)}
                  className="select-input"
                  style={{ background: "var(--input-bg)", padding: "4px 8px", borderRadius: "6px" }}
                >
                  <option value="serpentine">Column Serpentine (Snake)</option>
                  <option value="col-major">Column Major</option>
                  <option value="row-major">Row Major</option>
                </select>
              </div>
            )}
          </div>

          {/* Rendered Grid */}
          <div style={{ display: "flex", justifyContent: "center", margin: "30px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateRows: `repeat(${rows}, 60px)`,
                gridTemplateColumns: `repeat(${cols}, 60px)`,
                gap: "8px",
              }}
            >
              {Array.from({ length: rows }).map((_, rIdx) => (
                Array.from({ length: cols }).map((_, cIdx) => {
                  const val = getCellValue(rIdx, cIdx, activeTab === "advance" ? layoutMode : "serpentine");
                  const key = `${rIdx}-${cIdx}`;
                  const isSelected = selectedCells.has(key);

                  return (
                    <div
                      key={key}
                      onClick={() => activeTab === "mid" && toggleCell(rIdx, cIdx)}
                      style={{
                        width: "60px",
                        height: "60px",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                        borderRadius: "6px",
                        background: isSelected
                          ? "rgba(59, 130, 246, 0.15)"
                          : "var(--input-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        color: isSelected ? "var(--primary)" : "var(--text-h)",
                        fontSize: "1.2rem",
                        cursor: activeTab === "mid" ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        userSelect: "none",
                      }}
                      title={`Row: ${rIdx + 1}, Col: ${cIdx + 1}`}
                    >
                      {val}
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button className="btn btn-secondary" onClick={resetGrid} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Reset Layout
            </button>
          </div>
        </div>

        {/* Right Side: Informational Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Layout Engine Specification</h4>
          
          <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "var(--text-h)" }}><Layers size={14} style={{ display: "inline", marginRight: "4px" }} /> Serpentine (Snake) Grid Math</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                In even columns, elements increase downwards. In odd columns, elements increase upwards:
                <br />
                <code>c % 2 === 0 ? c * rows + r + 1 : c * rows + (rows - 1 - r) + 1</code>.
              </p>
            </div>

            {activeTab === "mid" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                <strong style={{ color: "var(--text-h)" }}><Compass size={14} style={{ display: "inline", marginRight: "4px" }} /> Interactive Cell States</strong>
                <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  Active items are mapped in a state <code>Set</code>. Clicking individual cells triggers coordinate state toggle hooks.
                </p>
              </div>
            )}

            {activeTab === "advance" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                <strong style={{ color: "var(--text-h)" }}><HelpCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> Compare Grid Layouts</strong>
                <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  • <b>Row Major</b>: Left to right, top to bottom:
                  <br /><code>r * cols + c + 1</code>
                  <br />
                  • <b>Column Major</b>: Top to bottom, left to right:
                  <br /><code>c * rows + r + 1</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnGrid;
