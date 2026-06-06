import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Loader, HelpCircle, Globe, ShoppingCart, BookOpen } from "lucide-react";

// Mock Database of Multi-source records
interface TypeaheadRecord {
  id: string;
  type: "category" | "product" | "article";
  title: string;
  meta: string;
}

const TYPEAHEAD_DATABASE: TypeaheadRecord[] = [
  { id: "1", type: "category", title: "Distributed Caches", meta: "Low-latency key-value stores" },
  { id: "2", type: "category", title: "Database Sharding", meta: "Horizontal scaling algorithms" },
  { id: "3", type: "product", title: "Redis State Engine Adapter", meta: "$19 - In-memory adapter" },
  { id: "4", type: "product", title: "Zookeeper Consensus Node", meta: "$49 - Coordination config" },
  { id: "5", type: "article", title: "Designing Hashing Rings", meta: "15 min read - Consistent partitions" },
  { id: "6", type: "article", title: "Evaluating Saga Patterns", meta: "10 min read - Distributed transactions" },
];

export const TypeaheadSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Inline autocompletion suffix)
  // ==========================================
  const [basicQuery, setBasicQuery] = useState("");
  const [basicSuggestionSuffix, setBasicSuggestionSuffix] = useState("");

  const staticTerms = [
    "consistent hashing",
    "distributed database",
    "database sharding",
    "microservices architecture",
    "message broker queue",
  ];

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBasicQuery(val);

    if (!val.trim()) {
      setBasicSuggestionSuffix("");
      return;
    }

    const match = staticTerms.find((t) => t.startsWith(val.toLowerCase()));
    if (match) {
      // Suffix is matching part from length of query to end of string
      setBasicSuggestionSuffix(match.slice(val.length));
    } else {
      setBasicSuggestionSuffix("");
    }
  };

  const handleBasicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses Right Arrow or Tab, autocomplete inline suggestion
    if ((e.key === "ArrowRight" || e.key === "Tab") && basicSuggestionSuffix) {
      e.preventDefault();
      setBasicQuery((q) => q + basicSuggestionSuffix);
      setBasicSuggestionSuffix("");
    }
  };

  // ==========================================
  // --- MID TAB (API Fetching & Spinner) -----
  // ==========================================
  const [midQuery, setMidQuery] = useState("");
  const [midResults, setMidResults] = useState<TypeaheadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!midQuery.trim()) {
      setMidResults([]);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      // Filter database
      const q = midQuery.toLowerCase();
      const filtered = TYPEAHEAD_DATABASE.filter((item) =>
        item.title.toLowerCase().includes(q)
      );
      setMidResults(filtered);
      setIsLoading(false);
    }, 400); // 400ms simulated network latency

    return () => clearTimeout(handler);
  }, [midQuery]);

  // ==========================================
  // --- ADVANCE TAB (Multi-source groups) ----
  // ==========================================
  const [advQuery, setAdvQuery] = useState("");
  const [advResults, setAdvResults] = useState<TypeaheadRecord[]>([]);
  const [advHighlightIndex, setAdvHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!advQuery.trim()) {
      setAdvResults([]);
      return;
    }
    const q = advQuery.toLowerCase();
    const filtered = TYPEAHEAD_DATABASE.filter((item) =>
      item.title.toLowerCase().includes(q)
    );
    setAdvResults(filtered);
    setAdvHighlightIndex(-1);
  }, [advQuery]);

  // Grouped advance results
  const groupedResults = useMemo(() => {
    const groups: { [key in TypeaheadRecord["type"]]?: TypeaheadRecord[] } = {};
    advResults.forEach((item) => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type]!.push(item);
    });
    return groups;
  }, [advResults]);

  // Flattened results list to facilitate keyboard navigation index offsets
  const flattenedAdvList = useMemo(() => {
    const list: TypeaheadRecord[] = [];
    if (groupedResults.category) list.push(...groupedResults.category);
    if (groupedResults.product) list.push(...groupedResults.product);
    if (groupedResults.article) list.push(...groupedResults.article);
    return list;
  }, [groupedResults]);

  const handleAdvKeyDown = (e: React.KeyboardEvent) => {
    if (flattenedAdvList.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setAdvHighlightIndex((prev) => (prev + 1) % flattenedAdvList.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setAdvHighlightIndex((prev) => (prev - 1 + flattenedAdvList.length) % flattenedAdvList.length);
        break;
      case "Enter":
        e.preventDefault();
        if (advHighlightIndex >= 0 && advHighlightIndex < flattenedAdvList.length) {
          setAdvQuery(flattenedAdvList[advHighlightIndex].title);
          setAdvResults([]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setAdvResults([]);
        break;
    }
  };

  const getSourceIcon = (type: TypeaheadRecord["type"]) => {
    switch (type) {
      case "category": return <Globe size={14} style={{ color: "#3b82f6" }} />;
      case "product": return <ShoppingCart size={14} style={{ color: "#10b981" }} />;
      case "article": return <BookOpen size={14} style={{ color: "#f59e0b" }} />;
    }
  };

  return (
    <div className="page-container" ref={containerRef}>
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Search className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Typeahead Search Sandbox</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Inline Suffix Completion)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setMidQuery(""); }}
        >
          Mid (Async API Latency Spinner)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setAdvQuery(""); }}
        >
          Advance (Multi-source Categories)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Interactive Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC INLINE COMPLETION */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4>Inline autocompletion suffix</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Type search queries (e.g. <code>con</code> or <code>dat</code>). Press <strong>Right Arrow</strong> or <strong>Tab</strong> to complete inline suffix.
              </p>

              {/* Suffix input stack overlay */}
              <div style={{ position: "relative", width: "100%", height: "40px" }}>
                {/* 1. Backdrop inline ghost text */}
                <input
                  type="text"
                  disabled
                  value={basicQuery + basicSuggestionSuffix}
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid transparent",
                    background: "var(--input-bg)",
                    color: "rgba(255, 255, 255, 0.35)",
                    fontSize: "0.95rem",
                  }}
                />

                {/* 2. Frontend active input */}
                <input
                  type="text"
                  value={basicQuery}
                  onChange={handleBasicChange}
                  onKeyDown={handleBasicKeyDown}
                  placeholder="Type queries (e.g. consistent)..."
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-h)",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: MID API SPINNER */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", position: "relative" }}>
              <h4>Async Simulated API fetching</h4>
              
              <div
                className="sidebar-search"
                style={{
                  background: "var(--input-bg)",
                  border: isOpen ? "2px solid var(--text-h)" : "1px solid var(--border)",
                  height: "42px",
                  padding: "0 12px",
                  marginBottom: 0,
                }}
              >
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Type queries to search records..."
                  value={midQuery}
                  onChange={(e) => { setMidQuery(e.target.value); setIsOpen(true); }}
                  onFocus={() => setIsOpen(true)}
                  className="search-input"
                />
                {isLoading && <Loader className="animated-spin" size={16} />}
              </div>

              {isOpen && midQuery.trim() !== "" && (
                <div style={{ position: "absolute", top: "82px", left: "20px", right: "20px", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)", zIndex: 50 }}>
                  {isLoading ? (
                    <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading database...</div>
                  ) : midResults.length === 0 ? (
                    <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No results found</div>
                  ) : (
                    midResults.map((item) => (
                      <div key={item.id} onClick={() => { setMidQuery(item.title); setIsOpen(false); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", color: "var(--text-h)" }}>
                        {item.title}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADVANCE CATEGORIES */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", position: "relative" }}>
              <h4>Multi-source Categorized Dropdown (Keyboard navigable)</h4>

              <div
                className="sidebar-search"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  height: "42px",
                  padding: "0 12px",
                  marginBottom: 0,
                }}
              >
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Type queries (e.g. shard, cache, saga)..."
                  value={advQuery}
                  onChange={(e) => setAdvQuery(e.target.value)}
                  onKeyDown={handleAdvKeyDown}
                  className="search-input"
                />
              </div>

              {advQuery.trim() !== "" && advResults.length > 0 && (
                <div style={{ position: "absolute", top: "82px", left: "20px", right: "20px", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)", zIndex: 50, maxHeight: "240px", overflowY: "auto" }}>
                  {/* Flattened items list renderer helper */}
                  {(() => {
                    let globalIdx = 0;
                    return (["category", "product", "article"] as const).map((type) => {
                      const list = groupedResults[type];
                      if (!list || list.length === 0) return null;

                      return (
                        <div key={type}>
                          {/* Header section */}
                          <div style={{ padding: "6px 12px", background: "var(--input-bg)", fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                            {getSourceIcon(type)}
                            <span>{type}s</span>
                          </div>
                          
                          {list.map((item) => {
                            const currentGlobalIdx = globalIdx++;
                            const isHighlighted = currentGlobalIdx === advHighlightIndex;

                            return (
                              <div
                                key={item.id}
                                onMouseEnter={() => setAdvHighlightIndex(currentGlobalIdx)}
                                onClick={() => {
                                  setAdvQuery(item.title);
                                  setAdvResults([]);
                                }}
                                style={{
                                  padding: "10px 14px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid var(--border)",
                                  background: isHighlighted ? "var(--input-bg)" : "transparent",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontSize: "0.85rem", color: isHighlighted ? "var(--text-h)" : "var(--text)" }}>{item.title}</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.meta}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Typeahead Layout Design</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><HelpCircle size={14} /> Inline Ghost Overlap</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Basic tab uses absolute stacked inputs. The disabled background input holds the entire autocompletion suggestion string. Since both match sizing, it creates a perfect inline ghost preview.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "block", color: "var(--text-h)" }}>Section index flattened lists:</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                In Advance tab, grouping items splits rendering DOM nodes. To allow simple Arrow keys navigation, we flatten matches into a helper array mapping indexes to raw databases.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeaheadSearch;
