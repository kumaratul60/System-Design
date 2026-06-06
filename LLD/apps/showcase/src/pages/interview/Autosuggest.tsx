import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Search, History, X, Clock, Terminal, Award, Sparkles, Loader, Code} from "lucide-react";

// Mock Database of suggestions with categories and icons
interface SuggestionItem {
  id: string;
  title: string;
  category: "Algorithms" | "Architectures" | "Methodologies";
  description: string;
  stars: number;
}

const SUGGESTION_DATABASE: SuggestionItem[] = [
  { id: "1", title: "Consistent Hashing Ring", category: "Architectures", description: "Distributed hashing mechanism for caching nodes.", stars: 4.8 },
  { id: "2", title: "MapReduce Parallel Framework", category: "Algorithms", description: "Highly parallel data sorting and processing engine.", stars: 4.7 },
  { id: "3", title: "Domain-Driven Design (DDD)", category: "Methodologies", description: "Modeling software based on business domain boundaries.", stars: 4.9 },
  { id: "4", title: "Raft Consensus Protocol", category: "Algorithms", description: "Distributed state machine replication consensus.", stars: 4.85 },
  { id: "5", title: "RESTful Web Services", category: "Architectures", description: "Stateless client-server architecture model.", stars: 4.5 },
  { id: "6", title: "B-Tree Database Indexing", category: "Algorithms", description: "Balanced sorting tree optimized for disc reads.", stars: 4.75 },
  { id: "7", title: "Microservices Architecture", category: "Architectures", description: "Decoupling applications into specialized API entities.", stars: 4.6 },
  { id: "8", title: "Event Sourcing Strategy", category: "Methodologies", description: "Recording state mutations as a sequence of log items.", stars: 4.7 },
  { id: "9", title: "CQRS Pattern Model", category: "Methodologies", description: "Segregating command and query pathways.", stars: 4.65 },
];

export const Autosuggest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Input value states
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debouncing effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Click outside detection
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ==========================================
  // --- BASIC TAB (Static + Debounce) --------
  // ==========================================
  const basicSuggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTION_DATABASE.filter((item) =>
      item.title.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  // ==========================================
  // --- MID TAB (API Simulator + Cache) ------
  // ==========================================
  const [isLoading, setIsLoading] = useState(false);
  const [midSuggestions, setMidSuggestions] = useState<SuggestionItem[]>([]);
  const [cache, setCache] = useState<{ [key: string]: SuggestionItem[] }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchMockApi = useCallback((searchVal: string) => {
    const q = searchVal.trim().toLowerCase();
    if (!q) {
      setMidSuggestions([]);
      return;
    }

    // Check Cache first
    if (cache[q]) {
      console.log(`[Cache Hit] Serving search results for: "${q}"`);
      setMidSuggestions(cache[q]);
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    // Mock API query call
    const timer = setTimeout(() => {
      // 10% chance to simulate API failure
      if (Math.random() < 0.1) {
        setApiError("Database transaction timed out. Click retry.");
        setIsLoading(false);
        return;
      }

      const results = SUGGESTION_DATABASE.filter((item) =>
        item.title.toLowerCase().includes(q)
      );

      // Save to cache
      setCache((prev) => ({ ...prev, [q]: results }));
      setMidSuggestions(results);
      setIsLoading(false);
    }, 600); // Simulated delay

    return () => clearTimeout(timer);
  }, [cache]);

  useEffect(() => {
    if (activeTab !== "mid") return;
    fetchMockApi(debouncedQuery);
  }, [debouncedQuery, activeTab, fetchMockApi]);

  // ==========================================
  // --- ADVANCE TAB (History + Rich Layout) --
  // ==========================================
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("lld_search_history");
      return saved ? JSON.parse(saved) : ["Consistent Hashing", "Raft Protocol"];
    } catch {
      return [];
    }
  });

  const saveHistory = (term: string) => {
    if (!term.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5); // limit to 5 history items
      localStorage.setItem("lld_search_history", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== term);
      localStorage.setItem("lld_search_history", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("lld_search_history");
  };

  const advanceSuggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTION_DATABASE.filter((item) =>
      item.title.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  // Highlight matches function
  const highlightMatch = (text: string, search: string) => {
    const cleanSearch = search.trim();
    if (!cleanSearch) return <span>{text}</span>;

    const regex = new RegExp(`(${cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, idx) =>
          part.toLowerCase() === cleanSearch.toLowerCase() ? (
            <strong key={idx} className="highlight-text-primary">{part}</strong>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent, activeList: any[]) => {
    if (!isOpen || activeList.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % activeList.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < activeList.length) {
          const selected = activeList[highlightedIndex];
          const selectVal = typeof selected === "string" ? selected : selected.title;
          setQuery(selectVal);
          setIsOpen(false);
          if (activeTab === "advance") {
            saveHistory(selectVal);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="page-container" ref={containerRef}>
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Search className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Autosuggest Input Showcase</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/Autosuggest.tsx`}
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
      <div className="autosuggest-tabs" style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("basic"); setIsOpen(false); setQuery(""); }}
        >
          Basic (Static List)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setIsOpen(false); setQuery(""); }}
        >
          Mid (Async API Mock + Cache)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setIsOpen(false); setQuery(""); }}
        >
          Advance (History & Metadata Templates)
        </button>
      </div>

      <div className="autosuggest-main-layout" style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Interactive Input */}
        <div className="autosuggest-input-column" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", position: "relative" }}>
              <h4 style={{ marginBottom: "12px" }}>Basic Autosuggest Input</h4>

              <div className="autosuggest-container">
                <div
                  className="sidebar-search"
                  style={{
                    background: "var(--input-bg)",
                    border: isOpen ? "2px solid var(--primary)" : "1px solid var(--border)",
                    height: "44px",
                    padding: "0 12px",
                    marginBottom: 0,
                    transition: "border-color 0.2s ease"}}
                >
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Type an architecture (e.g. Consistent)..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => handleKeyDown(e, basicSuggestions)}
                    className="search-input"
                  />
                </div>

                {isOpen && query.trim() !== "" && (
                  <div className="autosuggest-dropdown">
                    {basicSuggestions.length === 0 ? (
                      <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No matches found</div>
                    ) : (
                      basicSuggestions.map((item, idx) => {
                        const isHighlighted = idx === highlightedIndex;
                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onClick={() => {
                              setQuery(item.title);
                              setIsOpen(false);
                            }}
                            className={`autosuggest-dropdown-item ${isHighlighted ? "highlighted" : ""}`}
                          >
                            {item.title}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MID */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", position: "relative" }}>
              <h4 style={{ marginBottom: "12px" }}>Mid: Async Simulated Fetch & Results Caching</h4>

              <div className="autosuggest-container">
                <div
                  className="sidebar-search"
                  style={{
                    background: "var(--input-bg)",
                    border: isOpen ? "2px solid var(--primary)" : "1px solid var(--border)",
                    height: "44px",
                    padding: "0 12px",
                    marginBottom: 0,
                    transition: "border-color 0.2s ease"}}
                >
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Type queries (simulate api call)..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => handleKeyDown(e, midSuggestions)}
                    className="search-input"
                  />
                  {isLoading && <Loader className="spinning" size={16} style={{ color: "var(--primary)" }} />}
                </div>

                {isOpen && query.trim() !== "" && !apiError && (
                  <div className="autosuggest-dropdown">
                    {isLoading ? (
                      <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <Loader className="spinning" size={24} />
                        <span>Searching distributed databases...</span>
                      </div>
                    ) : midSuggestions.length === 0 ? (
                      <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No matches found</div>
                    ) : (
                      midSuggestions.map((item, idx) => {
                        const isHighlighted = idx === highlightedIndex;
                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onClick={() => {
                              setQuery(item.title);
                              setIsOpen(false);
                            }}
                            className={`autosuggest-dropdown-item ${isHighlighted ? "highlighted" : ""}`}
                          >
                            {item.title}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {apiError && (
                <div style={{ marginTop: "12px", color: "var(--danger)", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(220, 38, 38, 0.05)", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                  <span>{apiError}</span>
                  <button onClick={() => fetchMockApi(debouncedQuery)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}>Retry</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADVANCE */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", position: "relative" }}>
              <h4 style={{ marginBottom: "12px" }}>Advance: Search History & Metadata Templates</h4>

              <div className="autosuggest-container">
                <div
                  className="sidebar-search"
                  style={{
                    background: "var(--input-bg)",
                    border: isOpen ? "2px solid var(--primary)" : "1px solid var(--border)",
                    height: "44px",
                    padding: "0 12px",
                    marginBottom: 0,
                    transition: "border-color 0.2s ease"}}
                >
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search and save to history..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => handleKeyDown(e, query.trim() === "" ? history : advanceSuggestions)}
                    className="search-input"
                  />
                </div>

                {isOpen && (
                  <div className="autosuggest-dropdown">
                    {/* Recent searches history panel when query is empty */}
                    {query.trim() === "" ? (
                      <div>
                        {history.length > 0 ? (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.02)" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}><Clock size={12} /> RECENT QUERIES</span>
                              <button onClick={clearAllHistory} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.7rem", fontWeight: "700" }}>CLEAR ALL</button>
                            </div>
                            {history.map((term, idx) => {
                              const isHighlighted = idx === highlightedIndex;
                              return (
                                <div
                                  key={term}
                                  onMouseEnter={() => setHighlightedIndex(idx)}
                                  onClick={() => {
                                    setQuery(term);
                                    saveHistory(term);
                                  }}
                                  className={`autosuggest-dropdown-item ${isHighlighted ? "highlighted" : ""}`}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"}}
                                >
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><History size={14} style={{ opacity: 0.6 }} /> {term}</span>
                                  <X size={14} onClick={(e) => deleteHistoryItem(term, e)} style={{ cursor: "pointer", color: "var(--text-muted)", padding: "2px" }} className="delete-history-btn" />
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No recent history</div>
                        )}
                      </div>
                    ) : (
                      /* Rich item suggestion templates */
                      <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {advanceSuggestions.length === 0 ? (
                          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>No matches found</div>
                        ) : (
                          advanceSuggestions.map((item, idx) => {
                            const isHighlighted = idx === highlightedIndex;
                            return (
                              <div
                                key={item.id}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                                onClick={() => {
                                  setQuery(item.title);
                                  saveHistory(item.title);
                                  setIsOpen(false);
                                }}
                                className={`autosuggest-dropdown-item-rich ${isHighlighted ? "highlighted" : ""}`}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "0.95rem", color: "var(--text-h)", fontWeight: "600" }}>
                                    {highlightMatch(item.title, query)}
                                  </span>
                                  <span style={{ fontSize: "0.65rem", background: "var(--input-bg)", padding: "2px 8px", borderRadius: "20px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {item.category}
                                  </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4", flex: 1, paddingRight: "20px" }}>{item.description}</span>
                                  <span style={{ fontSize: "0.8rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px", fontWeight: "700", background: "rgba(245, 158, 11, 0.1)", padding: "2px 6px", borderRadius: "4px" }}><Award size={12} /> {item.stars}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: Watcher logs */}
        <div className="autosuggest-monitor-panel" style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Autosuggest State Monitor</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Text Field Query:</span> &quot;{query}&quot;
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Debounced Value:</span> &quot;{debouncedQuery}&quot;
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Dropdown Opened:</span> {isOpen ? "TRUE" : "FALSE"}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "12px", paddingTop: "12px" }}>
              <h5 style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}><Terminal size={14} /> Caching Engine Logs</h5>
              {activeTab === "mid" ? (
                <div style={{ maxHeight: "80px", overflowY: "auto" }}>
                  {Object.keys(cache).length === 0 ? (
                    <span style={{ color: "var(--text-muted)" }}>Cache empty. Search to populate cache logs.</span>
                  ) : (
                    Object.keys(cache).map((key) => (
                      <div key={key} style={{ color: "var(--success)" }}>
                        cache[&quot;{key}&quot;] = {cache[key].length} results cached
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>Switch to Mid tab to view search cache state logs.</span>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "12px", paddingTop: "12px" }}>
              <h5 style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}><Sparkles size={14} /> History Log</h5>
              {activeTab === "advance" ? (
                <div>
                  {history.map((h, i) => (
                    <div key={i} style={{ color: "var(--text-muted)" }}>[{i}] &quot;{h}&quot;</div>
                  ))}
                </div>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>Switch to Advance tab to inspect localStorage history logs.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Autosuggest;
