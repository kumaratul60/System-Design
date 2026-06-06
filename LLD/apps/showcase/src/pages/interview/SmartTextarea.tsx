import React, { useState, useRef, useEffect } from "react";
import { translate } from "@statelab/theme";
import { MessageSquare, AlertTriangle, Users, Hash, ChevronRight, Code} from "lucide-react";

// Mock Data for Suggestions
const MOCK_USERS = ["atul", "react_dev", "system_design", "js_wizard", "google_mind", "dan_abramov"];
const MOCK_TAGS = ["react", "systemdesign", "lowleveldesign", "frontend", "javascript", "state_management"];

export const SmartTextarea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // --- Common / Shared State ---
  const [text, setText] = useState("");
  const limit = 280;

  // --- Basic Tab State ---
  const basicCount = text.length;
  const basicPercentage = Math.min((basicCount / limit) * 100, 100);

  // --- Mid Tab State / Refs ---
  const midTextareaRef = useRef<HTMLTextAreaElement>(null);
  const midOverlayRef = useRef<HTMLDivElement>(null);

  // Synchronize scrolling of textarea and overlay in Mid Tab
  const handleMidScroll = () => {
    if (midTextareaRef.current && midOverlayRef.current) {
      midOverlayRef.current.scrollTop = midTextareaRef.current.scrollTop;
      midOverlayRef.current.scrollLeft = midTextareaRef.current.scrollLeft;
    }
  };

  // Helper to highlight hashtags, mentions, and overflow text
  const renderHighlightedText = (val: string) => {
    if (!val) return <span style={{ color: "transparent" }}>&nbsp;</span>;

    // Split text into within-limit and over-limit
    const withinLimitText = val.slice(0, limit);
    const overLimitText = val.slice(limit);

    // Helper to colorize hashtags and mentions
    const formatRegexTokens = (txt: string) => {
      // Split by spaces and keep spacing to maintain character index alignment
      const tokens = txt.split(/(\s+)/);
      return tokens.map((token, idx) => {
        if (token.startsWith("@") && token.length > 1) {
          return (
            <span key={idx} style={{ color: "#3b82f6", fontWeight: "600" }}>
              {token}
            </span>
          );
        }
        if (token.startsWith("#") && token.length > 1) {
          return (
            <span key={idx} style={{ color: "#10b981", fontWeight: "600" }}>
              {token}
            </span>
          );
        }
        return <span key={idx}>{token}</span>;
      });
    };

    return (
      <>
        {formatRegexTokens(withinLimitText)}
        {overLimitText && (
          <span style={{ backgroundColor: "rgba(239, 68, 68, 0.3)", borderBottom: "2px solid #ef4444" }}>
            {overLimitText}
          </span>
        )}
      </>
    );
  };

  // --- Advance Tab State / Refs ---
  const advanceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const advanceOverlayRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsType, setSuggestionsType] = useState<"user" | "tag" | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [triggerIndex, setTriggerIndex] = useState(-1);

  // Auto-grow height function
  const autoGrowHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (activeTab === "advance" && advanceTextareaRef.current) {
      autoGrowHeight(advanceTextareaRef.current);
    }
  }, [text, activeTab]);

  // Sync scroll for advance tab
  const handleAdvanceScroll = () => {
    if (advanceTextareaRef.current && advanceOverlayRef.current) {
      advanceOverlayRef.current.scrollTop = advanceTextareaRef.current.scrollTop;
      advanceOverlayRef.current.scrollLeft = advanceTextareaRef.current.scrollLeft;
    }
  };

  const handleAdvanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    autoGrowHeight(e.target);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);

    // Find if we are typing a mention or a tag
    const lastWordMatch = textBeforeCursor.match(/[\s\n](@[a-zA-Z0-9_]*|#[a-zA-Z0-9_]*)$/) || 
                          textBeforeCursor.match(/^(@[a-zA-Z0-9_]*|#[a-zA-Z0-9_]*)$/);

    if (lastWordMatch) {
      const match = lastWordMatch[1];
      const type = match.startsWith("@") ? "user" : "tag";
      const query = match.slice(1).toLowerCase();
      const matchIndex = selectionStart - match.length;

      setTriggerIndex(matchIndex);
      setSuggestionsType(type);

      const list = type === "user" ? MOCK_USERS : MOCK_TAGS;
      const filtered = list.filter((item) => item.toLowerCase().includes(query));

      if (filtered.length > 0) {
        setFilteredSuggestions(filtered);
        setSuggestionIndex(0);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (selected: string) => {
    if (triggerIndex === -1 || !advanceTextareaRef.current) return;
    const prefix = suggestionsType === "user" ? "@" : "#";
    const replacement = `${prefix}${selected} `;
    
    const before = text.slice(0, triggerIndex);
    const cursor = advanceTextareaRef.current.selectionStart;
    const after = text.slice(cursor);

    const updatedText = before + replacement + after;
    setText(updatedText);
    setShowSuggestions(false);

    // Reset cursor position to right after the inserted value
    const newCursorPos = triggerIndex + replacement.length;
    setTimeout(() => {
      if (advanceTextareaRef.current) {
        advanceTextareaRef.current.focus();
        advanceTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleAdvanceKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[suggestionIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <MessageSquare className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Smart Textarea Showcase</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/SmartTextarea.tsx`}
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
          onClick={() => { setActiveTab("basic"); setShowSuggestions(false); }}
        >
          Basic (Character Count)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setShowSuggestions(false); }}
        >
          Mid (Text Overlay Highlight)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setShowSuggestions(false); }}
        >
          Advance (Auto-suggest & Auto-grow)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "24px", alignItems: "start" }}>
        {/* Left Interactive Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* TAB 1: BASIC */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Basic Character Counting Textarea</h4>
              
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <textarea
                  className="select-input"
                  style={{
                    width: "100%",
                    height: "150px",
                    background: "var(--input-bg)",
                    border: text.length > limit ? "2px solid #ef4444" : "1px solid var(--border)",
                    color: "var(--text-h)",
                    padding: "12px",
                    resize: "none",
                    borderRadius: "8px"}}
                  placeholder="What's happening? Type here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {/* Toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* SVG circular progress ring */}
                  <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={text.length > limit ? "#ef4444" : text.length > limit - 20 ? "#f59e0b" : "var(--primary)"}
                      strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 14}
                      strokeDashoffset={2 * Math.PI * 14 * (1 - basicPercentage / 100)}
                      style={{ transition: "stroke-dashoffset 0.1s ease-in-out" }}
                    />
                  </svg>
                  <span style={{ fontSize: "0.85rem", color: text.length > limit ? "#ef4444" : "var(--text-muted)" }}>
                    {limit - text.length} characters remaining
                  </span>
                </div>
                
                <button
                  className="btn btn-primary"
                  disabled={text.length === 0 || text.length > limit}
                >
                  Post Tweet
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MID */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Mid: Exceeded Text Overlay & Tokenizer</h4>
              
              {/* Overlay container wrapper */}
              <div style={{ position: "relative", width: "100%", height: "150px", overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input-bg)" }}>
                {/* 1. Backdrop overlay */}
                <div
                  ref={midOverlayRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "12px",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    color: "transparent",
                    background: "transparent",
                    overflow: "auto",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: "1.5",
                    pointerEvents: "none"}}
                >
                  {renderHighlightedText(text)}
                </div>

                {/* 2. Front textarea */}
                <textarea
                  ref={midTextareaRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "100%",
                    padding: "12px",
                    margin: 0,
                    background: "transparent",
                    border: "none",
                    color: "var(--text-h)",
                    caretColor: "var(--text-h)",
                    resize: "none",
                    overflow: "auto",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: "1.5",
                    // Semi-transparent so highlight is visible underneath
                    WebkitTextFillColor: "rgba(255, 255, 255, 0.85)"}}
                  placeholder="Try writing hashtags #react or @mentions. Go past 280 characters to see the red highlight overlay!"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onScroll={handleMidScroll}
                />
              </div>

              {/* Specs alert */}
              <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
                <span>Text beyond 280 characters is highlighted in red. `#tags` in green, and `@mentions` in blue.</span>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Advance: Auto-suggestions & Auto-growing Input</h4>
              
              <div style={{ position: "relative" }}>
                {/* Textarea container */}
                <div style={{ position: "relative", minHeight: "100px", width: "100%", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input-bg)" }}>
                  {/* Backdrop overlay */}
                  <div
                    ref={advanceOverlayRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: "12px",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      color: "transparent",
                      background: "transparent",
                      overflow: "hidden",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      lineHeight: "1.5",
                      pointerEvents: "none"}}
                  >
                    {renderHighlightedText(text)}
                  </div>

                  {/* Front autosizing textarea */}
                  <textarea
                    ref={advanceTextareaRef}
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px",
                      margin: 0,
                      background: "transparent",
                      border: "none",
                      color: "var(--text-h)",
                      caretColor: "var(--text-h)",
                      resize: "none",
                      overflow: "hidden",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      lineHeight: "1.5",
                      display: "block"}}
                    placeholder="Type '@' for users or '#' for tags (e.g. type @a or #r)..."
                    value={text}
                    onChange={handleAdvanceChange}
                    onKeyDown={handleAdvanceKeyDown}
                    onScroll={handleAdvanceScroll}
                  />
                </div>

                {/* Suggestions Dropdown overlay */}
                {showSuggestions && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "12px",
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
                      zIndex: 100,
                      width: "200px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      marginTop: "4px"}}
                  >
                    <div style={{ padding: "6px 10px", fontSize: "0.75rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "6px" }}>
                      {suggestionsType === "user" ? <Users size={12} /> : <Hash size={12} />}
                      <span>Matching {suggestionsType === "user" ? "Users" : "Tags"}</span>
                    </div>
                    {filteredSuggestions.map((item, index) => {
                      const isSelected = index === suggestionIndex;
                      return (
                        <div
                          key={item}
                          onClick={() => selectSuggestion(item)}
                          onMouseEnter={() => setSuggestionIndex(index)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            background: isSelected ? "var(--input-bg)" : "transparent",
                            color: isSelected ? "var(--text-h)" : "var(--text)"}}
                        >
                          {suggestionsType === "user" ? `@${item}` : `#${item}`}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginTop: "12px", display: "flex", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <ChevronRight size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Textarea auto-grows downwards. Typing `@` or `#` triggers an autocomplete helper with keyboard navigation.</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Panel */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>System Design & Interview Focus</h4>
          
          <div style={{ fontSize: "0.85rem", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "var(--text-h)" }}>1. DOM Overlay Coordination</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                To highlight specific words (like hashtags or text exceeding limits) in a native textarea, we position an overlay div directly behind a transparent textarea.
                Matching font-size, padding, line-height, and borders ensures absolute visual mapping.
              </p>
            </div>
            
            <div>
              <strong style={{ color: "var(--text-h)" }}>2. Textarea Auto-Growing</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Auto-sizing is done by setting the height to <code>auto</code> and then querying the DOM scrollHeight.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-h)" }}>3. Tokenizer Parser</strong>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Regular expressions detect target tokens dynamically. We split text while preserving spacing to keep alignment in sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTextarea;
