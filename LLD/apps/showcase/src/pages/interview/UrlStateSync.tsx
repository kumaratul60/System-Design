import React, { useState, useEffect, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Link, RefreshCw, Terminal, Copy, Check, Info, Code} from "lucide-react";

// Types for Mid filters
interface FilterState {
  q: string;
  category: string;
  inStock: boolean;
  sortBy: string;
}

// Types for Advance state
interface AdvanceState {
  page: number;
  limit: number;
  tags: string[];
  range: { min: number; max: number };
}

interface LogEntry {
  timestamp: string;
  type: "PUSH" | "RESTORE" | "COMPRESS" | "PARSE" | "POPSTATE";
  message: string;
  url: string;
}

export const UrlStateSync: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");
  
  // ----------------------------------------------------
  // --- BASIC STATE: Single text state syncer ----------
  // ----------------------------------------------------
  const [basicInput, setBasicInput] = useState("");
  const [basicUrlValue, setBasicUrlValue] = useState("");

  // ----------------------------------------------------
  // --- MID STATE: Multi-filter states -----------------
  // ----------------------------------------------------
  const [midFilters, setMidFilters] = useState<FilterState>({
    q: "",
    category: "all",
    inStock: false,
    sortBy: "relevance"
  });

  // ----------------------------------------------------
  // --- ADVANCE STATE: Base64 JSON state compressor ----
  // ----------------------------------------------------
  const [advanceState, setAdvanceState] = useState<AdvanceState>({
    page: 1,
    limit: 10,
    tags: ["typescript"],
    range: { min: 20, max: 80 }
  });

  const [availableTags] = useState(["react", "typescript", "css", "node", "system-design", "algorithms"]);
  const [urlConsoleLogs, setUrlConsoleLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Helper to log console entries
  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const time = new Date().toLocaleTimeString();
    setUrlConsoleLogs(prev => [
      { timestamp: time, type, message, url: window.location.search || "(empty)" },
      ...prev.slice(0, 19) // Keep last 20 entries
    ]);
  }, []);

  // ----------------------------------------------------
  // --- STATE DESERIALIZER (URL -> APP STATE) ----------
  // ----------------------------------------------------
  const restoreStateFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (activeTab === "basic") {
      const q = params.get("q") || "";
      setBasicInput(q);
      setBasicUrlValue(q);
      addLog("PARSE", `Restored basic state from URL query "?q=${q}"`);
    } 
    
    else if (activeTab === "mid") {
      const q = params.get("q") || "";
      const category = params.get("category") || "all";
      const inStock = params.get("inStock") === "true";
      const sortBy = params.get("sortBy") || "relevance";
      
      const newFilters = { q, category, inStock, sortBy };
      setMidFilters(newFilters);
      addLog("PARSE", `Restored multi-filters state: ${JSON.stringify(newFilters)}`);
    } 
    
    else if (activeTab === "advance") {
      const stateBase64 = params.get("state");
      if (stateBase64) {
        try {
          const jsonStr = atob(stateBase64);
          const parsed = JSON.parse(jsonStr) as AdvanceState;
          if (parsed && typeof parsed === "object") {
            setAdvanceState({
              page: Number(parsed.page) || 1,
              limit: Number(parsed.limit) || 10,
              tags: Array.isArray(parsed.tags) ? parsed.tags : ["typescript"],
              range: parsed.range && typeof parsed.range === "object" 
                ? { min: Number(parsed.range.min) || 0, max: Number(parsed.range.max) || 100 }
                : { min: 20, max: 80 }
            });
            addLog("PARSE", `Decoded state from Base64: ${jsonStr}`);
          }
        } catch (err) {
          addLog("PARSE", `Failed to parse Base64 query parameter: ${err}`);
        }
      } else {
        addLog("PARSE", "No compressed state found in URL query.");
      }
    }
  }, [activeTab, addLog]);

  // Initial restoration on mounting or changing tabs
  useEffect(() => {
    restoreStateFromUrl();
  }, [activeTab, restoreStateFromUrl]);

  // Listen for browser Back/Forward navigation triggers (PopState event)
  useEffect(() => {
    const handlePopState = () => {
      addLog("POPSTATE", "Browser navigation event (popstate) triggered state restoration.");
      restoreStateFromUrl();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [restoreStateFromUrl, addLog]);

  // ----------------------------------------------------
  // --- STATE SERIALIZER (APP STATE -> URL) ------------
  // ----------------------------------------------------
  const updateUrl = (newParams: URLSearchParams, push = false) => {
    const currentQuery = window.location.search;
    const newQuery = newParams.toString() ? `?${newParams.toString()}` : "";
    
    // Prevent pushing duplicate entries to history stack
    if (currentQuery === newQuery) return;

    const newUrl = window.location.pathname + newQuery;
    
    if (push) {
      window.history.pushState({ path: newUrl }, "", newUrl);
      addLog("PUSH", `Pushed new history state: ${newQuery || "(empty)"}`);
    } else {
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }
    
    // Re-sync values
    if (activeTab === "basic") {
      setBasicUrlValue(newParams.get("q") || "");
    }
  };

  // Triggered when Basic input changes (updates URL on-the-fly or on submit)
  const handleBasicChange = (val: string) => {
    setBasicInput(val);
    const params = new URLSearchParams();
    if (val.trim()) {
      params.set("q", val);
    }
    updateUrl(params, false); // Replace state on typing
  };

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (basicInput.trim()) {
      params.set("q", basicInput);
    }
    updateUrl(params, true); // Push state to history on enter/submit
    addLog("PUSH", `Submitted query: "${basicInput}" - Pushed URL to history.`);
  };

  // Triggered when Mid filters change
  const handleMidFilterChange = (updates: Partial<FilterState>) => {
    const updated = { ...midFilters, ...updates };
    setMidFilters(updated);

    const params = new URLSearchParams();
    if (updated.q.trim()) params.set("q", updated.q);
    if (updated.category !== "all") params.set("category", updated.category);
    if (updated.inStock) params.set("inStock", "true");
    if (updated.sortBy !== "relevance") params.set("sortBy", updated.sortBy);

    updateUrl(params, true); // Push to history to allow back-button undoing
  };

  // Triggered when Advance filters change
  const handleAdvanceChange = (updates: Partial<AdvanceState>) => {
    const updated = { ...advanceState, ...updates };
    setAdvanceState(updated);

    // Compress deep state structure into Base64
    try {
      const jsonStr = JSON.stringify(updated);
      const base64 = btoa(jsonStr);
      
      const params = new URLSearchParams();
      params.set("state", base64);
      
      addLog("COMPRESS", `Compressed state size: ${jsonStr.length} chars -> ${base64.length} base64 chars`);
      updateUrl(params, false); // Replace URL dynamically for smooth slider actions
    } catch (err) {
      addLog("COMPRESS", `Failed to encode state: ${err}`);
    }
  };

  // Explicit push trigger for Advance state history records
  const saveAdvanceStateHistory = () => {
    const jsonStr = JSON.stringify(advanceState);
    const base64 = btoa(jsonStr);
    const params = new URLSearchParams();
    params.set("state", base64);
    updateUrl(params, true);
  };

  const toggleAdvanceTag = (tag: string) => {
    const isSelected = advanceState.tags.includes(tag);
    const updatedTags = isSelected 
      ? advanceState.tags.filter(t => t !== tag) 
      : [...advanceState.tags, tag];
    handleAdvanceChange({ tags: updatedTags });
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearUrlParams = () => {
    const emptyUrl = window.location.pathname;
    window.history.pushState({ path: emptyUrl }, "", emptyUrl);
    setUrlConsoleLogs([]);
    addLog("PUSH", "Reset all URL search query parameters.");
    restoreStateFromUrl();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Link className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>URL State Synchronizer</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/UrlStateSync.tsx`}
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
          Basic (Single Input Sync)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Multi-field Form Filters)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Base64 Compression & Log Console)
        </button>
      </div>

      {/* Shared URL Display Bar */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", padding: "12px 20px", borderRadius: "10px", display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Browser URL:</span>
          <div style={{ flex: 1, background: "var(--input-bg)", padding: "6px 12px", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {window.location.origin}
            <span style={{ color: "var(--text-h)", fontWeight: "bold" }}>{window.location.pathname}</span>
            <span style={{ color: "#34d399" }}>{window.location.search || ""}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={copyUrlToClipboard} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", fontSize: "0.75rem" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button className="btn btn-secondary" onClick={clearUrlParams} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "#ef4444" }}>
            <RefreshCw size={12} /> Reset URL
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT PANEL: STATE CONTROLS */}
        <div>
          
          {/* TAB 1: BASIC (Single Input Sync) */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Real-time Query Sync</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Type in the search field to update the URL dynamically as a search query variable (<code>?q=...</code>). 
                Press <strong>Enter</strong> to push a new event to the browser's history stack (allowing Back/Forward undo).
              </p>
              
              <form onSubmit={handleBasicSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                  type="text"
                  value={basicInput}
                  onChange={(e) => handleBasicChange(e.target.value)}
                  placeholder="Search products or topics..."
                  className="select-input"
                  style={{ flex: 1, background: "var(--input-bg)" }}
                />
                <button type="submit" className="btn btn-primary">
                  Push History
                </button>
              </form>

              {/* URL Sync Feedback Panel */}
              <div style={{ background: "var(--input-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Parsed State Output (Retrieved from URL):</span>
                <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-h)", margin: 0 }}>
                  {basicUrlValue ? `"${basicUrlValue}"` : <em style={{ fontWeight: "normal", color: "var(--text-muted)" }}>(No active query param)</em>}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MID (Multi-Field Form Filters) */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <h4 style={{ margin: 0 }}>Multi-Field Product Filters</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Adjusting the input fields updates the browser search params in real-time (<code>?q=...&category=...&inStock=...&sortBy=...</code>).
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                {/* Search Text input */}
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Filter Query:</label>
                  <input
                    type="text"
                    value={midFilters.q}
                    onChange={(e) => handleMidFilterChange({ q: e.target.value })}
                    placeholder="Search titles..."
                    className="select-input"
                    style={{ width: "100%", background: "var(--input-bg)" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Category Dropdown */}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Category:</label>
                    <select
                      value={midFilters.category}
                      onChange={(e) => handleMidFilterChange({ category: e.target.value })}
                      className="select-input"
                      style={{ width: "100%", background: "var(--input-bg)" }}
                    >
                      <option value="all">All Categories</option>
                      <option value="electronics">Electronics</option>
                      <option value="books">Books</option>
                      <option value="apparel">Apparel</option>
                    </select>
                  </div>

                  {/* Sort Selection */}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Sort By:</label>
                    <select
                      value={midFilters.sortBy}
                      onChange={(e) => handleMidFilterChange({ sortBy: e.target.value })}
                      className="select-input"
                      style={{ width: "100%", background: "var(--input-bg)" }}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Stock Checkbox */}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-h)", marginTop: "6px" }}>
                  <input
                    type="checkbox"
                    checked={midFilters.inStock}
                    onChange={(e) => handleMidFilterChange({ inStock: e.target.checked })}
                    style={{ cursor: "pointer" }}
                  />
                  Only show in-stock products
                </label>
              </div>

              {/* Parsed output preview */}
              <div style={{ background: "var(--input-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", display: "block", marginBottom: "8px" }}>Active Filter Params Schema:</span>
                <pre style={{ margin: 0, fontSize: "0.8rem", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                  {JSON.stringify(midFilters, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE (Base64 state compression) */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>Compressed State Object</h4>
                <button className="btn btn-primary" onClick={saveAdvanceStateHistory} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
                  Push History Stack
                </button>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Encodes all control state variables into a single Base64 string under <code>?state=BASE64</code>. 
                Perfect for system design setups preserving dashboard workspaces in shareable URLs.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Numeric Pagination Sliders */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>Active Page:</span> <span>{advanceState.page}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={advanceState.page}
                      onChange={(e) => handleAdvanceChange({ page: parseInt(e.target.value) })}
                      style={{ width: "100%", accentColor: "var(--primary)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>Page Limit:</span> <span>{advanceState.limit} / page</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={advanceState.limit}
                      onChange={(e) => handleAdvanceChange({ limit: parseInt(e.target.value) })}
                      style={{ width: "100%", accentColor: "var(--primary)" }}
                    />
                  </div>
                </div>

                {/* Score Range selection */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <span>Rating Score Threshold:</span>
                    <span>Min: {advanceState.range.min} - Max: {advanceState.range.max}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      type="number"
                      value={advanceState.range.min}
                      onChange={(e) => handleAdvanceChange({ range: { ...advanceState.range, min: parseInt(e.target.value) || 0 } })}
                      className="select-input"
                      style={{ background: "var(--input-bg)", fontSize: "0.85rem", padding: "4px 8px" }}
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={advanceState.range.max}
                      onChange={(e) => handleAdvanceChange({ range: { ...advanceState.range, max: parseInt(e.target.value) || 100 } })}
                      className="select-input"
                      style={{ background: "var(--input-bg)", fontSize: "0.85rem", padding: "4px 8px" }}
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Multi-select filter chips */}
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Selected Filter Tags:</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {availableTags.map(tag => {
                      const active = advanceState.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleAdvanceTag(tag)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid var(--border)",
                            background: active ? "var(--primary)" : "var(--input-bg)",
                            color: active ? "#fff" : "var(--text-muted)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT PANEL: TELEMETRY CONSOLE */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "#0f172a", padding: "20px", color: "#38bdf8", minHeight: "380px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={14} style={{ color: "#38bdf8" }} />
              <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>URL State Telemetry Log</h4>
            </div>
            <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "#1e293b", borderRadius: "4px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>ACTIVE</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.72rem", fontFamily: "var(--font-mono)", maxHeight: "300px" }}>
            {urlConsoleLogs.length === 0 ? (
              <div style={{ color: "#475569", textAlign: "center", padding: "40px 0" }}>
                Waiting for URL state sync events...
              </div>
            ) : (
              urlConsoleLogs.map((log, index) => {
                let badgeBg = "#1e293b";
                let badgeColor = "#94a3b8";
                
                if (log.type === "PUSH") { badgeBg = "#064e3b"; badgeColor = "#34d399"; }
                else if (log.type === "RESTORE" || log.type === "POPSTATE") { badgeBg = "#1e3a8a"; badgeColor = "#60a5fa"; }
                else if (log.type === "COMPRESS") { badgeBg = "#581c87"; badgeColor = "#c084fc"; }
                else if (log.type === "PARSE") { badgeBg = "#7c2d12"; badgeColor = "#fb923c"; }

                return (
                  <div key={index} style={{ borderBottom: "1px dashed #1e293b", paddingBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ color: "#64748b" }}>[{log.timestamp}]</span>
                      <span style={{ background: badgeBg, color: badgeColor, padding: "0 4px", borderRadius: "2px", fontWeight: "bold", fontSize: "0.65rem" }}>
                        {log.type}
                      </span>
                    </div>
                    <div style={{ color: "#e2e8f0", wordBreak: "break-all" }}>{log.message}</div>
                    <div style={{ color: "#475569", fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Query: {log.url}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Description Info */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "16px", marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <Info size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
          <strong>Browser History Stack:</strong> The URL synchronizer uses standard HTML5 <code>history.pushState</code> and <code>history.replaceState</code> APIs. This lets you bind component state values dynamically without full page reloads, preserving back-and-forth router integrity.
        </p>
      </div>
    </div>
  );
};

export default UrlStateSync;
