import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Grid, CheckCircle, Info } from "lucide-react";

interface CellCoordinate {
  row: number;
  col: number;
}

export const AreaSelector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Grid settings configurations
  const [rowsCount, setRowsCount] = useState(10);
  const [colsCount, setColsCount] = useState(10);

  // Set of selected cells (formatted as 'row-col')
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Mouse Drag Tracking States
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CellCoordinate | null>(null);
  const [dragEnd, setDragEnd] = useState<CellCoordinate | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Hover state (Basic)
  const [hoveredCell, setHoveredCell] = useState<CellCoordinate | null>(null);

  // Clear selections helper
  const clearSelection = () => {
    setSelectedCells(new Set());
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  };

  // Setup bounds for dragging calculations
  const handleMouseDown = (e: React.MouseEvent, r: number, c: number) => {
    if (activeTab === "basic") return;
    
    setIsDragging(true);
    setDragStart({ row: r, col: c });
    setDragEnd({ row: r, col: c });

    // Multi-select modifier check (Ctrl or Cmd key)
    const isAdditive = e.ctrlKey || e.metaKey;
    if (!isAdditive) {
      setSelectedCells(new Set()); // Overwrite selection
    }
  };

  const handleMouseEnterCell = (r: number, c: number) => {
    setHoveredCell({ row: r, col: c });

    if (isDragging && dragStart) {
      setDragEnd({ row: r, col: c });
    }
  };

  // Perform bounding box calculations on drag release
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !dragEnd) return;

    setIsDragging(false);

    // Calculate coordinate bounds of bounding box
    const startRow = Math.min(dragStart.row, dragEnd.row);
    const endRow = Math.max(dragStart.row, dragEnd.row);
    const startCol = Math.min(dragStart.col, dragEnd.col);
    const endCol = Math.max(dragStart.col, dragEnd.col);

    const isAdditive = e.ctrlKey || e.metaKey;
    const nextSelected = isAdditive ? new Set(selectedCells) : new Set<string>();

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        nextSelected.add(`${r}-${c}`);
      }
    }

    setSelectedCells(nextSelected);
    setDragStart(null);
    setDragEnd(null);
  };

  // Handle global mouseup to safely end drag if released outside grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging]);

  // Reset grid sizes on tab changes
  useEffect(() => {
    setRowsCount(10);
    setColsCount(10);
    clearSelection();
  }, [activeTab]);

  // Helper to determine if a cell is currently in the active drag boundary
  const isCellInsideDragBoundary = (r: number, c: number): boolean => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    const startRow = Math.min(dragStart.row, dragEnd.row);
    const endRow = Math.max(dragStart.row, dragEnd.row);
    const startCol = Math.min(dragStart.col, dragEnd.col);
    const endCol = Math.max(dragStart.col, dragEnd.col);

    return r >= startRow && r <= endRow && c >= startCol && c <= endCol;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Grid className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Dynamic Area Selector</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Hover Grid Highlights)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Click & Drag Bounding Box)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Ctrl-Add Multi-Select & Sizing)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Grid board */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          
          {/* Dynamic Row/Column adjustment controls (Advance) */}
          {activeTab === "advance" && (
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px", width: "100%", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.85rem" }}>Rows: {rowsCount}</span>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={rowsCount}
                  onChange={(e) => setRowsCount(Number(e.target.value))}
                  style={{ cursor: "pointer", width: "80px" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.85rem" }}>Cols: {colsCount}</span>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={colsCount}
                  onChange={(e) => setColsCount(Number(e.target.value))}
                  style={{ cursor: "pointer", width: "80px" }}
                />
              </div>
            </div>
          )}

          {/* Grid Area container */}
          <div
            ref={gridRef}
            onMouseUp={handleMouseUp}
            style={{
              display: "grid",
              gridTemplateRows: `repeat(${rowsCount}, 1fr)`,
              gridTemplateColumns: `repeat(${colsCount}, 1fr)`,
              gap: "4px",
              padding: "8px",
              background: "var(--input-bg)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              userSelect: "none",
              cursor: activeTab === "basic" ? "default" : "crosshair",
            }}
          >
            {Array.from({ length: rowsCount }).map((_, r) =>
              Array.from({ length: colsCount }).map((_, c) => {
                const coord = `${r}-${c}`;
                const isSelected = selectedCells.has(coord);
                const isDraggingActive = isCellInsideDragBoundary(r, c);
                const isHovered = hoveredCell?.row === r && hoveredCell?.col === c;

                // Color mappings based on state precedence
                let bgVal = "var(--card-bg)";
                let borderVal = "1px solid var(--border)";

                if (activeTab === "basic" && isHovered) {
                  bgVal = "rgba(59, 130, 246, 0.2)";
                  borderVal = "1px solid var(--primary)";
                } else if (isDraggingActive) {
                  bgVal = "rgba(59, 130, 246, 0.4)";
                  borderVal = "1px solid var(--primary)";
                } else if (isSelected) {
                  bgVal = "var(--primary)";
                  borderVal = "1px solid var(--primary)";
                }

                return (
                  <div
                    key={coord}
                    onMouseDown={(e) => handleMouseDown(e, r, c)}
                    onMouseEnter={() => handleMouseEnterCell(r, c)}
                    style={{
                      width: rowsCount > 12 || colsCount > 12 ? "20px" : "28px",
                      height: rowsCount > 12 || colsCount > 12 ? "20px" : "28px",
                      background: bgVal,
                      border: borderVal,
                      borderRadius: "4px",
                      transition: "background-color 0.15s ease",
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Clear Actions */}
          {activeTab !== "basic" && (
            <button
              className="btn btn-secondary"
              onClick={clearSelection}
              style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={14} /> Reset Selection
            </button>
          )}
        </div>

        {/* Right Side: Log coordinates / Instructions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Coordinates log registry */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={16} /> Selected Coordinates ({selectedCells.size})</h4>
            {selectedCells.size > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  background: "var(--input-bg)",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                {Array.from(selectedCells).map((coord) => (
                  <span
                    key={coord}
                    style={{
                      fontSize: "0.75rem",
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      color: "var(--text-h)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ({coord.replace("-", ", ")})
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {activeTab === "basic" ? "Hover cells to see feedback." : "Click and drag to select grid regions."}
              </span>
            )}
          </div>

          {/* Instructions */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            <h4 style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}><Info size={16} /> Selection Guide</h4>
            
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4, display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeTab === "basic" && (
                <span>Hover cells to highlight coordinates. Selection click is disabled.</span>
              )}
              {activeTab === "mid" && (
                <span>Click and hold mouse down on any cell, drag bounding box boundary, and release to select intersecting grid sections.</span>
              )}
              {activeTab === "advance" && (
                <>
                  <span>• Bounding Box selection enabled.</span>
                  <span>• Hold <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>Ctrl</kbd> or <kbd style={{ background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>Cmd</kbd> keys while dragging to **accumulate** selections rather than overwriting.</span>
                  <span>• Adjust sliders to dynamically scale the grid coordinates.</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaSelector;
