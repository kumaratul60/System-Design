import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, RefreshCw, Volume2, Copy, Play, Pause, Compass } from "lucide-react";

interface Quote {
  text: string;
  author: string;
  category: "wisdom" | "technology" | "inspiration";
}

const QUOTES_DB: Quote[] = [
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "wisdom" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "technology" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "inspiration" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "technology" },
  { text: "Clean code always looks like it was written by someone who cares.", author: "Michael Feathers", category: "wisdom" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson", category: "wisdom" },
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs", category: "inspiration" },
];

export const RandomQuoteGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Shared active quote state
  const [currentQuote, setCurrentQuote] = useState<Quote>(QUOTES_DB[0]);

  const getNewQuote = useCallback((categoryFilter?: Quote["category"]) => {
    let list = QUOTES_DB;
    if (categoryFilter) {
      list = QUOTES_DB.filter((q) => q.category === categoryFilter);
    }
    // Pick random index different from current text if possible
    const filteredList = list.filter((q) => q.text !== currentQuote.text);
    const targetList = filteredList.length > 0 ? filteredList : list;
    const randomIdx = Math.floor(Math.random() * targetList.length);
    setCurrentQuote(targetList[randomIdx]);
  }, [currentQuote.text]);

  // ==========================================
  // --- BASIC TAB (Simple Next Button) -------
  // ==========================================
  const handleBasicNext = () => {
    getNewQuote();
  };

  // ==========================================
  // --- MID TAB (Category & Share Copy) ------
  // ==========================================
  const [activeCategory, setActiveCategory] = useState<Quote["category"] | "all">("all");
  const [copied, setCopied] = useState(false);

  const handleMidNext = () => {
    getNewQuote(activeCategory === "all" ? undefined : activeCategory);
  };

  const copyQuoteToClipboard = () => {
    navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetQuote = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${currentQuote.text}" — ${currentQuote.author}`)}`;
    window.open(url, "_blank");
  };

  // ==========================================
  // --- ADVANCE TAB (Speech Synthesis & Slideshow)
  // ==========================================
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [slideshowDelay, setSlideshowDelay] = useState(5); // in seconds
  const [speaking, setSpeaking] = useState(false);
  const slideshowTimerRef = useRef<any>(null);

  // Slideshow play effect
  useEffect(() => {
    if (!isPlayingSlideshow) {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
      return;
    }

    slideshowTimerRef.current = setInterval(() => {
      getNewQuote();
    }, slideshowDelay * 1000);

    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isPlayingSlideshow, slideshowDelay, getNewQuote]);

  // Speech synthesis play quote out loud
  const playQuoteSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(currentQuote.text);
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Reset states when changing tabs
  useEffect(() => {
    setIsPlayingSlideshow(false);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, [activeTab]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <MessageSquare className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Random Quote Generator</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Random Card Display)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Category Filter & Share)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Audio Speech & Slideshow)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Quote Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Controls for category in Mid tab */}
          {activeTab === "mid" && (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {(["all", "wisdom", "technology", "inspiration"] as const).map((cat) => (
                <button
                  key={cat}
                  className={`btn ${activeCategory === cat ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveCategory(cat)}
                  style={{ textTransform: "capitalize", padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Interactive delay controls in Advance tab */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "12px 18px", display: "flex", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {!isPlayingSlideshow ? (
                  <button className="btn btn-primary" onClick={() => setIsPlayingSlideshow(true)} style={{ padding: "4px 8px", fontSize: "0.75rem" }}><Play size={12} /> Play Slideshow</button>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setIsPlayingSlideshow(false)} style={{ padding: "4px 8px", fontSize: "0.75rem" }}><Pause size={12} /> Pause Slideshow</button>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem" }}>Interval: {slideshowDelay}s</span>
                <input type="range" min="3" max="15" value={slideshowDelay} onChange={(e) => setSlideshowDelay(Number(e.target.value))} style={{ cursor: "pointer" }} />
              </div>
            </div>
          )}

          {/* Quote Card display */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "16px",
              background: "var(--card-bg)",
              padding: "32px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              minHeight: "180px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", background: "var(--input-bg)", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase", color: "var(--text-muted)" }}>
                {currentQuote.category}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: "italic", color: "var(--text-h)", lineHeight: 1.4, fontStyle: "italic" }}>
              &ldquo;{currentQuote.text}&rdquo;
            </p>

            <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", textAlign: "right" }}>
              — {currentQuote.author}
            </span>

            {/* Quote Action Panel */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                {activeTab === "advance" && (
                  <button className={`btn ${speaking ? "btn-primary" : "btn-secondary"}`} onClick={playQuoteSpeech} style={{ padding: "6px" }} title="Read quote aloud">
                    <Volume2 size={16} className={speaking ? "pulse-animate" : ""} />
                  </button>
                )}
                {(activeTab === "mid" || activeTab === "advance") && (
                  <>
                    <button className="btn btn-secondary" onClick={copyQuoteToClipboard} style={{ padding: "6px" }} title="Copy to clipboard"><Copy size={16} /></button>
                    <button className="btn btn-secondary" onClick={tweetQuote} style={{ padding: "6px" }} title="Share on Twitter"><span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>𝕏</span></button>
                  </>
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={activeTab === "basic" ? handleBasicNext : handleMidNext}
                disabled={isPlayingSlideshow}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={14} /> Next Quote
              </button>
            </div>

            {copied && (
              <div style={{ fontSize: "0.8rem", color: "var(--success)", textAlign: "center" }}>
                Copied quote details to clipboard!
              </div>
            )}
          </div>

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Web Speech Synthesis Engine</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Volume2 size={14} /> Native Speech API</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                The Advance tab utilizes the browser native Speech Synthesis API to read text out loud:
                <br />
                <code>window.speechSynthesis.speak(utterance)</code>.
                This runs completely client-side without network requests.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "block", color: "var(--text-h)" }}><Compass size={14} style={{ display: "inline", marginRight: "4px" }} /> slideshow intervals</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Enabling slideshow sets an interval cycle. When the timer expires, React updates states to refresh the active quote.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomQuoteGenerator;
