import React, { useState, useRef } from "react";
import { translate } from "@statelab/theme";
import { Folder, Search, Loader, ChevronDown, HelpCircle, Keyboard, Cpu, Code} from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  category: string;
  content: string;
}

const ACCORDION_DATA: AccordionItem[] = [
  { id: "acc-1", title: "What is LLD (Low Level Design)?", category: "General", content: "LLD details class diagrams, methods, design patterns, schemas, and object behaviors required to implement system interfaces." },
  { id: "acc-2", title: "How does React Reconciliation work?", category: "React", content: "React compares the virtual DOM with a new state tree using Fiber pointers, running beginWork and completeWork in a cooperative DFS manner." },
  { id: "acc-3", title: "Why use Finite State Machines (FSM)?", category: "Architecture", content: "FSM prevents invalid states. Transitions are deterministic, triggered strictly by declared events, making systems predictable and testable." },
  { id: "acc-4", title: "What is the benefit of virtual lists?", category: "Performance", content: "Virtualization reduces DOM size by rendering only visible items. It calculates offset indexes based on container scroll coordinates." },
];

export const AccordionComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Single Accordion toggle) --
  // ==========================================
  const [basicOpen, setBasicOpen] = useState(false);

  // ==========================================
  // --- MID TAB (Multi modes + Search filter) --
  // ==========================================
  const [midOpenIds, setMidOpenIds] = useState<string[]>([]);
  const [midMode, setMidMode] = useState<"single" | "multi">("single");
  const [search, setSearch] = useState("");

  const filteredItems = ACCORDION_DATA.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMidItem = (id: string) => {
    if (midMode === "single") {
      setMidOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    } else {
      setMidOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  // ==========================================
  // --- ADVANCE TAB (Lazy load & Keyboard trap)
  // ==========================================
  const [advOpenId, setAdvOpenId] = useState<string | null>(null);
  const [lazyContent, setLazyContent] = useState<{ [key: string]: string }>({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(-1);
  const headersRef = useRef<(HTMLButtonElement | null)[]>([]);

  const toggleAdvItem = (id: string) => {
    if (advOpenId === id) {
      setAdvOpenId(null);
      return;
    }

    setAdvOpenId(id);

    // If not loaded, mock load API content
    if (!lazyContent[id]) {
      setLoadingIds((prev) => [...prev, id]);
      setTimeout(() => {
        const item = ACCORDION_DATA.find((i) => i.id === id);
        setLazyContent((prev) => ({
          ...prev,
          [id]: item ? item.content : "Loaded API content successfully."}));
        setLoadingIds((prev) => prev.filter((item) => item !== id));
      }, 700); // 700ms simulated network latency
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number, id: string) => {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIdx = (idx + 1) % ACCORDION_DATA.length;
        setFocusIndex(nextIdx);
        headersRef.current[nextIdx]?.focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIdx = (idx - 1 + ACCORDION_DATA.length) % ACCORDION_DATA.length;
        setFocusIndex(prevIdx);
        headersRef.current[prevIdx]?.focus();
        break;
      }
      case "Home":
        e.preventDefault();
        setFocusIndex(0);
        headersRef.current[0]?.focus();
        break;
      case "End": {
        e.preventDefault();
        const last = ACCORDION_DATA.length - 1;
        setFocusIndex(last);
        headersRef.current[last]?.focus();
        break;
      }
      case "Enter":
      case " ":
        e.preventDefault();
        toggleAdvItem(id);
        break;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Folder className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Accordion Component Sandbox</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/AccordionComponent.tsx`}
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
          Basic (Single Item Fold)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setMidOpenIds([]); }}
        >
          Mid (Single vs Multi-Expand)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setAdvOpenId(null); setFocusIndex(-1); }}
        >
          Advance (Lazy Load & Accessibility)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side Accordions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC ACCORDION */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Simple Collapsible Panel</h4>

              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setBasicOpen(!basicOpen)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    background: "var(--input-bg)",
                    border: "none",
                    color: "var(--text-h)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: 600}}
                >
                  <span>Click to view details</span>
                  <ChevronDown size={18} style={{ transform: basicOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                {/* Animated collapsing container */}
                <div
                  style={{
                    maxHeight: basicOpen ? "100px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.2s ease-out",
                    background: "var(--card-bg)",
                    borderTop: basicOpen ? "1px solid var(--border)" : "none"}}
                >
                  <p style={{ padding: "16px 18px", margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    This accordion uses pure CSS transitions on the <code>max-height</code> property, triggered dynamically by React states.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MID ACCORDION */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Filtered Expandable List</h4>

              {/* Toolbar */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                {/* Search */}
                <div className="sidebar-search" style={{ marginBottom: 0, flex: 1, height: "38px", padding: "0 10px", background: "var(--input-bg)" }}>
                  <Search size={14} />
                  <input type="text" placeholder="Filter headings..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" style={{ fontSize: "0.85rem" }} />
                </div>
                
                {/* Toggle Mode */}
                <div style={{ display: "flex", gap: "4px", background: "var(--input-bg)", padding: "2px", borderRadius: "6px" }}>
                  <button className={`btn ${midMode === "single" ? "btn-primary" : "btn-secondary"}`} onClick={() => { setMidMode("single"); setMidOpenIds([]); }} style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Single Open</button>
                  <button className={`btn ${midMode === "multi" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMidMode("multi")} style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Multi Expand</button>
                </div>
              </div>

              {/* Accordions list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredItems.length === 0 ? (
                  <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)" }}>No matches found</div>
                ) : (
                  filteredItems.map((item) => {
                    const isOpen = midOpenIds.includes(item.id);
                    return (
                      <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                        <button
                          onClick={() => toggleMidItem(item.id)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "var(--input-bg)",
                            border: "none",
                            color: "var(--text-h)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.88rem"}}
                        >
                          <span>{item.title}</span>
                          <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                        </button>
                        
                        <div style={{ maxHeight: isOpen ? "150px" : "0px", overflow: "hidden", transition: "max-height 0.2s ease-out", background: "var(--card-bg)" }}>
                          <p style={{ padding: "14px 16px", margin: 0, fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, borderTop: "1px solid var(--border)" }}>
                            {item.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE ACCORDION */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Lazy API Loading & WAI-ARIA Support</h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ACCORDION_DATA.map((item, idx) => {
                  const isOpen = advOpenId === item.id;
                  const isLoading = loadingIds.includes(item.id);
                  const isFocused = idx === focusIndex;

                  return (
                    <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                      <button
                        ref={(el) => { headersRef.current[idx] = el; }}
                        onClick={() => toggleAdvItem(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, idx, item.id)}
                        onFocus={() => setFocusIndex(idx)}
                        aria-expanded={isOpen}
                        aria-controls={`panel-${item.id}`}
                        id={`header-${item.id}`}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: isFocused ? "var(--border)" : "var(--input-bg)",
                          border: "none",
                          color: "var(--text-h)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          outline: "none",
                          boxShadow: isFocused ? "0 0 0 2px var(--primary)" : "none"}}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.title}
                          {isLoading && <Loader className="animated-spin" size={12} style={{ color: "var(--text-muted)" }} />}
                        </span>
                        <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </button>

                      <div
                        id={`panel-${item.id}`}
                        role="region"
                        aria-labelledby={`header-${item.id}`}
                        style={{
                          maxHeight: isOpen ? "150px" : "0px",
                          overflow: "hidden",
                          transition: "max-height 0.2s ease-out",
                          background: "var(--card-bg)"}}
                      >
                        <div style={{ padding: "14px 16px", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, borderTop: "1px solid var(--border)" }}>
                          {isLoading ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Loader className="animated-spin" size={14} /> Fetching sub-content...</span>
                          ) : (
                            lazyContent[item.id]
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Info Panel */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Accessibility & Loading Details</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Keyboard size={14} /> Keyboard navigation rules</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                W3C Guidelines require up/down arrow keys to shift focus between headers, and Home/End keys to jump immediately to bounds.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Cpu size={14} /> ARIA Declarations</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Every header button declares <code>aria-expanded</code> (boolean status) and <code>aria-controls</code> mapping to the corresponding panel element ID.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "block", color: "var(--text-h)" }}><HelpCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> Lazy Loading</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Advance tab does not load description payloads until the first header click, showing simulated loading spinners to test network transitions.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionComponent;
