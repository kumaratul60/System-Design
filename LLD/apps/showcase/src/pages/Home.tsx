import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { Search, Zap, Briefcase, Target, Users, Code, ArrowRight, Sparkles, Info } from "lucide-react";
import { featureRegistry } from "../featureRegistry";

interface ComponentMeta {
  description: string;
  category: "UI" | "Games" | "LLD" | "Utilities";
  difficulty: "Easy" | "Medium" | "Advance";
}

// Visual descriptions, categories, and difficulty levels for the showcases catalog
const METADATA: Record<string, ComponentMeta> = {
  "/interview/file-explorer": {
    description: "Recursive folder-file tree manager with CRUD actions and deep search query filters.",
    category: "LLD",
    difficulty: "Advance"
  },
  "/interview/guess-number": {
    description: "Interactive guessing game with narrowing boundaries, lives, and highscore lists.",
    category: "Games",
    difficulty: "Easy"
  },
  "/interview/tic-tac-toe": {
    description: "Variable grid PvP & minimax AI bot game with audio cues and history rollback.",
    category: "Games",
    difficulty: "Medium"
  },
  "/interview/chess-board": {
    description: "Chessboard moves suggestion, captured piece ledgers, chess clocks and PGN output.",
    category: "Games",
    difficulty: "Advance"
  },
  "/interview/chips-input": {
    description: "Tag input pills with email format validators, arrow navigation, and blur overflows.",
    category: "UI",
    difficulty: "Easy"
  },
  "/interview/area-selector": {
    description: "Grid click-and-drag coordinate tracker, Cmd additive modifier selection, and logger index.",
    category: "LLD",
    difficulty: "Medium"
  },
  "/interview/column-grid": {
    description: "Serpentine snake mathematical layout visualizer with rows and columns range selectors.",
    category: "LLD",
    difficulty: "Easy"
  },
  "/interview/column-table": {
    description: "Dynamic spreadsheet grid with cell edits, sorting, and inline formula parsers (=SUM).",
    category: "LLD",
    difficulty: "Advance"
  },
  "/interview/string-transformers": {
    description: "Case converters, base64/URL encoders, and native Subtle API SHA-256 binary digests.",
    category: "Utilities",
    difficulty: "Easy"
  },
  "/interview/json-viewer": {
    description: "Collapsible syntax highlighted tree with search filters and accessor path tracing.",
    category: "Utilities",
    difficulty: "Medium"
  },
  "/interview/diff-checker": {
    description: "Line/character comparison engine with diff ratios and scroll synchronization.",
    category: "Utilities",
    difficulty: "Medium"
  },
  "/interview/url-state-sync": {
    description: "Keep search queries and multi-option filters synchronized with browser URL parameters.",
    category: "Utilities",
    difficulty: "Medium"
  },
  "/interview/url-inspector": {
    description: "Break down URL segments and recursively parse nested JWTs, JSON, and queries.",
    category: "Utilities",
    difficulty: "Advance"
  },
  "/interview/dropdown": {
    description: "Custom multi-select dropdown with search filtering, click-outside closures, and keyboard traps.",
    category: "UI",
    difficulty: "Easy"
  },
  "/interview/autosuggest": {
    description: "Typeahead debounced suggestions input with result categories and keyword highlighting.",
    category: "UI",
    difficulty: "Medium"
  },
  "/interview/autocomplete": {
    description: "Fast frontend dictionary autocompletion engine with custom matching scores.",
    category: "UI",
    difficulty: "Medium"
  },
  "/interview/carousel": {
    description: "Responsive image slider with navigation arrows, autoplay, indicators, and animations.",
    category: "UI",
    difficulty: "Easy"
  },
  "/interview/star-rating": {
    description: "Interactive rating component supporting fractional star precisions and hover resets.",
    category: "UI",
    difficulty: "Easy"
  },
  "/interview/timer": {
    description: "Stopwatch with lap records, split averages, and precise millisecond tick triggers.",
    category: "LLD",
    difficulty: "Easy"
  },
  "/interview/progress-bar": {
    description: "Simulated task bar showing dynamic download speed, progress ratios, and ETA timers.",
    category: "LLD",
    difficulty: "Easy"
  },
  "/interview/countdown-timer": {
    description: "Circular SVG time counter with presets, sound alarms, and state progress loops.",
    category: "LLD",
    difficulty: "Medium"
  },
  "/interview/calendar-viewer": {
    description: "Schedule agenda organizer with monthly blocks, event creators, and filter badges.",
    category: "LLD",
    difficulty: "Medium"
  },
  "/interview/video-player": {
    description: "Custom video player overlay with hotkeys, overlay controls, and playback logs.",
    category: "LLD",
    difficulty: "Medium"
  },
  "/interview/multistep-form": {
    description: "Wizard forms with conditional step paths, validation summaries, and draft caches.",
    category: "LLD",
    difficulty: "Medium"
  },
  "/interview/otp-verification": {
    description: "Verification code grid with index jumping, backspace deletions, and clipboard paste sync.",
    category: "LLD",
    difficulty: "Easy"
  },
  "/todos": {
    description: "Task lists board wired to demonstrate state synchronization across six engines.",
    category: "Utilities",
    difficulty: "Medium"
  },
  "/products": {
    description: "E-commerce interface showing item grid, cart ledgers, and detail routing.",
    category: "Utilities",
    difficulty: "Medium"
  },
  "/memes": {
    description: "Meme generator calling external REST APIs and preserving settings configuration.",
    category: "UI",
    difficulty: "Easy"
  },
  "/infinite-scroll": {
    description: "Virtual list scroller fetching paginated datasets from mock API nodes.",
    category: "Utilities",
    difficulty: "Medium"
  },
  "/traffic-light": {
    description: "Finite state machine traffic signal visualizer with timers and controls.",
    category: "LLD",
    difficulty: "Easy"
  },
  "/trello": {
    description: "Drag-and-drop task boards with custom lane transitions and action ledgers.",
    category: "LLD",
    difficulty: "Advance"
  }
};

const FrameworkLogos: React.FC = () => (
  <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", marginTop: "24px", flexWrap: "wrap" }}>
    {/* HTML5 */}
    <div className="framework-badge html5" title="HTML5" style={{ background: "rgba(227, 79, 38, 0.08)", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(227, 79, 38, 0.2)" }}>
      <svg viewBox="0 0 512 512" width="16" height="16">
        <path fill="#E34F26" d="M108.4 0h295.2l-26.6 447.8-121 33.6-121-33.6z"/>
        <path fill="#EF652A" d="M256 36v398.4l87 24.2 19.8-333.6z"/>
        <path fill="#EBEBEB" d="M256 161.4H192v48.6h64v50.4h-64v48.6h128l-6 100.8-58 16.2-58-16.2-3.8-64.8h48.6l2 32.4 20.8 5.6 20.8-5.6 3-50H157.6l-11.2-192h219.2V161.4z"/>
      </svg>
      <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#E34F26" }}>HTML5</span>
    </div>
    {/* JavaScript */}
    <div className="framework-badge js" title="JavaScript" style={{ background: "rgba(247, 223, 30, 0.08)", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(247, 223, 30, 0.2)" }}>
      <div style={{ width: 14, height: 14, background: "#f7df1e", color: "#000000", fontWeight: "bold", fontFamily: "sans-serif", fontSize: "9px", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "1px", borderRadius: "2px" }}>
        JS
      </div>
      <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#d6be00" }}>JavaScript</span>
    </div>
    {/* React */}
    <div className="framework-badge react" title="React" style={{ background: "rgba(97, 218, 251, 0.08)", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(97, 218, 251, 0.2)" }}>
      <svg viewBox="-11.5 -10.23174 23 20.46348" width="16" height="16">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
      <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#00b4d8" }}>React</span>
    </div>
    {/* Zustand */}
    <div className="framework-badge zustand" title="Zustand" style={{ background: "rgba(59, 130, 246, 0.08)", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
      <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--primary)" }}>🐻 Zustand</span>
    </div>
    {/* Redux */}
    <div className="framework-badge redux" title="Redux" style={{ background: "rgba(118, 74, 188, 0.08)", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(118, 74, 188, 0.2)" }}>
      <svg viewBox="0 0 512 512" width="16" height="16">
        <path fill="#764abc" d="M358.4 128C320 128 297.6 150.4 297.6 188.8v64H358.4c38.4 0 60.8-22.4 60.8-60.8V128zM153.6 384c38.4 0 60.8-22.4 60.8-60.8V259.2H153.6c-38.4 0-60.8 22.4-60.8 60.8V384zM358.4 259.2H297.6V323.2c0 38.4 22.4 60.8 60.8 60.8H419.2V323.2C419.2 284.8 396.8 259.2 358.4 259.2zM153.6 128H92.8V192c0 38.4 22.4 60.8 60.8 60.8H214.4V192c0-38.4-22.4-64-60.8-64z"/>
      </svg>
      <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#764abc" }}>Redux Toolkit</span>
    </div>
  </div>
);

interface EngineDetail {
  id: number;
  name: string;
  label: string;
  desc: string;
  flow: string;
}

const ENGINE_DETAILS: EngineDetail[] = [
  {
    id: 1,
    name: "Prop Drilling",
    label: "Engine 1: Prop Drilling",
    desc: "Raw state parameters and mutate callbacks are passed down explicitly through intermediate component nodes. Simple to write, but creates tight coupling and forces unnecessary re-renders of middle-tier components that do not use the state.",
    flow: "Parent State -> Component Props -> Intermediate Prop drilling -> Leaf Component"
  },
  {
    id: 2,
    name: "LocalStorage Sync",
    label: "Engine 2: LocalStorage Sync",
    desc: "Saves and loads state variables directly from the browser's persistent storage. Listens to storage events to synchronize states across separate tabs/windows. Useful for caching preferences, but has serialization overheads.",
    flow: "State Change -> LocalStorage Write -> Storage Change Listener -> Hook State Update"
  },
  {
    id: 3,
    name: "React Context API",
    label: "Engine 3: React Context API",
    desc: "Employs native React Context Providers to distribute states directly to consumer hooks. Eliminates prop drilling, but updates to any context value will trigger re-renders in all subscribing consumers.",
    flow: "Context Provider -> Context Bus -> direct consumer hook hookups"
  },
  {
    id: 4,
    name: "XState (FSM)",
    label: "Engine 4: XState (Finite State Machine)",
    desc: "Models application states and transitions using strict mathematical Finite State Machine (FSM) configurations. State mutations are triggered only by dispatching actions, preventing illegal states.",
    flow: "State Chart definition -> Machine Service -> Event Dispatch -> State Transition"
  },
  {
    id: 5,
    name: "Zustand",
    label: "Engine 5: Zustand",
    desc: "A lightweight hook-based external state store that uses closure actions. Employs selector subscriptions so that components only re-render when their specific mapped properties change, providing top-tier performance.",
    flow: "External Store -> Selector Subscription -> Action dispatch -> Selective hook updates"
  },
  {
    id: 6,
    name: "Redux Toolkit",
    label: "Engine 6: Redux Toolkit",
    desc: "A centralized, unidirectional state store that utilizes standard slices, action dispatchers, and immutable reducers. Centralized store layout enables extensive state time-travel debugging and tracing.",
    flow: "Centralized Store -> Slice Reducers -> Action Dispatch -> Selector mapping updates"
  }
];

export const Home: React.FC = () => {
  const [selectedEngineTab, setSelectedEngineTab] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isKCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && document.activeElement !== searchInputRef.current && !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement);

      if (isKCombo || isSlash) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, idx) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={idx} className="search-highlight">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Dynamic derivation of registered challenge lists
  const challenges = useMemo(() => {
    return featureRegistry
      .filter((route) => route.sidebar && route.path !== "/" && route.path !== "/admin")
      .map((route) => {
        const path = route.path;
        const label = route.labelKey ? translate(route.labelKey) : path.replace("/interview/", "").replace("-", " ");
        const meta = METADATA[path] || {
          description: "Interactive LLD showcase component demonstrating dynamic state interactions.",
          category: "UI" as const,
          difficulty: "Medium" as const
        };
        return {
          path,
          label,
          icon: route.icon,
          ...meta
        };
      });
  }, []);

  // Filter challenges list based on states
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === "All" || c.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [challenges, searchQuery, difficultyFilter, categoryFilter]);

  const handleExploreScroll = () => {
    document.getElementById("explore-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page">
      {/* Centered Hero Header */}
      <section className="home-hero">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", marginBottom: "16px" }}>
          <Sparkles size={12} /> Frontend Lab Portal
        </div>
        <h1 className="home-hero-title">Prepare for LLD & UI Coding Interviews</h1>
        <p className="home-hero-subtitle">
          Master frontend system design by exploring interactive challenges, comparing state management engines, and inspecting low-level design patterns.
        </p>
        <div className="home-hero-buttons">
          <button className="btn btn-primary" onClick={handleExploreScroll}>
            Explore Showcase Grid
          </button>
        </div>
        <FrameworkLogos />
      </section>

      {/* Why LLD StateLab Section */}
      <section>
        <h2 className="why-section-title">Why Frontend Lab?</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-card-icon-container">
              <Target size={22} />
            </div>
            <h4>40+ Interactive Showcases</h4>
            <p>Practice LLD by exploring components covering chessboards, nested comments, file trees, and calendars.</p>
          </div>

          <div className="why-card">
            <div className="why-card-icon-container">
              <Zap size={22} />
            </div>
            <h4>6 State Paradigms</h4>
            <p>Directly compare state architectures (Zustand, Redux, Context, XState, Storage) working in real-time.</p>
          </div>

          <div className="why-card">
            <div className="why-card-icon-container">
              <Briefcase size={22} />
            </div>
            <h4>Interview Ready Solutions</h4>
            <p>Mock real-world LLD scenarios including OTP codes, debounced typeaheads, and serpentine snakes grids.</p>
          </div>
          <div className="why-card">
            <div className="why-card-icon-container">
              <Users size={22} />
            </div>
            <h4>Clean Architecture Code</h4>
            <p>Fully typed typescript layouts, modular CSS, zero global warnings, and strict lint conformity.</p>
          </div>
        </div>
      </section>

      {/* State Engines Comparative Architectures Tab View */}
      <section className="engine-tabs-section">
        <h2 className="why-section-title" style={{ textAlign: "left", marginBottom: "20px", fontSize: "1.6rem" }}>
          State Engines Comparative Analysis
        </h2>
        
        {/* Tab row */}
        <div className="engine-tabs-row">
          {ENGINE_DETAILS.map((engine) => (
            <button
              key={engine.id}
              onClick={() => setSelectedEngineTab(engine.id)}
              className={`engine-tab-button ${selectedEngineTab === engine.id ? "active" : ""}`}
            >
              {engine.name}
            </button>
          ))}
        </div>

        {/* Selected Engine details card */}
        {(() => {
          const current = ENGINE_DETAILS.find(e => e.id === selectedEngineTab);
          if (!current) return null;
          return (
            <div className="engine-info-card">
              <h4 className="engine-info-title">
                <Info size={16} style={{ color: "#38bdf8" }} />
                {current.label}
              </h4>
              <p className="engine-info-desc">
                {current.desc}
              </p>
              <div className="engine-info-flow">
                <strong>Data Flow Outline:</strong>
                <span className="engine-code-box">{current.flow}</span>
              </div>
            </div>
          );
        })()}
      </section>



      {/* Main Filter Catalog Grid */}
      <section className="challenges-section" id="explore-grid">
        {/* Runlet Featured Card */}
        <div className="runlet-featured-card">
          <div className="runlet-card-content">
            <div className="runlet-card-badge">
              <Code size={12} />
              <span>Core JS Playground</span>
            </div>
            <h3 className="runlet-card-title">Practice Core JavaScript & Internal Mechanics</h3>
            <p className="runlet-card-desc">
              Run, test, and trace how vanilla JS works in-depth under the hood. Practice core JS patterns, closures, prototypes, and event loops directly in our premium online editor environment.
            </p>
          </div>
          <div className="runlet-card-action">
            <a
              href="https://runlet.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="runlet-btn"
            >
              <span>Launch Runlet Editor</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <h2 style={{ textAlign: "left", margin: 0, fontSize: "1.6rem", fontWeight: "bold", color: "var(--text-h)" }}>
          LLD Components Directory
        </h2>

        {/* Filter bar */}
        <div className="filters-bar">
          {/* Search wrapper */}
          <div className="search-wrapper" style={{ display: "flex", alignItems: "center" }}>
            <Search size={16} className="search-icon-svg" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search challenges (Press '/' to search)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
              style={{ paddingRight: "36px" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0
                }}
                title="Clear search"
              >
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>×</span>
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="select-filter-dropdown"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Advance">🔴 Advance</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-filter-dropdown"
          >
            <option value="All">All Categories</option>
            <option value="UI">UI</option>
            <option value="Games">Games</option>
            <option value="LLD">LLD</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>

        {/* Grid display */}
        {filteredChallenges.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--card-bg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1rem" }}>No challenges match your search query or filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setDifficultyFilter("All");
                setCategoryFilter("All");
              }}
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "6px 16px" }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="challenges-grid">
            {filteredChallenges.map((challenge) => {
              const Icon = challenge.icon || Code;
              return (
                <div key={challenge.path} className="challenge-card">
                  <div className="challenge-card-header">
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <Icon size={16} style={{ color: "var(--primary)", marginTop: "2px", flexShrink: 0 }} />
                      <h4 className="challenge-title">{highlightText(challenge.label, searchQuery)}</h4>
                    </div>
                    <span className={`difficulty-badge difficulty-${challenge.difficulty.toLowerCase()}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  <p className="challenge-card-body">{highlightText(challenge.description, searchQuery)}</p>

                  <div className="challenge-card-footer">
                    <span className="category-tag">{challenge.category}</span>
                    <Link to={challenge.path} className="open-challenge-link">
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
