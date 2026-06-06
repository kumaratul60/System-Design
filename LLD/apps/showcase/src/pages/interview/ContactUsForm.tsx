import React, { useState, useEffect } from "react";
import { translate } from "@statelab/theme";
import { MessageSquare, AlertTriangle, CheckCircle, Info, Send, Trash2, Code} from "lucide-react";

interface SentMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  timestamp: string;
}

export const ContactUsForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Simple required fields) ---
  // ==========================================
  const [basicName, setBasicName] = useState("");
  const [basicEmail, setBasicEmail] = useState("");
  const [basicMsg, setBasicMsg] = useState("");
  const [basicSuccess, setBasicSuccess] = useState(false);

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicName.trim() || !basicEmail.trim() || !basicMsg.trim()) {
      alert("All fields are required!");
      return;
    }
    setBasicSuccess(true);
    setTimeout(() => {
      setBasicSuccess(false);
      setBasicName("");
      setBasicEmail("");
      setBasicMsg("");
    }, 2000);
  };

  // ==========================================
  // --- MID TAB (Messages list dashboard) ----
  // ==========================================
  const [midName, setMidName] = useState("");
  const [midEmail, setMidEmail] = useState("");
  const [midCategory, setMidCategory] = useState("support");
  const [midMsg, setMidMsg] = useState("");
  const [midSuccess, setMidSuccess] = useState(false);

  // Mapped list of sent messages stored in state
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([
    {
      id: "msg1",
      name: "Alice Dev",
      email: "alice@hashing.io",
      category: "sales",
      message: "Looking for pro consultation regarding virtual viewport sharding configs.",
      timestamp: "10:30 AM"},
  ]);

  const handleMidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate email pattern
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(midEmail)) {
      alert("Invalid email formatting pattern!");
      return;
    }

    const newMsg: SentMessage = {
      id: Math.random().toString(36).substring(2, 9),
      name: midName,
      email: midEmail,
      category: midCategory,
      message: midMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })};

    setSentMessages((prev) => [newMsg, ...prev]);
    setMidSuccess(true);
    
    // Clear inputs
    setMidName("");
    setMidEmail("");
    setMidMsg("");

    setTimeout(() => setMidSuccess(false), 2000);
  };

  const deleteMessage = (id: string) => {
    setSentMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // ==========================================
  // --- ADVANCE TAB (Captcha & SMTP fail mock)
  // ==========================================
  const [advName, setAdvName] = useState("");
  const [advEmail, setAdvEmail] = useState("");
  const [advMsg, setAdvMsg] = useState("");
  const [advFile, setAdvFile] = useState<File | null>(null);
  const [advCaptchaAnswer, setAdvCaptchaAnswer] = useState("");
  const [advCaptchaValue, setAdvCaptchaValue] = useState("");
  
  // SMTP Mock choice
  const [smtpStatus, setSmtpStatus] = useState<"success" | "rate_limit" | "server_error">("success");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [advSuccess, setAdvSuccess] = useState(false);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setAdvCaptchaValue(`${num1} + ${num2}`);
  };

  useEffect(() => {
    generateCaptcha();
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 2 Megabytes (2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit!");
        e.target.value = ""; // Clear input
        return;
      }
      setAdvFile(file);
    }
  };

  const handleAdvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setAdvSuccess(false);

    // Validate captcha
    const [num1, num2] = advCaptchaValue.split(" + ").map(Number);
    if (Number(advCaptchaAnswer) !== num1 + num2) {
      setSubmitError("Incorrect Captcha solver answer.");
      return;
    }

    // Evaluate SMTP mock response status
    if (smtpStatus === "server_error") {
      setSubmitError("500 Internal Mail SMTP Server Failure. Retry later.");
      return;
    }
    if (smtpStatus === "rate_limit") {
      setSubmitError("429 Too Many Requests. Rate limiter threshold breached.");
      return;
    }

    setAdvSuccess(true);
    setAdvName("");
    setAdvEmail("");
    setAdvMsg("");
    setAdvFile(null);
    setAdvCaptchaAnswer("");
    generateCaptcha();

    setTimeout(() => setAdvSuccess(false), 2500);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <MessageSquare className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Contact Form Architect</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/ContactUsForm.tsx`}
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
          Basic (Required Fields Validation)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("mid"); setMidSuccess(false); }}
        >
          Mid (Inbox Database Log)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setActiveTab("advance"); setSubmitError(null); setAdvSuccess(false); }}
        >
          Advance (File attachment & SMTP mocks)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Hand: Interactive Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC REQUIRED FIELDS */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4 style={{ marginBottom: "16px" }}>Linear Validation Form</h4>

              <form onSubmit={handleBasicSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>Name:</label>
                  <input type="text" value={basicName} onChange={(e) => setBasicName(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} placeholder="Atul..." required />
                </div>
                
                <div>
                  <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>Email:</label>
                  <input type="email" value={basicEmail} onChange={(e) => setBasicEmail(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} placeholder="atul@hashing.com" required />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>Message:</label>
                  <textarea value={basicMsg} onChange={(e) => setBasicMsg(e.target.value)} className="select-input" style={{ width: "100%", height: "80px", resize: "none", background: "var(--input-bg)" }} placeholder="Type comments..." required />
                </div>

                {basicSuccess && (
                  <div style={{ background: "rgba(22,163,74,0.1)", border: "1px solid var(--success)", padding: "10px", borderRadius: "6px", color: "var(--success)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={16} /> Form dispatch successfully mock registered.
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }}><Send size={14} /> Send Message</button>
              </form>
            </div>
          )}

          {/* TAB 2: MID INBOX LOG */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4 style={{ marginBottom: "16px" }}>Inbox Logger Submission Form</h4>

              <form onSubmit={handleMidSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Name:</label>
                    <input type="text" value={midName} onChange={(e) => setMidName(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Email:</label>
                    <input type="email" value={midEmail} onChange={(e) => setMidEmail(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} required />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Topic Category:</label>
                  <select value={midCategory} onChange={(e) => setMidCategory(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }}>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales & Quota pricing</option>
                    <option value="careers">Careers / Interview options</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Message Context:</label>
                  <textarea value={midMsg} onChange={(e) => setMidMsg(e.target.value)} className="select-input" style={{ width: "100%", height: "80px", resize: "none", background: "var(--input-bg)" }} required />
                </div>

                {midSuccess && (
                  <div style={{ background: "rgba(22,163,74,0.1)", border: "1px solid var(--success)", padding: "10px", borderRadius: "6px", color: "var(--success)", fontSize: "0.85rem" }}>
                    ✓ Message added to database.
                  </div>
                )}

                <button type="submit" className="btn btn-primary"><Send size={14} /> Log message</button>
              </form>

              {/* Inbox Display */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <h5 style={{ marginBottom: "12px" }}>Inbox Database Panel ({sentMessages.length} Messages)</h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {sentMessages.map((m) => (
                    <div key={m.id} style={{ border: "1px solid var(--border)", background: "var(--input-bg)", padding: "12px", borderRadius: "8px", position: "relative" }}>
                      <button onClick={() => deleteMessage(m.id)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "red", cursor: "pointer" }}><Trash2 size={14} /></button>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ color: "var(--text-h)", fontSize: "0.85rem" }}>{m.name}</strong>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>({m.email})</span>
                        <span style={{ fontSize: "0.65rem", background: "var(--primary)", color: "var(--bg)", padding: "1px 6px", borderRadius: "10px", textTransform: "uppercase" }}>{m.category}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text)" }}>{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ADVANCE MOCK SMTP FAIL */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px" }}>
              <h4 style={{ marginBottom: "16px" }}>Captcha and SMTP mock configurations</h4>

              <form onSubmit={handleAdvSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Name:</label>
                  <input type="text" value={advName} onChange={(e) => setAdvName(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} required />
                </div>
                
                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Email:</label>
                  <input type="email" value={advEmail} onChange={(e) => setAdvEmail(e.target.value)} className="select-input" style={{ width: "100%", background: "var(--input-bg)" }} required />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Message:</label>
                  <textarea value={advMsg} onChange={(e) => setAdvMsg(e.target.value)} className="select-input" style={{ width: "100%", height: "80px", resize: "none", background: "var(--input-bg)" }} required />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Attach File (Max 2MB):</label>
                  <input type="file" onChange={handleFileChange} className="select-input" style={{ width: "100%", background: "var(--input-bg)", padding: "6px" }} />
                  {advFile && <span style={{ fontSize: "0.7rem", color: "var(--success)", marginTop: "4px", display: "block" }}>✓ {advFile.name} ({(advFile.size / 1024 / 1024).toFixed(2)} MB)</span>}
                </div>

                {/* Math Captcha */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ background: "var(--input-bg)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.9rem", fontWeight: "bold" }}>
                    Solve: {advCaptchaValue}
                  </div>
                  <input type="number" placeholder="Answer..." value={advCaptchaAnswer} onChange={(e) => setAdvCaptchaAnswer(e.target.value)} className="select-input" style={{ flex: 1, background: "var(--input-bg)" }} required />
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid red", padding: "10px", borderRadius: "6px", color: "red", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={14} /> {submitError}
                  </div>
                )}

                {/* Success Banner */}
                {advSuccess && (
                  <div style={{ background: "rgba(22, 163, 74, 0.1)", border: "1px solid var(--success)", padding: "10px", borderRadius: "6px", color: "var(--success)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={14} /> Message compiled and dispatched successfully (Mock SMTP Success).
                  </div>
                )}

                <button type="submit" className="btn btn-primary"><Send size={14} /> Submit Secured Form</button>
              </form>
            </div>
          )}

        </div>

        {/* Right Info Details */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Developer SMTP Mock Dashboard</h4>
          
          {activeTab === "advance" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block" }}>Select simulated SMTP gateway status:</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ padding: "8px", border: smtpStatus === "success" ? "2px solid var(--success)" : "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", background: "var(--input-bg)", fontSize: "0.8rem", display: "block" }}>
                  <input type="radio" name="smtpStatus" value="success" checked={smtpStatus === "success"} onChange={(e) => setSmtpStatus(e.target.value as any)} style={{ marginRight: "6px" }} />
                  200 Success Delivery
                </label>
                <label style={{ padding: "8px", border: smtpStatus === "rate_limit" ? "2px solid #f59e0b" : "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", background: "var(--input-bg)", fontSize: "0.8rem", display: "block" }}>
                  <input type="radio" name="smtpStatus" value="rate_limit" checked={smtpStatus === "rate_limit"} onChange={(e) => setSmtpStatus(e.target.value as any)} style={{ marginRight: "6px" }} />
                  429 Mock Rate Limiting error
                </label>
                <label style={{ padding: "8px", border: smtpStatus === "server_error" ? "2px solid red" : "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", background: "var(--input-bg)", fontSize: "0.8rem", display: "block" }}>
                  <input type="radio" name="smtpStatus" value="server_error" checked={smtpStatus === "server_error"} onChange={(e) => setSmtpStatus(e.target.value as any)} style={{ marginRight: "6px" }} />
                  500 Mock Server Error
                </label>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <div>
                <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><Info size={14} /> Validator pattern</strong>
                <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                  Email syntax checks leverage standard RFC regex matches:
                  <br />
                  <code>/^[^\s@]+@[^\s@]+\.[^\s@]+$/</code>.
                  This rejects spaces and invalid domains.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUsForm;
