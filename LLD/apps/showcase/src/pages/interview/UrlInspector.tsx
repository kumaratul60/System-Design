import React, { useState, useEffect, useMemo } from "react";
import { translate } from "@statelab/theme";
import { Globe, Plus, Trash2, Lock, Unlock, AlertTriangle, CheckCircle, Copy, Check, Info, Code} from "lucide-react";

// Predefined initial mock URL for testing
const INITIAL_URL = "https://api.statelab.dev:443/v1/search/items?category=software&inStock=true&token=ZXlKaGJHY2lPaUpTVXpJMU5pSjkmcGFnZT0y&utm_source=dashboard#results-section";

interface ParsedNestedStructure {
  type: "json" | "url" | "query_string" | "base64" | "jwt";
  label: string;
  displayValue: string;
  children: ParsedParam[];
}

interface ParsedParam {
  key: string;
  value: string;
  id: string;
  nested?: ParsedNestedStructure | null;
}

interface ParsedUrlParts {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: ParsedParam[];
}

// Decode base64url formats to standard base64 for safe string rendering
const decodeBase64Url = (str: string): string | null => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    const decoded = atob(base64);
    const printable = /^[\t\r\n\x20-\x7E\u00A0-\u00FF]*$/;
    if (printable.test(decoded)) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
};

// Recursive parser to break down complex query values into key-value structures
const parseNestedValue = (val: string, depth = 0): ParsedNestedStructure | null => {
  if (depth > 5) return null; // Avoid stack overflow on recursive loops
  if (!val || typeof val !== "string") return null;

  const trimmed = val.trim();
  if (trimmed.length === 0) return null;

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // 1. Try JSON parsing
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        const children: ParsedParam[] = [];
        Object.entries(parsed).forEach(([k, v]) => {
          const stringVal = typeof v === "object" ? JSON.stringify(v) : String(v);
          children.push({
            key: k,
            value: stringVal,
            id: generateId(),
            nested: parseNestedValue(stringVal, depth + 1)
          });
        });
        return {
          type: "json",
          label: Array.isArray(parsed) ? "JSON Array" : "JSON Object",
          displayValue: trimmed,
          children
        };
      }
    } catch {
      // Ignore JSON parse fail
    }
  }

  // 2. Try URL parsing
  let parsedUrl: URL | null = null;
  try {
    if (/^[a-zA-Z0-9+-.]+:\/\//.test(trimmed)) {
      parsedUrl = new URL(trimmed);
    } else if (trimmed.startsWith("//")) {
      parsedUrl = new URL("https:" + trimmed);
    } else if (trimmed.includes(".") && (trimmed.includes("/") || trimmed.includes("?"))) {
      // Treat as URL without protocol
      const testUrl = new URL("https://" + trimmed);
      if (testUrl.hostname.includes(".") && testUrl.hostname.split(".")[0].length > 0) {
        parsedUrl = testUrl;
      }
    }
  } catch {
    // Ignore URL parse fail
  }

  if (parsedUrl) {
    const children: ParsedParam[] = [];
    if (parsedUrl.protocol) {
      children.push({ key: "protocol", value: parsedUrl.protocol, id: generateId() });
    }
    if (parsedUrl.host) {
      children.push({ key: "host", value: parsedUrl.host, id: generateId() });
    }
    if (parsedUrl.pathname && parsedUrl.pathname !== "/") {
      children.push({ key: "pathname", value: parsedUrl.pathname, id: generateId() });
    }
    parsedUrl.searchParams.forEach((v, k) => {
      children.push({
        key: `param:${k}`,
        value: v,
        id: generateId(),
        nested: parseNestedValue(v, depth + 1)
      });
    });
    if (parsedUrl.hash) {
      children.push({ key: "hash", value: parsedUrl.hash, id: generateId() });
    }

    return {
      type: "url",
      label: "Nested URL",
      displayValue: trimmed,
      children
    };
  }

  // 3. Try Query String parsing
  if (trimmed.includes("=") && !trimmed.includes(" ") && !trimmed.includes("\n")) {
    try {
      const decoded = decodeURIComponent(trimmed);
      const params = new URLSearchParams(decoded);
      let hasKeys = false;
      const children: ParsedParam[] = [];
      params.forEach((v, k) => {
        if (k && k !== trimmed) {
          hasKeys = true;
          children.push({
            key: k,
            value: v,
            id: generateId(),
            nested: parseNestedValue(v, depth + 1)
          });
        }
      });
      if (hasKeys && children.length > 0) {
        return {
          type: "query_string",
          label: "Query String",
          displayValue: decoded,
          children
        };
      }
    } catch {
      // Ignore query string parse fail
    }
  }

  // 3.5. Try JWT token decoding
  if (trimmed.includes(".") && trimmed.split(".").length === 3) {
    const parts = trimmed.split(".");
    const headerDecoded = decodeBase64Url(parts[0]);
    const payloadDecoded = decodeBase64Url(parts[1]);
    if (headerDecoded && payloadDecoded) {
      try {
        const headerObj = JSON.parse(headerDecoded);
        const payloadObj = JSON.parse(payloadDecoded);
        if (headerObj && typeof headerObj === "object" && payloadObj && typeof payloadObj === "object") {
          const children: ParsedParam[] = [
            {
              key: "Header (Algorithm & Type)",
              value: headerDecoded,
              id: generateId(),
              nested: parseNestedValue(headerDecoded, depth + 1)
            },
            {
              key: "Payload (Claims / Data)",
              value: payloadDecoded,
              id: generateId(),
              nested: parseNestedValue(payloadDecoded, depth + 1)
            },
            {
              key: "Signature (HMAC / RSA)",
              value: parts[2],
              id: generateId()
            }
          ];
          return {
            type: "jwt",
            label: "JWT Token",
            displayValue: "header.payload.signature",
            children
          };
        }
      } catch {
        // Not a JSON-based JWT
      }
    }
  }

  // 4. Try Base64 decoding
  if (trimmed.length >= 4) {
    const b64Regex = /^[A-Za-z0-9+/=]+$/;
    if (b64Regex.test(trimmed)) {
      try {
        const decoded = atob(trimmed);
        const printable = /^[\t\r\n\x20-\x7E\u00A0-\u00FF]*$/;
        if (printable.test(decoded)) {
          const nested = parseNestedValue(decoded, depth + 1);
          if (nested || decoded.length > 6) {
            const children: ParsedParam[] = [
              {
                key: "decoded",
                value: decoded,
                id: generateId(),
                nested
              }
            ];
            return {
              type: "base64",
              label: "Base64",
              displayValue: decoded,
              children
            };
          }
        }
      } catch {
        // Ignore base64 decode fail
      }
    }
  }

  return null;
};

// Inline Copy Button for quick clipboard operations in tree nodes
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "var(--success)" : "var(--text-muted)",
        padding: "2px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "6px",
        borderRadius: "3px",
        transition: "all 0.15s ease"}}
      title="Copy value"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
};

// Collapsible Tree View for recursively nested structures
const NestedBreakdown: React.FC<{ structure: ParsedNestedStructure; level?: number }> = ({ structure, level = 1 }) => {
  const [isOpen, setIsOpen] = useState(true);

  const getTypeStyles = (type: "json" | "url" | "query_string" | "base64" | "jwt") => {
    switch (type) {
      case "json":
        return { bg: "rgba(168, 85, 247, 0.08)", border: "rgba(168, 85, 247, 0.2)", text: "#a855f7" };
      case "url":
        return { bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" };
      case "query_string":
        return { bg: "rgba(236, 72, 153, 0.08)", border: "rgba(236, 72, 153, 0.2)", text: "#ec4899" };
      case "base64":
        return { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", text: "#10b981" };
      case "jwt":
        return { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", text: "#f59e0b" };
    }
  };

  const styles = getTypeStyles(structure.type);

  return (
    <div
      style={{
        marginTop: "8px",
        marginLeft: `${level > 1 ? 12 : 4}px`,
        borderLeft: `2px solid ${styles.text}`,
        paddingLeft: "12px",
        fontSize: "0.8rem"}}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          userSelect: "none",
          marginBottom: "6px",
          background: "var(--input-bg)",
          padding: "2px 8px",
          borderRadius: "4px",
          border: "1px solid var(--border)",
          transition: "all 0.2s ease"}}
      >
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            background: styles.bg,
            border: `1px solid ${styles.border}`,
            color: styles.text,
            padding: "1px 4px",
            borderRadius: "3px"}}
        >
          {structure.label}
        </span>
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            maxWidth: "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"}}
        >
          {structure.displayValue}
        </span>
        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          {isOpen ? "▼" : "▶"}
        </span>
      </div>

      {isOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {structure.children.map((child) => (
            <div
              key={child.id}
              style={{
                background: "rgba(255, 255, 255, 0.01)",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px dashed var(--border)"}}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--text-h)" }}>
                  {child.key}
                </span>
                <span style={{ color: "var(--text-muted)" }}>=</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--primary)",
                    wordBreak: "break-all",
                    fontSize: "0.75rem"}}
                >
                  {child.value || "(empty)"}
                </span>
                {child.value && <CopyButton text={child.value} />}
              </div>
              {child.nested && (
                <NestedBreakdown structure={child.nested} level={level + 1} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const UrlInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");
  
  const [rawUrlInput, setRawUrlInput] = useState(INITIAL_URL);
  const [urlParts, setUrlParts] = useState<ParsedUrlParts | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Helper to generate unique ID for rows
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Parse raw URL into structured components
  const parseUrl = (urlString: string) => {
    const trimmed = urlString.trim();
    if (!trimmed) {
      setUrlParts(null);
      setParseError(null);
      return;
    }

    let parsedUrl: URL | null = null;
    
    // First try direct parse
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      // Try prepending protocol if it doesn't already have one
      let candidate = trimmed;
      if (candidate.startsWith("//")) {
        candidate = "https:" + candidate;
      } else if (!/^[a-zA-Z0-9+-.]+:\/\//.test(candidate)) {
        candidate = "https://" + candidate;
      }
      
      try {
        parsedUrl = new URL(candidate);
      } catch {
        // Both failed
      }
    }

    if (parsedUrl) {
      // Parse parameters into array of objects with keys
      const paramsArray: ParsedParam[] = [];
      parsedUrl.searchParams.forEach((value, key) => {
        paramsArray.push({
          key,
          value,
          id: generateId(),
          nested: parseNestedValue(value)
        });
      });

      setUrlParts({
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash,
        params: paramsArray});
      setParseError(null);
    } else {
      setParseError("Invalid URL. Please ensure it is a valid format.");
      setUrlParts(null);
    }
  };

  // Re-run parser on raw URL input change
  useEffect(() => {
    parseUrl(rawUrlInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawUrlInput]);

  // Rebuild Raw URL from structured components (for Mid/Advance editing)
  const rebuildAndSetUrl = (parts: ParsedUrlParts) => {
    try {
      const url = new URL(`${parts.protocol}//${parts.host}${parts.pathname}`);
      parts.params.forEach(p => {
        if (p.key.trim()) {
          url.searchParams.append(p.key.trim(), p.value);
        }
      });
      url.hash = parts.hash;
      
      const newUrlStr = url.toString();
      setRawUrlInput(newUrlStr);
      setUrlParts(parts);
    } catch {
      // Ignore intermediate state building issues
    }
  };

  // Edit individual parameter key or value (Mid)
  const handleParamEdit = (id: string, field: "key" | "value", newVal: string) => {
    if (!urlParts) return;
    const updatedParams = urlParts.params.map(p => {
      if (p.id === id) {
        return { ...p, [field]: newVal };
      }
      return p;
    });

    const updatedParts = { ...urlParts, params: updatedParams };
    rebuildAndSetUrl(updatedParts);
  };

  // Delete parameter row (Mid)
  const handleParamDelete = (id: string) => {
    if (!urlParts) return;
    const updatedParams = urlParts.params.filter(p => p.id !== id);
    const updatedParts = { ...urlParts, params: updatedParams };
    rebuildAndSetUrl(updatedParts);
  };

  // Add new blank parameter row (Mid)
  const handleParamAdd = () => {
    if (!urlParts) return;
    const updatedParams = [...urlParts.params, { key: "new_param", value: "value", id: generateId() }];
    const updatedParts = { ...urlParts, params: updatedParams };
    rebuildAndSetUrl(updatedParts);
  };

  // Edit non-param components (Pathname, Hash)
  const handleComponentEdit = (field: keyof Omit<ParsedUrlParts, "params">, val: string) => {
    if (!urlParts) return;
    const updatedParts = { ...urlParts, [field]: val };
    rebuildAndSetUrl(updatedParts);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(rawUrlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Advance Tab: Security & Quality Warnings Validator
  const securityWarnings = useMemo(() => {
    const warnings: { field: string; message: string; type: "warning" | "error" | "info" }[] = [];
    if (!urlParts) return warnings;

    // 1. SSL/HTTPS Protocol check
    if (urlParts.protocol === "http:") {
      warnings.push({
        field: "Protocol",
        message: "Unencrypted protocol (HTTP) is insecure. Prefer HTTPS in production environments.",
        type: "warning"
      });
    }

    // 2. Unsafe characters check
    const unsafeRegex = /[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]/;
    if (unsafeRegex.test(rawUrlInput)) {
      warnings.push({
        field: "Characters",
        message: "URL contains unsafe or unencoded characters. Ensure correct URL encoding.",
        type: "warning"
      });
    }

    // 3. Localhost hostname flag
    if (urlParts.hostname === "localhost" || urlParts.hostname === "127.0.0.1") {
      warnings.push({
        field: "Hostname",
        message: "Pointing to local loopback (localhost). Inaccessible in remote deployment.",
        type: "info"
      });
    }

    // 4. Default ports checks
    if (urlParts.port && urlParts.port !== "80" && urlParts.port !== "443" && urlParts.port !== "8080" && urlParts.port !== "3000") {
      warnings.push({
        field: "Port",
        message: `Custom port (${urlParts.port}) is active. Check firewall and accessibility filters.`,
        type: "info"
      });
    }

    // 5. Sensitive Credential Exposure Check
    const sensitiveKeys = ["token", "secret", "key", "password", "auth", "pwd", "apikey"];
    const containsSensitive = urlParts.params.some(p => 
      sensitiveKeys.some(sk => p.key.toLowerCase().includes(sk))
    );
    if (containsSensitive) {
      warnings.push({
        field: "Security",
        message: "URL contains query parameters exposing authentication details (e.g. token/key). Sensitive variables in queries are logged by proxy nodes and stored in browser histories.",
        type: "warning"
      });
    }

    return warnings;
  }, [urlParts, rawUrlInput]);

  // Decode Base64 helper
  const tryDecodeBase64 = (val: string): string | null => {
    if (val.length < 4) return null;
    // Base64 regex check
    const b64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!b64Regex.test(val)) return null;
    try {
      const decoded = atob(val);
      // Validate that decoded string contains readable text
      const printable = /^[\x20-\x7E\r\n\t]+$/;
      if (printable.test(decoded)) {
        return decoded;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Globe className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>URL Query Inspector & Editor</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/UrlInspector.tsx`}
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
          Basic (Query Component Parser)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Live Parameter Grid Editor)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Base64 Decoders & Security Audit)
        </button>
      </div>

      {/* Main Paste TextArea */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-h)" }}>Destination URL Input:</label>
          <button className="btn btn-secondary" onClick={copyUrl} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "4px 10px" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied URL" : "Copy URL"}
          </button>
        </div>
        <textarea
          value={rawUrlInput}
          onChange={(e) => setRawUrlInput(e.target.value)}
          className="select-input"
          style={{ width: "100%", height: "60px", background: "var(--input-bg)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", resize: "vertical", color: "var(--primary)", lineHeight: 1.4 }}
          placeholder="Paste full URL string here..."
        />
        {parseError && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "6px", padding: "10px", marginTop: "10px", color: "red", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} /> {parseError}
          </div>
        )}
      </div>

      {/* INSPECTOR INTERACTIVE DISPLAY */}
      {urlParts && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          
          {/* LEFT SIDE: URL PARSER SUMMARY */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            <h4 style={{ marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>Component Segment Registry</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* Protocol */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Protocol:</span>
                <span style={{ fontFamily: "var(--font-mono)", background: "var(--input-bg)", padding: "2px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  {urlParts.protocol === "https:" ? <Lock size={12} style={{ color: "var(--success)" }} /> : <Unlock size={12} style={{ color: "#f59e0b" }} />}
                  {urlParts.protocol}
                </span>
              </div>

              {/* Domain Host */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Hostname:</span>
                <span style={{ fontFamily: "var(--font-mono)", background: "var(--input-bg)", padding: "2px 8px", borderRadius: "4px", color: "var(--text-h)" }}>
                  {urlParts.hostname}
                </span>
              </div>

              {/* Port */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Port:</span>
                <span style={{ fontFamily: "var(--font-mono)", background: "var(--input-bg)", padding: "2px 8px", borderRadius: "4px", color: "var(--text-h)" }}>
                  {urlParts.port || "(default)"}
                </span>
              </div>

              {/* Pathname */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Path Route:</span>
                {activeTab === "mid" ? (
                  <input
                    type="text"
                    value={urlParts.pathname}
                    onChange={(e) => handleComponentEdit("pathname", e.target.value)}
                    className="select-input"
                    style={{ background: "var(--input-bg)", fontSize: "0.8rem", padding: "4px 8px", fontFamily: "var(--font-mono)" }}
                  />
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", background: "var(--input-bg)", padding: "4px 8px", borderRadius: "4px", color: "var(--text-h)", wordBreak: "break-all" }}>
                    {urlParts.pathname}
                  </span>
                )}
              </div>

              {/* Hash segment */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Anchor / Hash:</span>
                {activeTab === "mid" ? (
                  <input
                    type="text"
                    value={urlParts.hash}
                    onChange={(e) => handleComponentEdit("hash", e.target.value)}
                    className="select-input"
                    style={{ background: "var(--input-bg)", fontSize: "0.8rem", padding: "4px 8px", fontFamily: "var(--font-mono)" }}
                  />
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", background: "var(--input-bg)", padding: "4px 8px", borderRadius: "4px", color: "var(--primary)" }}>
                    {urlParts.hash || "(empty)"}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: INTERACTIVE PARAMETERS TABLE */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
            
            {/* Header controls for params */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              <h4 style={{ margin: 0 }}>Query Parameters ({urlParts.params.length})</h4>
              {activeTab === "mid" && (
                <button className="btn btn-secondary" onClick={handleParamAdd} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", padding: "4px 10px" }}>
                  <Plus size={12} /> Add Row
                </button>
              )}
            </div>

            {/* List parameters */}
            <div style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
              {urlParts.params.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No query parameters detected in the current URL.
                </div>
              ) : (
                urlParts.params.map(p => {
                  const decoded = tryDecodeBase64(p.value);
                  
                  return (
                    <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: "4px", background: "var(--input-bg)", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        
                        {/* Key Edit */}
                        {activeTab === "mid" ? (
                          <input
                            type="text"
                            value={p.key}
                            onChange={(e) => handleParamEdit(p.id, "key", e.target.value)}
                            placeholder="Key"
                            className="select-input"
                            style={{ flex: 1, padding: "2px 6px", fontSize: "0.8rem", background: "var(--card-bg)", fontFamily: "var(--font-mono)" }}
                          />
                        ) : (
                          <span style={{ fontWeight: "bold", fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--text-h)", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.key}
                          </span>
                        )}

                        <span style={{ color: "var(--text-muted)" }}>=</span>

                        {/* Value Edit */}
                        {activeTab === "mid" ? (
                          <input
                            type="text"
                            value={p.value}
                            onChange={(e) => handleParamEdit(p.id, "value", e.target.value)}
                            placeholder="Value"
                            className="select-input"
                            style={{ flex: 1.5, padding: "2px 6px", fontSize: "0.8rem", background: "var(--card-bg)", fontFamily: "var(--font-mono)" }}
                          />
                        ) : (
                          <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--primary)", flex: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.value || "(empty)"}
                          </span>
                        )}

                        {/* Actions */}
                        {activeTab === "mid" && (
                          <button
                            onClick={() => handleParamDelete(p.id)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Nested Parameter Breakdown Visualizer */}
                      {p.nested && (
                        <NestedBreakdown structure={p.nested} />
                      )}

                      {/* Advance Tab: Base64 Decoded Alert Badge */}
                      {activeTab === "advance" && decoded && (
                        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "4px", padding: "4px 8px", marginTop: "4px", fontSize: "0.72rem", color: "var(--success)" }}>
                          <strong>Decoded Base64:</strong> <code>{decoded}</code>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Advance Tab: Safety Validation audits */}
            {activeTab === "advance" && (
              <div style={{ marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Security & Syntax Audit</h5>
                {securityWarnings.length === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success)", fontSize: "0.8rem" }}>
                    <CheckCircle size={14} /> Perfect URL syntax! No safety alerts detected.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {securityWarnings.map((w, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "8px",
                          background: w.type === "warning" ? "rgba(245, 158, 11, 0.08)" : "rgba(59, 130, 246, 0.08)",
                          borderLeft: `3px solid ${w.type === "warning" ? "#f59e0b" : "#3b82f6"}`,
                          padding: "6px 10px",
                          borderRadius: "4px",
                          fontSize: "0.78rem"
                        }}
                      >
                        <AlertTriangle size={14} style={{ color: w.type === "warning" ? "#f59e0b" : "#3b82f6", flexShrink: 0 }} />
                        <div>
                          <strong>{w.field}:</strong> <span style={{ color: "var(--text-muted)" }}>{w.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Description Footer */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "16px", marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <Info size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
          <strong>URL Query Standard:</strong> In RFC 3986, query strings are key-value structures separated by ampersands (<code>&</code>). In complex applications, query parameters are routinely encoded in Base64 formats to pass structured client states securely across HTTP redirects.
        </p>
      </div>
    </div>
  );
};

export default UrlInspector;
