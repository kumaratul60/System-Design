import React, { useState, useEffect, useMemo } from "react";
import { FileText, CheckCircle, AlertCircle, Search, ChevronRight, ChevronDown, Copy } from "lucide-react";

// Initial Complex Mock JSON Object representation
const INITIAL_JSON = {
  appName: "LLD Sandbox",
  version: 1.0,
  isActive: true,
  settings: {
    theme: "dark",
    telemetry: false,
    ports: [8080, 9000],
  },
  users: [
    { id: 101, username: "atul_dev", roles: ["admin", "staff"] },
    { id: 102, username: "gemini_bot", roles: ["guest"] },
  ],
};

export const JsonViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  const [rawInput, setRawInput] = useState(() => JSON.stringify(INITIAL_JSON, null, 2));
  const [parsedObject, setParsedObject] = useState<any>(INITIAL_JSON);
  const [formatError, setFormatError] = useState<string | null>(null);

  // Formatting settings configurations
  const [spaceIndent, setSpaceIndent] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);

  // Search filter and hover breadcrumb path states (Advance)
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Interactive collapsed folder key record registry
  const [collapsedKeys, setCollapsedKeys] = useState<Record<string, boolean>>({});

  const toggleCollapse = (pathKey: string) => {
    setCollapsedKeys((prev) => ({ ...prev, [pathKey]: !prev[pathKey] }));
  };

  // Parse raw JSON on input change
  const handleFormat = (inputVal: string, indent = spaceIndent) => {
    setRawInput(inputVal);
    if (!inputVal.trim()) {
      setParsedObject(null);
      setFormatError(null);
      return;
    }
    try {
      const parsed = JSON.parse(inputVal);
      setParsedObject(parsed);
      setFormatError(null);
      
      // Auto-update formatted text
      setRawInput(JSON.stringify(parsed, null, indent));
    } catch (err: any) {
      setFormatError(err.message || "Invalid JSON Syntax");
    }
  };

  const copyFormattedText = () => {
    navigator.clipboard.writeText(rawInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Re-run format on indent selection change
  useEffect(() => {
    handleFormat(rawInput, spaceIndent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceIndent]);

  // ----------------------------------------------------
  // --- SUB-COMPONENT: Recursive Object Tree Node -----
  // ----------------------------------------------------
  interface TreeNodeProps {
    value: any;
    nameKey: string | number;
    path: string;
    depth: number;
  }

  const RenderTreeNode: React.FC<TreeNodeProps> = ({ value, nameKey, path, depth }) => {
    const isObject = value !== null && typeof value === "object";
    const isArray = Array.isArray(value);
    const valueType = value === null ? "null" : typeof value;

    const currentPath = path ? (typeof nameKey === "number" ? `${path}[${nameKey}]` : `${path}.${nameKey}`) : String(nameKey);
    const isCollapsed = collapsedKeys[currentPath] || false;

    // Filter node based on advance query search matching keys or values
    const matchesQuery = useMemo(() => {
      if (!searchQuery.trim() || activeTab !== "advance") return true;
      const q = searchQuery.toLowerCase();
      const keyMatch = String(nameKey).toLowerCase().includes(q);
      const valMatch = !isObject && String(value).toLowerCase().includes(q);
      return keyMatch || valMatch;
    }, [nameKey, value, isObject]);

    if (!matchesQuery && !isObject) return null;

    const getTypeColor = () => {
      switch (valueType) {
        case "string": return "#10b981"; // success green
        case "number": return "#f59e0b"; // yellow
        case "boolean": return "#3b82f6"; // blue
        case "null": return "#ef4444"; // red
        default: return "var(--text-h)";
      }
    };

    return (
      <div
        style={{
          marginLeft: `${depth * 16}px`,
          marginTop: "4px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          if (activeTab === "advance") setHoveredPath(currentPath);
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
          {isObject ? (
            <span
              onClick={() => toggleCollapse(currentPath)}
              style={{ cursor: "pointer", display: "inline-flex", marginTop: "2px", color: "var(--text-muted)" }}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
          ) : (
            <span style={{ width: "14px" }} />
          )}

          <strong style={{ color: "var(--text-h)" }}>{nameKey}:</strong>

          {isObject ? (
            <span style={{ color: "var(--text-muted)" }}>
              {isArray ? `Array [${value.length}]` : "Object"}
            </span>
          ) : (
            <span style={{ color: getTypeColor() }}>
              {valueType === "string" ? `"${value}"` : String(value)}
              <span style={{ fontSize: "0.65rem", opacity: 0.5, marginLeft: "6px", textTransform: "uppercase" }}>
                ({valueType})
              </span>
            </span>
          )}
        </div>

        {isObject && !isCollapsed && (
          <div style={{ borderLeft: "1px dashed var(--border)", marginLeft: "6px", paddingLeft: "8px" }}>
            {Object.entries(value).map(([childKey, childVal]) => (
              <RenderTreeNode
                key={childKey}
                nameKey={isArray ? parseInt(childKey) : childKey}
                value={childVal}
                path={currentPath}
                depth={1} // don't accumulate indentation inside folder container
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <FileText className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>JSON Object Formatter & Viewer</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (JSON Prettify Formatter)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Complex Collapsible Tree)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Search Query & Path Tracker)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Raw JSON String Editor */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0 }}>Raw JSON Input text</h4>
            
            {/* Spacing selector */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Indent:</span>
              <button className={`btn ${spaceIndent === 2 ? "btn-primary" : "btn-secondary"}`} onClick={() => setSpaceIndent(2)} style={{ padding: "2px 8px", fontSize: "0.75rem" }}>2 Spaces</button>
              <button className={`btn ${spaceIndent === 4 ? "btn-primary" : "btn-secondary"}`} onClick={() => setSpaceIndent(4)} style={{ padding: "2px 8px", fontSize: "0.75rem" }}>4 Spaces</button>
            </div>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => handleFormat(e.target.value)}
            className="select-input"
            style={{
              width: "100%",
              height: "280px",
              background: "var(--input-bg)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              lineHeight: 1.4,
              resize: "vertical",
            }}
            placeholder="Paste raw JSON here..."
          />

          {/* Validation Banner */}
          <div style={{ marginTop: "12px" }}>
            {formatError ? (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid red", padding: "10px", borderRadius: "6px", color: "red", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} /> {formatError}
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--success)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} /> Valid JSON syntax.
                </span>
                <button className="btn btn-secondary" onClick={copyFormattedText} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", padding: "4px 10px" }}>
                  <Copy size={12} /> {copied ? "Copied" : "Copy Formatted"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tree Viewer visual panel */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", minHeight: "365px" }}>
          
          {/* Tabs header detail */}
          {activeTab === "basic" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%", justifyContent: "center", alignItems: "center", padding: "40px 0" }}>
              <FileText size={48} style={{ color: "var(--primary)" }} />
              <h4>Formatted Preview</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", maxWidth: "260px" }}>
                Select the Mid or Advance tabs to see an interactive, expandable tree node visualizer for your JSON object.
              </p>
            </div>
          ) : (
            <div>
              {/* Node query search bar (Advance) */}
              {activeTab === "advance" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", background: "var(--input-bg)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <Search size={14} style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search object keys or values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: "transparent", border: "none", width: "100%", color: "var(--text-h)", outline: "none", fontSize: "0.85rem" }}
                  />
                </div>
              )}

              {/* Breadcrumb Accessor Tracker (Advance) */}
              {activeTab === "advance" && hoveredPath && (
                <div style={{ background: "var(--input-bg)", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--primary)", wordBreak: "break-all", marginBottom: "12px" }}>
                  <strong>Accessor Path:</strong> <code>{hoveredPath}</code>
                </div>
              )}

              {/* Expandable Tree */}
              <div style={{ maxHeight: "300px", overflowY: "auto", padding: "10px", background: "var(--input-bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {parsedObject ? (
                  <RenderTreeNode
                    nameKey="root"
                    value={parsedObject}
                    path=""
                    depth={0}
                  />
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No valid parsed JSON object available.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
