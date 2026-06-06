import React, { useState } from "react";
import { translate } from "@statelab/theme";
import { Shield, Info, RefreshCw, Eye, Code} from "lucide-react";

// Cookie details structure
interface CookieAudit {
  name: string;
  category: "Essential" | "Analytics" | "Marketing";
  domain: string;
  expires: string;
  purpose: string;
}

const COOKIE_AUDIT_DATA: CookieAudit[] = [
  { name: "lld_session_token", category: "Essential", domain: "systemdesign.lab", expires: "End of Session", purpose: "Maintains authenticated developer state." },
  { name: "lld_theme", category: "Essential", domain: "systemdesign.lab", expires: "1 Year", purpose: "Remembers light/dark visual theme choice." },
  { name: "_ga", category: "Analytics", domain: "google-analytics.com", expires: "2 Years", purpose: "Google Analytics identifier tracking usage sessions." },
  { name: "_gid", category: "Analytics", domain: "google-analytics.com", expires: "24 Hours", purpose: "Aggregates unique site hit counts." },
  { name: "fbp", category: "Marketing", domain: "facebook.com", expires: "3 Months", purpose: "Facebook tracking pixel for targeting developer resources." },
  { name: "ads_opt_out", category: "Marketing", domain: "doubleclick.net", expires: "10 Years", purpose: "Maintains ad personalization opt-out preferences." },
];

export const CookieConsent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Cookie preference state
  const [preferences, setPreferences] = useState<{
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string | null;
  }>(() => {
    try {
      const saved = localStorage.getItem("lld_cookie_consent");
      return saved ? JSON.parse(saved) : { essential: true, analytics: false, marketing: false, timestamp: null };
    } catch {
      return { essential: true, analytics: false, marketing: false, timestamp: null };
    }
  });

  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem("lld_cookie_consent") === null;
  });

  // Basic options
  const handleAcceptAll = () => {
    const consent = { essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    setPreferences(consent);
    localStorage.setItem("lld_cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consent = { essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    setPreferences(consent);
    localStorage.setItem("lld_cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  // Mid options
  const [midAnalytics, setMidAnalytics] = useState(preferences.analytics);
  const [midMarketing, setMidMarketing] = useState(preferences.marketing);

  const handleSaveMidSettings = () => {
    const consent = { essential: true, analytics: midAnalytics, marketing: midMarketing, timestamp: new Date().toISOString() };
    setPreferences(consent);
    localStorage.setItem("lld_cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  // Reset cookie consent for testing
  const resetConsent = () => {
    localStorage.removeItem("lld_cookie_consent");
    setPreferences({ essential: true, analytics: false, marketing: false, timestamp: null });
    setShowBanner(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Shield className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Cookie Consent Management</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/CookieConsent.tsx`}
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
          Basic (Bottom Alert Notice)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setMidAnalytics(preferences.analytics); setMidMarketing(preferences.marketing); }}
        >
          Mid (Granular Setting Categories)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Full Audit Logs & Watcher)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Hand Board */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* TAB 1: BASIC BANNER PREVIEW */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4>Basic Banner Simulator</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
                Click reset consent and scroll/refresh to trigger the floating alert banner.
              </p>

              <button className="btn btn-secondary" onClick={resetConsent}>
                Reset Cookie Settings
              </button>

              {/* Simulated Float Banner */}
              {showBanner && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px 20px",
                    background: "var(--input-bg)",
                    border: "2px solid var(--primary)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"}}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <Shield size={22} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong style={{ color: "var(--text-h)" }}>We Value Your Cookie Privacy</strong>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Our engineering lab uses analytical and marketing cookies to gather telemetry metrics and personalize code templates. Rejecting marketing disables custom code widgets.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={handleRejectAll} style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                      Reject All
                    </button>
                    <button className="btn btn-primary" onClick={handleAcceptAll} style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                      Accept All Cookies
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MID CATEGORIES ACCORDION */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Cookie Preference Settings</h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* 1. Essential */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                  <div>
                    <strong style={{ color: "var(--text-h)", display: "flex", alignItems: "center", gap: "6px" }}>
                      Essential Core Cookies <span style={{ fontSize: "0.7rem", background: "var(--primary)", padding: "1px 6px", borderRadius: "10px", color: "var(--bg)" }}>Required</span>
                    </strong>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Mandatory variables that remember user theme choices and authentication sessions. Cannot be turned off.
                    </p>
                  </div>
                  <input type="checkbox" checked disabled style={{ cursor: "not-allowed", transform: "scale(1.2)" }} />
                </div>

                {/* 2. Analytics */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                  <div>
                    <strong style={{ color: "var(--text-h)" }}>Performance & Analytics Cookies</strong>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Simulates metric trackers such as Google Analytics to monitor traffic pathways and feature loads.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={midAnalytics}
                    onChange={(e) => setMidAnalytics(e.target.checked)}
                    style={{ cursor: "pointer", transform: "scale(1.2)" }}
                  />
                </div>

                {/* 3. Marketing */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <strong style={{ color: "var(--text-h)" }}>Targeting & Marketing Cookies</strong>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Maps advertisements and tracking pixels (Facebook Pixel) to suggest relevant system design modules.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={midMarketing}
                    onChange={(e) => setMidMarketing(e.target.checked)}
                    style={{ cursor: "pointer", transform: "scale(1.2)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <button className="btn btn-secondary" onClick={() => { setMidAnalytics(false); setMidMarketing(false); }}>Reset Toggles</button>
                <button className="btn btn-primary" onClick={handleSaveMidSettings}>Save Choices</button>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE COOKIE AUDIT GRID */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Granular Cookies Audit Table</h4>
              
              <div style={{ overflowX: "auto" }}>
                <table className="architecture-table" style={{ fontSize: "0.8rem" }}>
                  <thead>
                    <tr>
                      <th>Cookie Name</th>
                      <th>Category</th>
                      <th>Expiration</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_AUDIT_DATA.map((cookie) => {
                      const isActive =
                        cookie.category === "Essential" ||
                        (cookie.category === "Analytics" && preferences.analytics) ||
                        (cookie.category === "Marketing" && preferences.marketing);

                      return (
                        <tr key={cookie.name} style={{ opacity: isActive ? 1 : 0.45 }}>
                          <td>
                            <strong>{cookie.name}</strong>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.75rem", background: "var(--input-bg)", padding: "2px 6px", borderRadius: "10px" }}>
                              {cookie.category}
                            </span>
                          </td>
                          <td>{cookie.expires}</td>
                          <td>{cookie.purpose}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Panel & Watcher */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Consent Telemetry Logger</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Token Timestamp:</span> {preferences.timestamp ? preferences.timestamp : "NULL (No preference set)"}
            </div>
            
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "10px", paddingTop: "12px" }}>
              <h5 style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}><Eye size={14} /> State Watcher (Raw JSON Token)</h5>
              <pre style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "6px", color: "var(--text-h)", overflowX: "auto", fontSize: "0.75rem" }}>
                {JSON.stringify(preferences, null, 2)}
              </pre>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "10px", paddingTop: "12px" }}>
              <h5 style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}><Info size={14} /> Audit Telemetry</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-muted)" }}>
                <div>Essential Variables: <span style={{ color: "var(--success)" }}>ENABLED</span></div>
                <div>Analytical Trackers: <span style={{ color: preferences.analytics ? "var(--success)" : "red" }}>{preferences.analytics ? "ACTIVE" : "OPTED-OUT"}</span></div>
                <div>Marketing Pixels: <span style={{ color: preferences.marketing ? "var(--success)" : "red" }}>{preferences.marketing ? "ACTIVE" : "OPTED-OUT"}</span></div>
              </div>
            </div>

            <button
              onClick={resetConsent}
              className="btn btn-secondary"
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"}}
            >
              <RefreshCw size={14} /> Withdraw Consent Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
