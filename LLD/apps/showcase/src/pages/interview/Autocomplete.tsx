import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, Terminal, Keyboard } from "lucide-react";

// --- Types & Interfaces ---
export interface UseAutocompleteParams {
  sourceList: string[];
  debounceMs?: number;
}

// --- Data Layer: Custom Hook ---
export function useAutocompleteLogic({
  sourceList,
  debounceMs = 300,
}: UseAutocompleteParams) {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Debouncing effect closure
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  // Filter lists based on debounced search query
  const suggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return sourceList.filter((item) => item.toLowerCase().includes(q));
  }, [debouncedQuery, sourceList]);

  // Keep highlightedIndex in bounds
  useEffect(() => {
    setHighlightedIndex((prev) => {
      if (suggestions.length === 0) return -1;
      if (prev >= suggestions.length) return suggestions.length - 1;
      return prev;
    });
  }, [suggestions]);

  const selectSuggestion = useCallback((val: string) => {
    setQuery(val);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            selectSuggestion(suggestions[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex, selectSuggestion]
  );

  return {
    query,
    setQuery,
    debouncedQuery,
    suggestions,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    selectSuggestion,
    handleKeyDown,
  };
}

// --- Query Highlight Splitting (Safe, no dangerouslySetInnerHTML) ---
interface HighlightProps {
  text: string;
  query: string;
}

const HighlightMatch: React.FC<HighlightProps> = ({ text, query }) => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return <span>{text}</span>;

  // Escape special regex tags
  const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, idx) =>
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
          <mark
            key={idx}
            style={{
              background: "rgba(34, 197, 94, 0.25)",
              color: "var(--success)",
              fontWeight: "bold",
              borderRadius: "2px",
              padding: "0 2px",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </span>
  );
};

// --- Dummy Frontend Terms Database ---
const FRONTEND_SYSTEM_TERMS = [
  "React Reconciliation Engine",
  "Virtual DOM Diffing Algorithm",
  "Finite State Machine Model",
  "Intersection Observer API",
  "Resize Observer Layout",
  "Debounced Performance Closure",
  "Throttled Scroll Hook",
  "HTML5 Canvas Graphic Rendering",
  "Reddit Nested Comments DFS Recursion",
  "Virtual Viewport Slicing Math",
  "Tailwind Utility Class Layouts",
  "Strict TypeScript Interfaces",
  "Zustand State Store Hooks",
  "Redux Thunk Actions Middleware",
  "Event Loop Macrotask Queue",
  "CSS Variables Dark Mode Theme",
  "Webpack Bundle Split Optimizations",
];

// --- UI Layer: Presentation Component ---
export const Autocomplete: React.FC = () => {
  const {
    query,
    setQuery,
    debouncedQuery,
    suggestions,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    selectSuggestion,
    handleKeyDown,
  } = useAutocompleteLogic({
    sourceList: FRONTEND_SYSTEM_TERMS,
    debounceMs: 250,
  });

  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setIsOpen]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Search className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Precision Autocomplete Search</h3>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Autocomplete Input container */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Search Concepts Database</label>
          
          <div
            className="sidebar-search"
            style={{
              marginBottom: 0,
              background: "var(--card-bg)",
              border: isOpen ? "2px solid var(--text-h)" : "1px solid var(--border)",
              boxSizing: "border-box",
              height: "44px",
              padding: "0 14px",
            }}
          >
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search frontend term (e.g. React)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="search-input"
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (query.trim() !== "") && (
            <div
              ref={listRef}
              style={{
                position: "absolute",
                top: "76px",
                left: 0,
                right: 0,
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--border-radius)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                zIndex: 50,
                maxHeight: "240px",
                overflowY: "auto",
              }}
            >
              {suggestions.length === 0 ? (
                <div style={{ padding: "14px", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}>
                  No matches found for &quot;{query}&quot;
                </div>
              ) : (
                suggestions.map((suggestion, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <div
                      key={suggestion}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectSuggestion(suggestion)}
                      style={{
                        padding: "12px 16px",
                        background: isHighlighted ? "var(--input-bg)" : "transparent",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: isHighlighted ? "var(--text-h)" : "var(--text)",
                        borderBottom: "1px solid var(--border)",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <HighlightMatch text={suggestion} query={debouncedQuery} />
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div
            style={{
              marginTop: "8px",
              padding: "12px",
              borderRadius: "var(--border-radius)",
              background: "var(--input-bg)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            <Keyboard size={16} />
            <span>
              Use <kbd style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>↓</kbd> /{" "}
              <kbd style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>↑</kbd> to navigate,{" "}
              <kbd style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>Enter</kbd> to select.
            </span>
          </div>
        </div>

        {/* Right Info Box */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Terminal size={16} /> State Watcher
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Raw Query:</span> &quot;{query}&quot;
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Debounced Query:</span> &quot;{debouncedQuery}&quot;
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Highlighted Index:</span> {highlightedIndex}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "8px" }}>
              <span style={{ display: "block", fontWeight: "bold", marginBottom: "4px", color: "var(--text-h)" }}>
                Debounce Architecture:
              </span>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>
                The search query is held back for 250ms using a setTimeout closure, suppressing heavy filtering runs during fast typing.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Autocomplete;
