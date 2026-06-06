import React, { useState, useEffect } from "react";
import { translate } from "@statelab/theme";
import { RefreshCw, Table, ChevronDown, ChevronUp, Code} from "lucide-react";

type SortOrder = "asc" | "desc" | null;

export const ColumnTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Grid Configuration States
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(4);

  // Spreadsheet Cell Data State (mapped as 'row_idx-col_idx')
  const [gridData, setGridData] = useState<Record<string, string>>({
    "0-0": "Apple", "0-1": "10", "0-2": "15",
    "1-0": "Banana", "1-1": "20", "1-2": "25",
    "2-0": "Cherry", "2-1": "5",  "2-2": "10",
    "3-0": "Orange", "3-1": "15", "3-2": "30"});

  // Sorting columns state
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Grid Style config
  const [showGridLines, setShowGridLines] = useState(true);

  // Clear Spreadsheet data helper
  const resetGrid = () => {
    setRows(activeTab === "basic" ? 5 : 5);
    setCols(activeTab === "basic" ? 4 : 4);
    setGridData({
      "0-0": "Apple", "0-1": "10", "0-2": "15",
      "1-0": "Banana", "1-1": "20", "1-2": "25",
      "2-0": "Cherry", "2-1": "5",  "2-2": "10",
      "3-0": "Orange", "3-1": "15", "3-2": "30"});
    setSortCol(null);
    setSortOrder(null);
    setShowGridLines(true);
  };

  useEffect(() => {
    resetGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Convert Column index to spreadsheet letter (0 -> A, 1 -> B, 25 -> Z)
  const getColLetter = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  const handleCellEdit = (r: number, c: number, val: string) => {
    setGridData((prev) => ({
      ...prev,
      [`${r}-${c}`]: val}));
  };

  // ----------------------------------------------------
  // --- FORMULA PARSING ENGINE (Advance) ---------------
  // ----------------------------------------------------
  const evaluateCellFormula = (formulaText: string): string => {
    if (!formulaText.startsWith("=")) return formulaText;

    const trimmed = formulaText.substring(1).toUpperCase().trim();

    try {
      // 1. Math SUM formula parser (=SUM(A1:B2))
      if (trimmed.startsWith("SUM(") && trimmed.endsWith(")")) {
        const range = trimmed.substring(4, trimmed.length - 1);
        const values = getRangeValues(range);
        return values.reduce((sum, v) => sum + v, 0).toString();
      }

      // 2. Math AVERAGE formula parser (=AVERAGE(A1:B2))
      if (trimmed.startsWith("AVERAGE(") && trimmed.endsWith(")")) {
        const range = trimmed.substring(8, trimmed.length - 1);
        const values = getRangeValues(range);
        if (values.length === 0) return "0";
        return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2).toString();
      }

      return "Formula Error";
    } catch {
      return "Formula Error";
    }
  };

  // Extract cell values matching ranges (e.g. 'A1:B2')
  const getRangeValues = (rangeStr: string): number[] => {
    const parts = rangeStr.split(":");
    if (parts.length !== 2) return [];

    const [startCell, endCell] = parts;
    const startCoord = parseCellCoords(startCell);
    const endCoord = parseCellCoords(endCell);

    if (!startCoord || !endCoord) return [];

    const minRow = Math.min(startCoord.row, endCoord.row);
    const maxRow = Math.max(startCoord.row, endCoord.row);
    const minCol = Math.min(startCoord.col, endCoord.col);
    const maxCol = Math.max(startCoord.col, endCoord.col);

    const values: number[] = [];

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const rawVal = gridData[`${r}-${c}`] || "";
        const num = parseFloat(rawVal);
        if (!isNaN(num)) values.push(num);
      }
    }
    return values;
  };

  // Convert cell key strings (e.g. 'A1') to rows/cols indexes
  const parseCellCoords = (cellStr: string): { row: number; col: number } | null => {
    const match = cellStr.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colStr = match[1];
    const rowStr = match[2];

    const col = colStr.charCodeAt(0) - 65;
    const row = parseInt(rowStr) - 1;

    return { row, col };
  };

  // ----------------------------------------------------
  // --- COLUMN SORTING LOGIC (Advance) -----------------
  // ----------------------------------------------------
  const handleSort = (colIdx: number) => {
    if (activeTab !== "advance") return;

    let nextOrder: SortOrder = "asc";
    if (sortCol === colIdx) {
      if (sortOrder === "asc") nextOrder = "desc";
      else if (sortOrder === "desc") nextOrder = null;
    }

    setSortCol(colIdx);
    setSortOrder(nextOrder);
  };

  // Memoized rows order matching sorted column rules
  const sortedRowIndexes = React.useMemo(() => {
    const indexes = Array.from({ length: rows }, (_, idx) => idx);

    if (activeTab !== "advance" || sortCol === null || sortOrder === null) {
      return indexes;
    }

    return [...indexes].sort((rowA, rowB) => {
      const valA = gridData[`${rowA}-${sortCol}`] || "";
      const valB = gridData[`${rowB}-${sortCol}`] || "";

      // Try numeric comparison
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortOrder === "asc" ? numA - numB : numB - numA;
      }

      // Fallback text comparison
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [rows, gridData, sortCol, sortOrder, activeTab]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Table className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Dynamic spreadsheet Column Table</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/ColumnTable.tsx`}
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

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Dimensions Inputs Grid)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Editable Cell Sliders)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Sort & Math Formulas)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Table spreadsheet */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px", overflowX: "auto" }}>
          
          {/* Controls configs */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            
            {/* Dimensions inputs for Basic */}
            {activeTab === "basic" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.85rem" }}>Rows:</span>
                  <input type="number" min="1" max="15" value={rows} onChange={(e) => setRows(Math.min(15, Math.max(1, Number(e.target.value))))} className="select-input" style={{ width: "60px", background: "var(--input-bg)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.85rem" }}>Cols:</span>
                  <input type="number" min="1" max="10" value={cols} onChange={(e) => setCols(Math.min(10, Math.max(1, Number(e.target.value))))} className="select-input" style={{ width: "60px", background: "var(--input-bg)" }} />
                </div>
              </div>
            )}

            {/* Sliders for Mid / Advance */}
            {activeTab !== "basic" && (
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.85rem" }}>Rows: {rows}</span>
                  <input type="range" min="1" max="15" value={rows} onChange={(e) => setRows(Number(e.target.value))} style={{ cursor: "pointer", width: "80px" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.85rem" }}>Cols: {cols}</span>
                  <input type="range" min="1" max="8" value={cols} onChange={(e) => setCols(Number(e.target.value))} style={{ cursor: "pointer", width: "80px" }} />
                </div>
              </div>
            )}

            {/* Visual configuration for Advance */}
            {activeTab === "advance" && (
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" checked={showGridLines} onChange={(e) => setShowGridLines(e.target.checked)} />
                Show Grid Lines
              </label>
            )}
          </div>

          {/* Spreadsheet structure */}
          <table
            className="architecture-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: showGridLines ? "1px solid var(--border)" : "none"}}
          >
            <thead>
              <tr style={{ background: "var(--input-bg)" }}>
                {/* Index Column header */}
                <th style={{ width: "40px", border: showGridLines ? "1px solid var(--border)" : "none", padding: "6px", textAlign: "center" }}>#</th>
                
                {/* Dynamic Columns headers */}
                {Array.from({ length: cols }).map((_, cIdx) => {
                  const isSorted = sortCol === cIdx;
                  return (
                    <th
                      key={cIdx}
                      onClick={() => handleSort(cIdx)}
                      style={{
                        border: showGridLines ? "1px solid var(--border)" : "none",
                        padding: "6px 10px",
                        textAlign: "left",
                        cursor: activeTab === "advance" ? "pointer" : "default",
                        userSelect: "none"}}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{getColLetter(cIdx)}</span>
                        {activeTab === "advance" && isSorted && (
                          <span>{sortOrder === "asc" ? <ChevronUp size={12} /> : sortOrder === "desc" ? <ChevronDown size={12} /> : ""}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedRowIndexes.map((rIdx, visualRowIdx) => (
                <tr key={rIdx} style={{ borderBottom: showGridLines ? "1px solid var(--border)" : "none" }}>
                  {/* Row Index number */}
                  <td style={{ borderRight: showGridLines ? "1px solid var(--border)" : "none", padding: "6px", textAlign: "center", fontSize: "0.8rem", background: "var(--input-bg)" }}>
                    {visualRowIdx + 1}
                  </td>
                  
                  {/* Columns cell text inputs */}
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const coord = `${rIdx}-${cIdx}`;
                    const rawVal = gridData[coord] || "";
                    const displayVal = activeTab === "advance" ? evaluateCellFormula(rawVal) : rawVal;

                    return (
                      <td
                        key={cIdx}
                        style={{
                          borderRight: showGridLines ? "1px solid var(--border)" : "none",
                          padding: "2px"}}
                      >
                        {activeTab === "basic" ? (
                          <span style={{ display: "block", padding: "6px", fontSize: "0.85rem", color: "var(--text-h)" }}>
                            {rawVal || "—"}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={rawVal}
                            onChange={(e) => handleCellEdit(rIdx, cIdx, e.target.value)}
                            className="select-input"
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              padding: "4px 8px",
                              fontSize: "0.85rem",
                              color: rawVal.startsWith("=") && activeTab === "advance" ? "var(--primary)" : "var(--text-h)"}}
                            title={rawVal.startsWith("=") && activeTab === "advance" ? `Formula: ${rawVal} (evaluates to ${displayVal})` : undefined}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button className="btn btn-secondary" onClick={resetGrid} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Clear Sheet
            </button>
          </div>
        </div>

        {/* Right Side: Spreadsheet Documentation */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Spreadsheet Engine Specification</h4>
          
          <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "var(--text-h)" }}>Interactive spreadsheet inputs</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Cells map their active content state on a coordinate dictionary object:
                <br />
                <code>gridData['row-col'] = value</code>.
              </p>
            </div>

            {activeTab === "advance" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                <strong style={{ color: "var(--text-h)" }}>Math Formula Evaluation</strong>
                <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  Any value beginning with <code>=</code> triggers the regex compiler parser:
                  <br />
                  • <code>=SUM(A1:B3)</code> sums all coordinate values in boundary bounds.
                  <br />
                  • <code>=AVERAGE(A1:A4)</code> averages values.
                </p>
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ color: "var(--text-h)" }}>Virtual sorting logic</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Clicking column header elements triggers row index array sorting:
                <br />
                <code>sortedRowIndexes.sort((a,b) =&gt; comp(gridData['a-col'], gridData['b-col']))</code>.
                This changes visual row ordering without mutating underlying cell indices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnTable;
