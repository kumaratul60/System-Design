import React, { useState, useEffect } from "react";
import { User, Share2, Clipboard, Grid, Compass, ArrowDown, ArrowUp } from "lucide-react";

interface ProfileSection {
  id: string;
  name: string;
}

export const ProfileCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Follow State (Shared)
  const [isFollowing, setIsFollowing] = useState(false);

  // ==========================================
  // --- MID TAB (Stats counter & Copy Link) --
  // ==========================================
  const [copied, setCopied] = useState(false);
  const [likes] = useState(1420);
  const [followers, setFollowers] = useState(890);
  
  const handleFollowToggle = () => {
    setIsFollowing((f) => {
      const next = !f;
      setFollowers((prev) => (next ? prev + 1 : prev - 1));
      return next;
    });
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText("https://systemdesign.lab/developer/atul");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Animated counters on load
  const [displayLikes, setDisplayLikes] = useState(0);
  const [displayFollowers, setDisplayFollowers] = useState(0);

  useEffect(() => {
    if (activeTab !== "mid") return;
    
    // Animate likes
    const likesInterval = setInterval(() => {
      setDisplayLikes((prev) => {
        if (prev >= likes) {
          clearInterval(likesInterval);
          return likes;
        }
        return prev + Math.ceil((likes - prev) / 8);
      });
    }, 30);

    // Animate followers
    const followersInterval = setInterval(() => {
      setDisplayFollowers((prev) => {
        if (prev >= followers) {
          clearInterval(followersInterval);
          return followers;
        }
        return prev + Math.ceil((followers - prev) / 8);
      });
    }, 30);

    return () => {
      clearInterval(likesInterval);
      clearInterval(followersInterval);
    };
  }, [likes, followers, activeTab]);

  // ==========================================
  // --- ADVANCE TAB (Layout customization) ---
  // ==========================================
  const [bgColor, setBgColor] = useState("#27272a");
  const [sections, setSections] = useState<ProfileSection[]>([
    { id: "avatar", name: "Avatar Image & Title" },
    { id: "stats", name: "Social Statistics Counter" },
    { id: "bio", name: "Biographical Description" },
    { id: "actions", name: "Action Call Buttons" },
  ]);

  const moveSection = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setSections(updated);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <User className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Profile Card</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Static Layout)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setDisplayFollowers(0); setDisplayLikes(0); }}
        >
          Mid (Stat Count Tickers & Share)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Layout Section Re-order)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Card Container */}
        <div style={{ display: "flex", justifyContent: "center" }}>

          {/* TAB 1: BASIC CARD */}
          {activeTab === "basic" && (
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                width: "320px",
                overflow: "hidden",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
              }}
            >
              {/* Cover header */}
              <div style={{ height: "80px", background: "var(--primary)" }} />
              
              {/* Content */}
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "4px solid var(--card-bg)",
                    background: "var(--border)",
                    marginTop: "-64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-h)",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  AK
                </div>

                <h4 style={{ marginTop: "12px", marginBottom: "4px" }}>Atul Kumar</h4>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>System Architect</span>
                <p style={{ fontSize: "0.85rem", color: "var(--text)", textAlign: "center", margin: "0 0 16px 0", lineHeight: 1.4 }}>
                  Building low-latency distributed state models and reactive system design components.
                </p>

                <button
                  className={`btn ${isFollowing ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                  style={{ width: "100%" }}
                >
                  {isFollowing ? "Following" : "Follow Candidate"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MID CARD */}
          {activeTab === "mid" && (
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                width: "320px",
                overflow: "hidden",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
              }}
            >
              {/* Cover header */}
              <div style={{ height: "80px", background: "var(--primary)", display: "flex", justifyContent: "flex-end", padding: "10px" }}>
                <button
                  onClick={copyProfileLink}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                  title="Share profile link"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "4px solid var(--card-bg)",
                    background: "var(--border)",
                    marginTop: "-64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-h)",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  AK
                </div>

                <h4 style={{ marginTop: "12px", marginBottom: "4px" }}>Atul Kumar</h4>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>System Architect</span>

                {/* Stats grid */}
                <div style={{ display: "flex", width: "100%", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "12px 0", marginBottom: "16px", justifyContent: "space-around" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <strong style={{ color: "var(--text-h)", fontSize: "1.1rem" }}>{displayFollowers}</strong>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Followers</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <strong style={{ color: "var(--text-h)", fontSize: "1.1rem" }}>{displayLikes}</strong>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Likes</span>
                  </div>
                </div>

                <button
                  className={`btn ${isFollowing ? "btn-secondary" : "btn-primary"}`}
                  onClick={handleFollowToggle}
                  style={{ width: "100%" }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                {copied && (
                  <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clipboard size={12} /> URL copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE RE-ORDER CARD */}
          {activeTab === "advance" && (
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                width: "320px",
                overflow: "hidden",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
              }}
            >
              {/* Header */}
              <div style={{ height: "80px", background: bgColor, transition: "background-color 0.3s ease" }} />

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                {sections.map((section) => {
                  if (section.id === "avatar") {
                    return (
                      <div key={section.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                        <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-h)", fontSize: "1.5rem", fontWeight: "bold", marginTop: "-54px", border: "4px solid var(--card-bg)" }}>AK</div>
                        <h4 style={{ marginTop: "8px", marginBottom: "2px" }}>Atul Kumar</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Developer Custom Mode</span>
                      </div>
                    );
                  }
                  if (section.id === "stats") {
                    return (
                      <div key={section.id} style={{ display: "flex", width: "100%", background: "var(--input-bg)", padding: "10px", borderRadius: "8px", justifyContent: "space-around" }}>
                        <div style={{ textAlign: "center" }}><strong style={{ color: "var(--text-h)" }}>{followers}</strong><div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Followers</div></div>
                        <div style={{ textAlign: "center" }}><strong style={{ color: "var(--text-h)" }}>{likes}</strong><div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Likes</div></div>
                      </div>
                    );
                  }
                  if (section.id === "bio") {
                    return (
                      <p key={section.id} style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
                        Custom layout drag & drop re-order structure simulator interface.
                      </p>
                    );
                  }
                  if (section.id === "actions") {
                    return (
                      <button key={section.id} className="btn btn-primary" onClick={handleFollowToggle} style={{ width: "100%" }}>
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Customizer panel</h4>

          {activeTab === "advance" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Header color picker */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Card header theme color:</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["#27272a", "#3b82f6", "#10b981", "#ef4444", "#f59e0b"].map((c) => (
                    <div
                      key={c}
                      onClick={() => setBgColor(c)}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: c,
                        cursor: "pointer",
                        border: bgColor === c ? "2px solid var(--text-h)" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Drag/Re-order controls */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "8px" }}><Grid size={14} style={{ display: "inline", marginRight: "4px" }} /> Section Layout Order:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {sections.map((sec, idx) => (
                    <div key={sec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--input-bg)", padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem" }}>
                      <span>{sec.name}</span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => moveSection(idx, "up")} disabled={idx === 0} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}><ArrowUp size={14} /></button>
                        <button onClick={() => moveSection(idx, "down")} disabled={idx === sections.length - 1} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}><ArrowDown size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <div>
                <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Compass size={14} /> Count Ticker Physics</strong>
                <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                  Instead of displaying figures instantly, the Mid card updates counters progressively using simple physics divisions:
                  <br />
                  <code>prev + Math.ceil((target - prev) / 8)</code>.
                  This ensures a smooth deceleration effect.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
