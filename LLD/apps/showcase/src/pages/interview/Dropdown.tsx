import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Loader, Check, Compass, HelpCircle } from "lucide-react";

// Types
interface Option {
  value: string;
  label: string;
  group?: string;
}

// Generate large item list for Virtualization (10,000 items)
const generateLargeList = (): Option[] => {
  const items: Option[] = [];
  for (let i = 1; i <= 10000; i++) {
    items.push({
      value: `item-${i}`,
      label: `Virtualized Option Item ${i}`,
      group: i % 2 === 0 ? "Even Numbers" : "Odd Numbers",
    });
  }
  return items;
};

const STATIC_OPTIONS: Option[] = [
  { value: "react", label: "React JS", group: "Frontend Libraries" },
  { value: "vue", label: "Vue JS", group: "Frontend Libraries" },
  { value: "angular", label: "Angular", group: "Frontend Libraries" },
  { value: "node", label: "Node JS", group: "Backend Engines" },
  { value: "express", label: "Express Server", group: "Backend Engines" },
  { value: "nest", label: "Nest JS Framework", group: "Backend Engines" },
  { value: "rust", label: "Rust Programming", group: "Languages" },
  { value: "typescript", label: "TypeScript", group: "Languages" },
  { value: "golang", label: "Go Language", group: "Languages" },
];

export const Dropdown: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");


  // ==========================================
  // --- BASIC TAB (Single Select + Search) ---
  // ==========================================
  const [basicOpen, setBasicOpen] = useState(false);
  const [basicSearch, setBasicSearch] = useState("");
  const [basicSelected, setBasicSelected] = useState<Option | null>(null);
  const [basicHighlightIndex, setBasicHighlightIndex] = useState(-1);
  const basicRef = useRef<HTMLDivElement>(null);

  const basicFiltered = useMemo(() => {
    return STATIC_OPTIONS.filter((opt) =>
      opt.label.toLowerCase().includes(basicSearch.toLowerCase())
    );
  }, [basicSearch]);

  const handleBasicKeyDown = (e: React.KeyboardEvent) => {
    if (!basicOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setBasicOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setBasicHighlightIndex((prev) => (prev + 1) % basicFiltered.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setBasicHighlightIndex((prev) => (prev - 1 + basicFiltered.length) % basicFiltered.length);
        break;
      case "Enter":
        e.preventDefault();
        if (basicHighlightIndex >= 0 && basicHighlightIndex < basicFiltered.length) {
          setBasicSelected(basicFiltered[basicHighlightIndex]);
          setBasicOpen(false);
          setBasicHighlightIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setBasicOpen(false);
        setBasicHighlightIndex(-1);
        break;
    }
  };

  // ==========================================
  // --- MID TAB (Multi-Select Tags) ----------
  // ==========================================
  const [midOpen, setMidOpen] = useState(false);
  const [midSearch, setMidSearch] = useState("");
  const [midSelected, setMidSelected] = useState<Option[]>([]);
  const [midHighlightIndex, setMidHighlightIndex] = useState(-1);
  const midRef = useRef<HTMLDivElement>(null);
  const midInputRef = useRef<HTMLInputElement>(null);


  const midFiltered = useMemo(() => {
    // Exclude already selected
    const selectedVals = new Set(midSelected.map((s) => s.value));
    return STATIC_OPTIONS.filter(
      (opt) =>
        !selectedVals.has(opt.value) &&
        opt.label.toLowerCase().includes(midSearch.toLowerCase())
    );
  }, [midSearch, midSelected]);

  const toggleMidSelect = (opt: Option) => {
    setMidSelected((prev) => {
      const exists = prev.find((item) => item.value === opt.value);
      if (exists) {
        return prev.filter((item) => item.value !== opt.value);
      }
      return [...prev, opt];
    });
    setMidSearch("");
  };

  const handleMidKeyDown = (e: React.KeyboardEvent) => {
    if (!midOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setMidOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setMidHighlightIndex((prev) => (prev + 1) % midFiltered.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setMidHighlightIndex((prev) => (prev - 1 + midFiltered.length) % midFiltered.length);
        break;
      case "Enter":
        e.preventDefault();
        if (midHighlightIndex >= 0 && midHighlightIndex < midFiltered.length) {
          toggleMidSelect(midFiltered[midHighlightIndex]);
          setMidHighlightIndex(-1);
        }
        break;
      case "Backspace":
        if (midSearch === "" && midSelected.length > 0) {
          setMidSelected((prev) => prev.slice(0, -1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setMidOpen(false);
        setMidHighlightIndex(-1);
        break;
    }
  };

  // ==========================================
  // --- ADVANCE TAB (Virtualization + Async) -
  // ==========================================
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [advanceSearch, setAdvanceSearch] = useState("");
  const [advanceSelected, setAdvanceSelected] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const advanceRef = useRef<HTMLDivElement>(null);

  // Virtualization constants
  const listHeight = 240;
  const itemHeight = 40;
  const [scrollTop, setScrollTop] = useState(0);

  // Full virtualized database
  const virtualDatabase = useMemo(() => generateLargeList(), []);

  // Filter virtualized elements dynamically
  const filteredVirtual = useMemo(() => {
    if (!advanceSearch.trim()) return virtualDatabase;
    const q = advanceSearch.toLowerCase();
    return virtualDatabase.filter((item) => item.label.toLowerCase().includes(q));
  }, [advanceSearch, virtualDatabase]);

  // Sync API Fetch Debouncer Hook for simulated loading spinner
  useEffect(() => {
    if (activeTab !== "advance") return;

    if (advanceSearch.trim() === "") {
      setIsLoading(false);
    } else {
      setIsLoading(true);
      const handler = setTimeout(() => {
        setIsLoading(false);
      }, 300); // 300ms debounce

      return () => {
        clearTimeout(handler);
      };
    }
  }, [advanceSearch, activeTab]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (basicOpen && basicRef.current && !basicRef.current.contains(target)) {
        setBasicOpen(false);
        setBasicHighlightIndex(-1);
      }
      if (midOpen && midRef.current && !midRef.current.contains(target)) {
        setMidOpen(false);
        setMidHighlightIndex(-1);
      }
      if (advanceOpen && advanceRef.current && !advanceRef.current.contains(target)) {
        setAdvanceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [basicOpen, midOpen, advanceOpen]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Compass className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Dropdown Select Showcase</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("basic"); }}
        >
          Basic (Single Select + Search)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); }}
        >
          Mid (Multi-Select Tags)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); }}
        >
          Advance (Virtualization & Grouping)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Dropdown Board */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC CUSTOM DROPDOWN */}
          {activeTab === "basic" && (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--border-radius)",
                background: "var(--card-bg)",
                padding: "24px",
              }}
            >
              <h4 style={{ marginBottom: "12px" }}>Custom Dropdown with Keyboard Navigation</h4>

              <div ref={basicRef} style={{ position: "relative" }}>
                <div
                  tabIndex={0}
                  onKeyDown={handleBasicKeyDown}
                  onClick={() => setBasicOpen(!basicOpen)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    borderColor: basicOpen ? "var(--text-h)" : "var(--border)",
                    boxShadow: basicOpen ? "0 0 0 2px var(--accent-light)" : "none",
                    background: "var(--input-bg)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    color: basicSelected ? "var(--text-h)" : "var(--text-muted)",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  <span>{basicSelected ? basicSelected.label : "Select a framework..."}</span>
                  <ChevronDown size={18} style={{ transform: basicOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </div>

                {basicOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "6px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)",
                      zIndex: 100,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "8px 12px" }}>
                      <Search size={16} style={{ color: "var(--text-muted)", marginRight: "8px" }} />
                      <input
                        type="text"
                        placeholder="Type to filter..."
                        value={basicSearch}
                        onChange={(e) => {
                          setBasicSearch(e.target.value);
                          setBasicHighlightIndex(-1);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          width: "100%",
                          color: "var(--text-h)",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ maxHeight: "200px", overflowY: "auto", padding: "6px" }}>
                      {basicFiltered.length === 0 ? (
                        <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)" }}>No matches found</div>
                      ) : (
                        basicFiltered.map((opt, index) => {
                          const isHighlighted = index === basicHighlightIndex;
                          const isSelected = basicSelected?.value === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onMouseEnter={() => setBasicHighlightIndex(index)}
                              onClick={() => {
                                setBasicSelected(opt);
                                setBasicOpen(false);
                                setBasicHighlightIndex(-1);
                              }}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: isHighlighted ? "var(--input-bg)" : isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                color: isHighlighted || isSelected ? "var(--text-h)" : "var(--text)",
                                transition: "background-color 0.15s ease, color 0.15s ease",
                              }}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <Check size={14} style={{ color: "var(--primary)" }} />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {basicSelected && !basicOpen && (
                <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--success)" }}>
                  Selected Option Value: <code>{basicSelected.value}</code>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MULTI-SELECT CHIP TAGS */}
          {activeTab === "mid" && (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--border-radius)",
                background: "var(--card-bg)",
                padding: "24px",
              }}
            >
              <h4 style={{ marginBottom: "12px" }}>Multi-select Dropdown (Dismissible Chips)</h4>

              <div ref={midRef} style={{ position: "relative" }}>
                <div
                  tabIndex={0}
                  onKeyDown={handleMidKeyDown}
                  onClick={(e) => {
                    if (e.target !== midInputRef.current) {
                      setMidOpen(!midOpen);
                    } else {
                      setMidOpen(true);
                    }
                    midInputRef.current?.focus();
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    borderColor: midOpen ? "var(--text-h)" : "var(--border)",
                    boxShadow: midOpen ? "0 0 0 2px var(--accent-light)" : "none",
                    background: "var(--input-bg)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    alignItems: "center",
                    cursor: "pointer",
                    minHeight: "44px",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  {midSelected.map((opt) => (
                    <span
                      key={opt.value}
                      style={{
                        background: "var(--accent-light)",
                        border: "1px solid var(--border)",
                        color: "var(--text-h)",
                        fontSize: "0.8rem",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {opt.label}
                      <X
                        size={12}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMidSelected((prev) => prev.filter((item) => item.value !== opt.value));
                        }}
                        style={{ cursor: "pointer", color: "var(--text-muted)" }}
                      />
                    </span>
                  ))}

                  <input
                    ref={midInputRef}
                    type="text"
                    placeholder={midSelected.length === 0 ? "Select frameworks..." : ""}
                    value={midSearch}
                    onChange={(e) => {
                      setMidSearch(e.target.value);
                      setMidHighlightIndex(-1);
                      setMidOpen(true);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "var(--text-h)",
                      flex: 1,
                      minWidth: "60px",
                    }}
                  />

                  {midSelected.length > 0 && (
                    <X
                      size={16}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMidSelected([]);
                      }}
                      style={{ cursor: "pointer", marginLeft: "auto", color: "var(--text-muted)" }}
                    />
                  )}
                  <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />
                </div>

                {midOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "6px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)",
                      zIndex: 100,
                      maxHeight: "180px",
                      overflowY: "auto",
                      padding: "6px",
                    }}
                  >
                    {midFiltered.length === 0 ? (
                      <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)" }}>All options selected</div>
                    ) : (
                      midFiltered.map((opt, index) => {
                        const isHighlighted = index === midHighlightIndex;
                        return (
                          <div
                            key={opt.value}
                            onMouseEnter={() => setMidHighlightIndex(index)}
                            onClick={() => {
                              toggleMidSelect(opt);
                              setMidHighlightIndex(-1);
                            }}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              background: isHighlighted ? "var(--input-bg)" : "transparent",
                              color: isHighlighted ? "var(--text-h)" : "var(--text)",
                              transition: "background-color 0.15s ease, color 0.15s ease",
                            }}
                          >
                            {opt.label}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE VIRTUALIZED & ASYNC */}
          {activeTab === "advance" && (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--border-radius)",
                background: "var(--card-bg)",
                padding: "24px",
              }}
            >
              <h4 style={{ marginBottom: "12px" }}>Advance: Virtualized list (10k items) & Grouping</h4>

              {/* Selector */}
              <div ref={advanceRef} style={{ position: "relative" }}>
                {/* Selector */}
                <div
                  onClick={() => setAdvanceOpen(!advanceOpen)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    borderColor: advanceOpen ? "var(--text-h)" : "var(--border)",
                    boxShadow: advanceOpen ? "0 0 0 2px var(--accent-light)" : "none",
                    background: "var(--input-bg)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  <span>{advanceSelected ? advanceSelected.label : "Select Virtualized Item..."}</span>
                  <ChevronDown size={18} />
                </div>

                {advanceOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "6px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)",
                      zIndex: 100,
                    }}
                  >
                    {/* Search Bar */}
                    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "8px 12px" }}>
                      <Search size={16} style={{ color: "var(--text-muted)", marginRight: "8px" }} />
                      <input
                        type="text"
                        placeholder="Search 10,000 items..."
                        value={advanceSearch}
                        onChange={(e) => setAdvanceSearch(e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          width: "100%",
                          color: "var(--text-h)",
                          outline: "none",
                        }}
                      />
                      {isLoading && <Loader className="animated-spin" size={16} />}
                    </div>

                    {/* Virtualized List Container */}
                    <div
                      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                      style={{
                        height: `${listHeight}px`,
                        overflowY: "auto",
                        position: "relative",
                      }}
                    >
                      {/* Inner wrapper mapping actual scale of list */}
                      <div style={{ height: `${filteredVirtual.length * itemHeight}px`, width: "100%" }}>
                        {(() => {
                          const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
                          const endIndex = Math.min(
                            filteredVirtual.length - 1,
                            Math.floor((scrollTop + listHeight) / itemHeight) + 2
                          );

                          const renderedItems = [];
                          for (let i = startIndex; i <= endIndex; i++) {
                            const item = filteredVirtual[i];
                            if (!item) continue;

                            renderedItems.push(
                              <div
                                key={item.value}
                                onClick={() => {
                                  setAdvanceSelected(item);
                                  setAdvanceOpen(false);
                                }}
                                style={{
                                  position: "absolute",
                                  top: `${i * itemHeight}px`,
                                  left: 0,
                                  right: 0,
                                  height: `${itemHeight}px`,
                                  padding: "10px 16px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  cursor: "pointer",
                                  borderBottom: "1px solid var(--border)",
                                  background: advanceSelected?.value === item.value ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                }}
                              >
                                <span>{item.label}</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--input-bg)", padding: "2px 6px", borderRadius: "10px" }}>
                                  {item.group}
                                </span>
                              </div>
                            );
                          }
                          return renderedItems;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right System Info Panel */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Select Architecture Breakdown</h4>

          <div style={{ fontSize: "0.85rem", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "var(--text-h)" }}><HelpCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> Keyboard Accessibility (A11y)</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Basic select listens to keydown events. It blocks default window scrolling on Arrow keys and shifts highlight states locally, matching standard browser select.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-h)" }}><Loader size={14} style={{ display: "inline", marginRight: "4px" }} /> Async Search Abort Logic</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                When fetching search results asynchronously, fast typing can trigger race conditions. Instantiating an <code>AbortController</code> and mapping <code>controller.abort()</code> inside the React effect cleanup discards outdated pending promises cleanly.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-h)" }}><Compass size={14} style={{ display: "inline", marginRight: "4px" }} /> List Virtualization</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Rendering 10,000 DOM elements causes massive lag. The virtual list wrapper tracks `scrollTop` of the scrolling view and computes index boundaries:
                <br />
                <code>startIndex = scrollTop / itemHeight</code>.
                Only a slice of ~8 items is active in the DOM at any given time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
