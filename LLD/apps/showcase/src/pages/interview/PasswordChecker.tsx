import React, { useState, useCallback } from "react";
import { translate } from "@statelab/theme";
import { ShieldCheck, Copy, Check, Eye, EyeOff, RotateCcw, AlertTriangle, Code} from "lucide-react";

interface PasswordCriteria {
  label: string;
  test: (pw: string) => boolean;
}

const CRITERIA: PasswordCriteria[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "At least 1 uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "At least 1 lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "At least 1 digit (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { label: "At least 1 special symbol (!@#$%^&*)", test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

// --- Data/Logic Hook Layer ---
export function usePasswordChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generator settings
  const [genLength, setGenLength] = useState(12);
  const [genUpper, setGenUpper] = useState(true);
  const [genLower, setGenLower] = useState(true);
  const [genDigits, setGenDigits] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);

  // Check results
  const metCriteriaCount = CRITERIA.filter((c) => c.test(password)).length;

  // Calculate Shannon entropy estimation (in bits)
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) poolSize += 32;

  const entropy = password.length > 0 && poolSize > 0 
    ? Math.round(password.length * Math.log2(poolSize))
    : 0;

  const getStrengthTier = () => {
    if (!password) return { label: "Empty", color: "var(--text-muted)", progress: 0 };
    if (metCriteriaCount <= 2) return { label: "Weak & Risky", color: "var(--danger)", progress: 25 };
    if (metCriteriaCount <= 4) return { label: "Medium Security", color: "var(--warning)", progress: 60 };
    if (entropy < 60) return { label: "Strong (Low Entropy)", color: "#10b981", progress: 80 };
    return { label: "Ultra Secure", color: "#047857", progress: 100 };
  };

  const generatePassword = useCallback(() => {
    let charset = "";
    if (genUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (genLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (genDigits) charset += "0123456789";
    if (genSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      setPassword("Error: Select charset");
      return;
    }

    let generated = "";
    const bytes = new Uint32Array(genLength);
    window.crypto.getRandomValues(bytes);

    for (let i = 0; i < genLength; i++) {
      generated += charset[bytes[i] % charset.length];
    }

    setPassword(generated);
    setCopied(false);
  }, [genLength, genUpper, genLower, genDigits, genSymbols]);

  const copyToClipboard = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [password]);

  return {
    password,
    setPassword,
    showPassword,
    setShowPassword,
    copied,
    metCriteriaCount,
    entropy,
    genLength,
    setGenLength,
    genUpper,
    setGenUpper,
    genLower,
    setGenLower,
    genDigits,
    setGenDigits,
    genSymbols,
    setGenSymbols,
    strength: getStrengthTier(),
    generatePassword,
    copyToClipboard};
}

// --- UI Presentation Component ---
export const PasswordChecker: React.FC = () => {
  const {
    password,
    setPassword,
    showPassword,
    setShowPassword,
    copied,
    entropy,
    genLength,
    setGenLength,
    genUpper,
    setGenUpper,
    genLower,
    setGenLower,
    genDigits,
    setGenDigits,
    genSymbols,
    setGenSymbols,
    strength,
    generatePassword,
    copyToClipboard} = usePasswordChecker();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <ShieldCheck className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Password Auditor & Generator</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/PasswordChecker.tsx`}
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

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "start" }}>
        
        {/* Auditor Pane */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"}}
        >
          <h4>Entropy Auditor</h4>

          {/* Password Input Display */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter audit password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              style={{ width: "100%", paddingRight: "80px", fontSize: "1.05rem" }}
            />
            <div style={{ position: "absolute", right: "12px", top: "12px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                onClick={copyToClipboard}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: password ? "var(--primary)" : "var(--text-muted)" }}
                disabled={!password}
                title="Copy to clipboard"
              >
                {copied ? <Check size={18} style={{ color: "var(--success)" }} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Strength Tier and Progress Indicator */}
          {password && (
            <div style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Audit Rating</span>
                <strong style={{ color: strength.color, fontSize: "1rem" }}>{strength.label}</strong>
              </div>
              <div style={{ height: "6px", width: "100%", background: "var(--border)", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ height: "100%", width: `${strength.progress}%`, background: strength.color, transition: "width 0.3s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span>Shannon Entropy: <strong>{entropy} bits</strong></span>
                <span>{entropy >= 60 ? "Secure against bruteforce" : "Vulnerable to cracking"}</span>
              </div>
            </div>
          )}

          {/* Rule criteria check items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CRITERIA.map((crit, idx) => {
              const pass = crit.test(password);
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `2px solid ${pass ? "var(--success)" : "var(--border)"}`,
                      background: pass ? "rgba(34, 197, 94, 0.15)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"}}
                  >
                    {pass && <Check size={12} style={{ color: "var(--success)", strokeWidth: 3 }} />}
                  </div>
                  <span style={{ fontSize: "0.9rem", color: pass ? "var(--text)" : "var(--text-muted)", transition: "color 0.2s" }}>
                    {crit.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generator Pane */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"}}
        >
          <h4>Generator Panel</h4>

          {/* Length Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Character Length</span>
              <strong style={{ color: "var(--text-h)" }}>{genLength}</strong>
            </div>
            <input
              type="range"
              min="6"
              max="32"
              value={genLength}
              onChange={(e) => setGenLength(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          {/* Option Checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={genUpper}
                onChange={(e) => setGenUpper(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              <span style={{ fontSize: "0.9rem" }}>Include Uppercase Letters (A-Z)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={genLower}
                onChange={(e) => setGenLower(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              <span style={{ fontSize: "0.9rem" }}>Include Lowercase Letters (a-z)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={genDigits}
                onChange={(e) => setGenDigits(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              <span style={{ fontSize: "0.9rem" }}>Include Digits (0-9)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={genSymbols}
                onChange={(e) => setGenSymbols(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              <span style={{ fontSize: "0.9rem" }}>Include Symbols (!@#$%^&*)</span>
            </label>
          </div>

          {/* Action Trigger */}
          <button
            onClick={generatePassword}
            className="btn btn-primary"
            style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "10px" }}
          >
            <RotateCcw size={16} /> Generate Safe Password
          </button>

          {!genUpper && !genLower && !genDigits && !genSymbols && (
            <div style={{ display: "flex", gap: "6px", color: "var(--danger)", fontSize: "0.8rem", alignItems: "center" }}>
              <AlertTriangle size={14} />
              <span>Warning: Must select at least one character library.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PasswordChecker;
