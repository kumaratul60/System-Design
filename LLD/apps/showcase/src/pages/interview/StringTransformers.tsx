import React, { useState, useEffect } from "react";
import { translate } from "@statelab/theme";
import { Type, Copy, CheckCircle, Code} from "lucide-react";

export const StringTransformers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  const [inputText, setInputText] = useState("Hello World from Antigravity Lab!");
  
  // Custom Regex Find-and-Replace states (Advance)
  const [regexFind, setRegexFind] = useState("");
  const [regexReplace, setRegexReplace] = useState("");
  const [regexResult, setRegexResult] = useState("");

  // Copy tracking states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulated SHA-256 Hash State (Advance)
  const [shaHash, setShaHash] = useState("");

  const triggerCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ----------------------------------------------------
  // --- TRANSFORMATION HELPERS -------------------------
  // ----------------------------------------------------
  const toCamelCase = (str: string): string => {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  const toPascalCase = (str: string): string => {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, "");
  };

  const toSnakeCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "_");
  };

  // Base64 helper
  const toBase64 = (str: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return "Base64 Error";
    }
  };

  const fromBase64 = (str: string): string => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return "Base64 Decoding Error";
    }
  };

  // real-time character / word counts
  const getStats = () => {
    const chars = inputText.length;
    const words = inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length;
    const lines = inputText.split("\n").length;
    return { chars, words, lines };
  };

  // Regex replacer trigger
  useEffect(() => {
    if (!regexFind) {
      setRegexResult(inputText);
      return;
    }
    try {
      const rx = new RegExp(regexFind, "g");
      setRegexResult(inputText.replace(rx, regexReplace));
    } catch {
      setRegexResult("Invalid Regular Expression Pattern");
    }
  }, [inputText, regexFind, regexReplace]);

  // Real-time SHA-256 calculator (using Web Crypto Subtle API)
  useEffect(() => {
    if (activeTab !== "advance" || !inputText) {
      setShaHash("");
      return;
    }

    const computeHash = async () => {
      try {
        const msgBuffer = new TextEncoder().encode(inputText);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setShaHash(hashHex);
      } catch {
        setShaHash("Cryptography Error");
      }
    };

    computeHash();
  }, [inputText, activeTab]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Type className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>String Case Transformers</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/StringTransformers.tsx`}
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
          Basic (Casing Formats)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (URL & Base64 Encoders)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Regex & SHA-256)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: String input & outputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Main textarea input */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "8px" }}>Source String Input:</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="select-input"
              style={{ width: "100%", height: "80px", background: "var(--input-bg)", resize: "vertical", fontSize: "1rem" }}
              placeholder="Type or paste sentences..."
            />
          </div>

          {/* Transformation Output Panels */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* TAB 1: BASIC CASINGS */}
            {activeTab === "basic" && (
              <>
                <h4 style={{ marginBottom: "6px" }}>Standard Cases</h4>
                
                {[
                  { label: "Lower Case", val: inputText.toLowerCase(), key: "lower" },
                  { label: "Upper Case", val: inputText.toUpperCase(), key: "upper" },
                  { label: "Camel Case", val: toCamelCase(inputText), key: "camel" },
                  { label: "Pascal Case", val: toPascalCase(inputText), key: "pascal" },
                  { label: "Snake Case", val: toSnakeCase(inputText), key: "snake" },
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold" }}>{item.label}:</span>
                      <button
                        onClick={() => triggerCopy(item.val, item.key)}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                      >
                        {copiedKey === item.key ? <CheckCircle size={12} /> : <Copy size={12} />}
                        {copiedKey === item.key ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre style={{ background: "var(--input-bg)", padding: "8px 12px", borderRadius: "6px", margin: 0, fontSize: "0.85rem", color: "var(--text-h)", overflowX: "auto" }}>
                      {item.val || "—"}
                    </pre>
                  </div>
                ))}
              </>
            )}

            {/* TAB 2: MID URL/BASE64 */}
            {activeTab === "mid" && (
              <>
                <h4 style={{ marginBottom: "6px" }}>URL & Base64 Endpoints</h4>
                
                {[
                  { label: "URL Encoded", val: encodeURIComponent(inputText), key: "url_enc" },
                  { label: "Base64 Encoded", val: toBase64(inputText), key: "b64_enc" },
                  { label: "Base64 Decoded (Input is decoded)", val: fromBase64(inputText), key: "b64_dec" },
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold" }}>{item.label}:</span>
                      <button
                        onClick={() => triggerCopy(item.val, item.key)}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                      >
                        {copiedKey === item.key ? <CheckCircle size={12} /> : <Copy size={12} />}
                        {copiedKey === item.key ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre style={{ background: "var(--input-bg)", padding: "8px 12px", borderRadius: "6px", margin: 0, fontSize: "0.85rem", color: "var(--text-h)", overflowX: "auto" }}>
                      {item.val || "—"}
                    </pre>
                  </div>
                ))}
              </>
            )}

            {/* TAB 3: ADVANCE CRYPTO & REGEX */}
            {activeTab === "advance" && (
              <>
                <h4 style={{ marginBottom: "12px" }}>Cryptographic Hashes & Replacements</h4>

                {/* Regex tool inputs */}
                <div style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-h)" }}>Find & Replace Regex:</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input type="text" placeholder="Find pattern (e.g. World)..." value={regexFind} onChange={(e) => setRegexFind(e.target.value)} className="select-input" style={{ background: "var(--card-bg)" }} />
                    <input type="text" placeholder="Replace string (e.g. Lab)..." value={regexReplace} onChange={(e) => setRegexReplace(e.target.value)} className="select-input" style={{ background: "var(--card-bg)" }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
                    <strong>Result:</strong> {regexResult}
                  </div>
                </div>

                {/* SHA-256 Hash display */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold" }}>SHA-256 Hash:</span>
                    <button
                      onClick={() => triggerCopy(shaHash, "sha")}
                      disabled={!shaHash}
                      style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                    >
                      {copiedKey === "sha" ? <CheckCircle size={12} /> : <Copy size={12} />}
                      {copiedKey === "sha" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre style={{ background: "var(--input-bg)", padding: "8px 12px", borderRadius: "6px", margin: 0, fontSize: "0.75rem", color: "var(--text-h)", overflowX: "auto", fontFamily: "var(--font-mono)", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
                    {shaHash || "Computing Hash..."}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: statistics logger */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Real-time word counts */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            <h4 style={{ marginBottom: "12px" }}>String Analysis Statistics</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
              <div style={{ background: "var(--input-bg)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Characters</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--text-h)" }}>{getStats().chars}</strong>
              </div>
              <div style={{ background: "var(--input-bg)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Words</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--text-h)" }}>{getStats().words}</strong>
              </div>
              <div style={{ background: "var(--input-bg)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Lines</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--text-h)" }}>{getStats().lines}</strong>
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4>Subtle Cryptography API</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
              The SHA-256 algorithm in Advance tab calls the native browser Crypto Web API:
              <br />
              <code>crypto.subtle.digest("SHA-256", encoder.encode(input))</code>.
              This executes asynchronous binary digests on the main browser thread.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringTransformers;
