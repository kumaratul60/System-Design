import React, { useState, useEffect } from "react";
import { MessageSquare, AlertCircle, Save, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";

export const MultistepForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Simple Next/Prev screens) -
  // ==========================================
  const [basicStep, setBasicStep] = useState(1);
  const [basicData, setBasicData] = useState({ name: "", email: "", role: "" });

  const handleBasicNext = () => setBasicStep((s) => s + 1);
  const handleBasicPrev = () => setBasicStep((s) => s - 1);

  // ==========================================
  // --- MID TAB (Input validations + localDraft)
  // ==========================================
  const [midStep, setMidStep] = useState(1);
  const [midData, setMidData] = useState(() => {
    try {
      const saved = localStorage.getItem("lld_mid_form_draft");
      return saved ? JSON.parse(saved) : { username: "", password: "", newsletter: false };
    } catch {
      return { username: "", password: "", newsletter: false };
    }
  });
  const [midErrors, setMidErrors] = useState<{ [key: string]: string }>({});

  // Auto-save draft on data changes
  useEffect(() => {
    if (activeTab === "mid") {
      localStorage.setItem("lld_mid_form_draft", JSON.stringify(midData));
    }
  }, [midData, activeTab]);

  const validateMidStep = () => {
    const errs: { [key: string]: string } = {};
    if (midStep === 1) {
      if (!midData.username.trim()) errs.username = "Username is required.";
      else if (midData.username.length < 3) errs.username = "Username must be at least 3 characters.";
    }
    if (midStep === 2) {
      if (!midData.password) errs.password = "Password is required.";
      else if (midData.password.length < 6) errs.password = "Password must be at least 6 characters.";
    }
    setMidErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleMidNext = () => {
    if (validateMidStep()) {
      setMidStep((s) => s + 1);
    }
  };

  const clearMidDraft = () => {
    localStorage.removeItem("lld_mid_form_draft");
    setMidData({ username: "", password: "", newsletter: false });
    setMidStep(1);
    setMidErrors({});
  };

  // Warn on tab closing if there are unsaved inputs (Only simulated since we can't block easily in sandbox without standard alerts)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (midData.username || midData.password) {
        e.preventDefault();
        e.returnValue = "You have unsaved form draft entries.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [midData]);

  // ==========================================
  // --- ADVANCE TAB (Conditional Branching) --
  // ==========================================
  const [advStep, setAdvStep] = useState(1);
  const [advData, setAdvData] = useState({
    profileType: "developer", // "developer" or "manager"
    languageChoice: "typescript",
    projectCount: 0,
    teamSize: 0,
  });

  const getAdvStepsList = () => {
    // Conditional Branching Steps list mapping
    if (advData.profileType === "developer") {
      return ["Start profile", "Programming options", "Review developer"];
    } else {
      return ["Start profile", "Management options", "Review manager"];
    }
  };

  const handleAdvNext = () => setAdvStep((s) => s + 1);
  const handleAdvPrev = () => setAdvStep((s) => s - 1);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <MessageSquare className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Multi-step Form Sandbox</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Next/Prev Navigation)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Validation & Drafts Cache)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Conditional Branching)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Form Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4 style={{ marginBottom: "16px" }}>Linear Multi-step Wizard (Step {basicStep}/3)</h4>

              {/* Form Screens */}
              <div style={{ minHeight: "150px", marginBottom: "16px" }}>
                {basicStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Candidate Name:</label>
                    <input type="text" value={basicData.name} onChange={(e) => setBasicData({ ...basicData, name: e.target.value })} className="select-input" style={{ background: "var(--input-bg)" }} placeholder="Atul Kumar..." />
                  </div>
                )}
                {basicStep === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Candidate Email:</label>
                    <input type="email" value={basicData.email} onChange={(e) => setBasicData({ ...basicData, email: e.target.value })} className="select-input" style={{ background: "var(--input-bg)" }} placeholder="atul@example.com" />
                  </div>
                )}
                {basicStep === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Candidate Role Option:</label>
                    <select value={basicData.role} onChange={(e) => setBasicData({ ...basicData, role: e.target.value })} className="select-input" style={{ background: "var(--input-bg)" }}>
                      <option value="">Select Role...</option>
                      <option value="frontend">Frontend Architect</option>
                      <option value="backend">Backend Architect</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={handleBasicPrev} disabled={basicStep === 1}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={handleBasicNext} disabled={basicStep === 3}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MID WITH VALIDATIONS */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4 style={{ marginBottom: "16px" }}>Input Validation Wizard (Step {midStep}/3)</h4>

              <div style={{ minHeight: "150px", marginBottom: "16px" }}>
                {midStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Choose Username:</label>
                    <input type="text" value={midData.username} onChange={(e) => setMidData({ ...midData, username: e.target.value })} className="select-input" style={{ background: "var(--input-bg)", border: midErrors.username ? "1px solid red" : "1px solid var(--border)" }} />
                    {midErrors.username && <span style={{ color: "red", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} /> {midErrors.username}</span>}
                  </div>
                )}
                {midStep === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Set Password:</label>
                    <input type="password" value={midData.password} onChange={(e) => setMidData({ ...midData, password: e.target.value })} className="select-input" style={{ background: "var(--input-bg)", border: midErrors.password ? "1px solid red" : "1px solid var(--border)" }} />
                    {midErrors.password && <span style={{ color: "red", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} /> {midErrors.password}</span>}
                  </div>
                )}
                {midStep === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <strong style={{ color: "var(--text-h)" }}>Confirm credentials:</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div>Username: {midData.username}</div>
                      <div>Password Length: {midData.password.length} chars</div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input type="checkbox" checked={midData.newsletter} onChange={(e) => setMidData({ ...midData, newsletter: e.target.checked })} />
                      Subscribe to laboratory newsletters
                    </label>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={() => setMidStep((s) => s - 1)} disabled={midStep === 1}>
                  <ArrowLeft size={16} /> Back
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-secondary" onClick={clearMidDraft}>Clear Draft</button>
                  {midStep === 3 ? (
                    <button className="btn btn-primary" onClick={() => { alert("Draft submitted! Staging database sync completed."); clearMidDraft(); }} style={{ background: "var(--success)", border: "none" }}>Submit Draft</button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleMidNext}>
                      Next <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE CONDITIONAL BRANCHING */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4 style={{ marginBottom: "16px" }}>Dynamic Branching Wizard (Step {advStep}/3)</h4>

              {/* Stepper tracker showing conditional step labels */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                {getAdvStepsList().map((label, idx) => (
                  <span
                    key={label}
                    style={{
                      fontSize: "0.72rem",
                      background: advStep === idx + 1 ? "var(--primary)" : "var(--input-bg)",
                      color: advStep === idx + 1 ? "var(--bg)" : "var(--text-muted)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div style={{ minHeight: "150px", marginBottom: "16px" }}>
                {advStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Select Profile Pathway:</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <label style={{ flex: 1, padding: "12px", border: advData.profileType === "developer" ? "2px solid var(--primary)" : "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", background: "var(--input-bg)" }}>
                        <input type="radio" name="profileType" value="developer" checked={advData.profileType === "developer"} onChange={(e) => setAdvData({ ...advData, profileType: e.target.value })} style={{ marginRight: "6px" }} />
                        Developer track
                      </label>
                      <label style={{ flex: 1, padding: "12px", border: advData.profileType === "manager" ? "2px solid var(--primary)" : "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", background: "var(--input-bg)" }}>
                        <input type="radio" name="profileType" value="manager" checked={advData.profileType === "manager"} onChange={(e) => setAdvData({ ...advData, profileType: e.target.value })} style={{ marginRight: "6px" }} />
                        Manager track
                      </label>
                    </div>
                  </div>
                )}

                {/* Conditional Branch Screen 2 */}
                {advStep === 2 && advData.profileType === "developer" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Preferred Language:</label>
                    <select value={advData.languageChoice} onChange={(e) => setAdvData({ ...advData, languageChoice: e.target.value })} className="select-input" style={{ background: "var(--input-bg)" }}>
                      <option value="typescript">TypeScript</option>
                      <option value="golang">Go (Golang)</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>
                )}

                {advStep === 2 && advData.profileType === "manager" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "0.8rem" }}>Estimated Team Size Managed:</label>
                    <input type="number" min="1" value={advData.teamSize} onChange={(e) => setAdvData({ ...advData, teamSize: Math.max(1, Number(e.target.value)) })} className="select-input" style={{ background: "var(--input-bg)" }} />
                  </div>
                )}

                {/* Conditional Review Screen 3 */}
                {advStep === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <strong style={{ color: "var(--text-h)" }}>Verification Page:</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Selected Track: {advData.profileType.toUpperCase()}
                      {advData.profileType === "developer" ? (
                        <div>Preferred Stack: {advData.languageChoice}</div>
                      ) : (
                        <div>Managed Team Count: {advData.teamSize} members</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={handleAdvPrev} disabled={advStep === 1}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={handleAdvNext} disabled={advStep === 3}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Architecture & State Rules</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Save size={14} /> Autosave Drafts Hook</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Inputs write to local storage on changes. When the page reloads, states initialize from storage, preventing dataloss.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "block", color: "var(--text-h)" }}><HelpCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> Branching Logic</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                By checking step state branches dynamically:
                <br />
                <code>steps = getAdvStepsList()</code>.
                The UI adapts the label array and screen layouts dynamically.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultistepForm;
