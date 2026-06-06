import React, { useState, useRef, useEffect } from "react";
import { ShieldAlert, RefreshCw, Key, ShieldCheck, HelpCircle } from "lucide-react";

export const OtpVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // Shared resend countdown timer
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendCode = () => {
    setResendTimer(30);
    setCanResend(false);
  };

  // ==========================================
  // --- BASIC TAB (Fixed 4-digit OTP inputs) -
  // ==========================================
  const [basicOtp, setBasicOtp] = useState<string[]>(Array(4).fill(""));
  const basicRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleBasicChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return; // Allow numbers only
    const updated = [...basicOtp];
    updated[index] = val.slice(-1); // Only keep last typed char
    setBasicOtp(updated);

    if (val && index < 3) {
      basicRefs.current[index + 1]?.focus();
    }
  };

  const handleBasicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !basicOtp[index] && index > 0) {
      basicRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // --- MID TAB (Dynamic length + Clipboard) -
  // ==========================================
  const [otpLength, setOtpLength] = useState(6);
  const [midOtp, setMidOtp] = useState<string[]>(Array(6).fill(""));
  const midRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Re-initialize array when length changes
  useEffect(() => {
    setMidOtp(Array(otpLength).fill(""));
  }, [otpLength]);

  const handleMidChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...midOtp];
    updated[index] = val.slice(-1);
    setMidOtp(updated);

    if (val && index < otpLength - 1) {
      midRefs.current[index + 1]?.focus();
    }
  };

  const handleMidKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !midOtp[index] && index > 0) {
      midRefs.current[index - 1]?.focus();
    }
  };

  // Handles pasting codes (e.g. pasting "123456" auto-fills inputs)
  const handlePaste = (e: React.ClipboardEvent, targetLen: number, setOtpFunc: any, refsRef: any) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(data)) return; // numbers only

    const digits = data.split("").slice(0, targetLen);
    const updated = Array(targetLen).fill("");
    digits.forEach((digit, i) => {
      updated[i] = digit;
    });

    setOtpFunc(updated);
    
    // Focus last filled box or last box in set
    const focusIdx = Math.min(digits.length, targetLen - 1);
    refsRef.current[focusIdx]?.focus();
  };

  // ==========================================
  // --- ADVANCE TAB (Cursor alignment & error)
  // ==========================================
  const [advLen, setAdvLen] = useState(6);
  const [advOtp, setAdvOtp] = useState<string[]>(Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const advRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setAdvOtp(Array(advLen).fill(""));
    setIsError(false);
    setIsSuccess(false);
  }, [advLen]);

  const handleAdvChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...advOtp];
    updated[index] = val.slice(-1);
    setAdvOtp(updated);
    setIsError(false);

    if (val) {
      if (index < advLen - 1) {
        advRefs.current[index + 1]?.focus();
      }
    }
  };

  // Advanced Backspace and delete logic (Middle Edit deletion)
  const handleAdvKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      setIsError(false);
      const updated = [...advOtp];
      
      if (advOtp[index]) {
        // If current box is filled, empty it but keep focus there so user can re-type
        updated[index] = "";
        setAdvOtp(updated);
      } else if (index > 0) {
        // If current box is empty, empty previous box and focus it
        updated[index - 1] = "";
        setAdvOtp(updated);
        advRefs.current[index - 1]?.focus();
      }
    }
  };

  // Ensures clicking in empty box snaps focus to first empty box
  const handleBoxClick = (index: number) => {
    const firstEmptyIndex = advOtp.findIndex((digit) => digit === "");
    if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
      advRefs.current[firstEmptyIndex]?.focus();
    }
  };

  const handleVerify = () => {
    const code = advOtp.join("");
    if (code.length < advLen) {
      setIsError(true);
      return;
    }

    setIsVerifying(true);
    setIsError(false);

    setTimeout(() => {
      setIsVerifying(false);
      // Mock validation: "123456" is correct
      if (code === Array(advLen).fill("1").join("")) {
        setIsSuccess(true);
      } else {
        setIsError(true);
        // Shake animation triggering trigger
      }
    }, 1200);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Key className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Secure OTP Verification Panel</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Fixed 4-Digit Inputs)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Dynamic Size & Paste Helper)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Smart Cursor & Validation Mock)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Inputs Board */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC FIXED 4 DIGIT */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px", textAlign: "center" }}>
              <h4>Fixed 4-Digit Input Form</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
                Basic focus movement. Auto-advances cursor when number is typed.
              </p>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
                {basicOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { basicRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleBasicChange(e.target.value, idx)}
                    onKeyDown={(e) => handleBasicKeyDown(e, idx)}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--input-bg)",
                      color: "var(--text-h)",
                      fontSize: "1.5rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "300px", margin: "0 auto" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {canResend ? "Code expired." : `Resend code in ${resendTimer}s`}
                </span>
                <button className="btn btn-secondary" onClick={handleResendCode} disabled={!canResend} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                  <RefreshCw size={12} /> Resend
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MID DYNAMIC LENGTH */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px", textAlign: "center" }}>
              <h4>Configurable Digits Size & Clipboard support</h4>

              {/* Box count configuration */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "0.85rem" }}>Select Digits Length:</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[4, 6, 8].map((l) => (
                    <button
                      key={l}
                      className={`btn ${otpLength === l ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setOtpLength(l)}
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      {l} Box Set
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
                {midOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { midRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMidChange(e.target.value, idx)}
                    onKeyDown={(e) => handleMidKeyDown(e, idx)}
                    onPaste={(e) => handlePaste(e, otpLength, setMidOtp, midRefs)}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--input-bg)",
                      color: "var(--text-h)",
                      fontSize: "1.3rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Try copying a {otpLength}-digit code (e.g. <code>123456</code>) and paste it into the first input box.
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE SMART CURSOR */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "24px", textAlign: "center" }}>
              <h4>Dynamic Validator & Cursor Alignment Lock</h4>

              {/* Length config */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "0.85rem" }}>Boxes Config:</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[4, 6, 8].map((l) => (
                    <button
                      key={l}
                      className={`btn ${advLen === l ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setAdvLen(l)}
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      {l} Box Set
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div
                className={isError ? "shake-animate" : ""}
                style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}
              >
                {advOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { advRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleAdvChange(e.target.value, idx)}
                    onKeyDown={(e) => handleAdvKeyDown(e, idx)}
                    onClick={() => handleBoxClick(idx)}
                    onPaste={(e) => handlePaste(e, advLen, setAdvOtp, advRefs)}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      border: isError ? "2px solid red" : isSuccess ? "2px solid var(--success)" : "1px solid var(--border)",
                      background: "var(--input-bg)",
                      color: "var(--text-h)",
                      fontSize: "1.3rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                ))}
              </div>

              {/* Details and error panels */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                {isError && (
                  <span style={{ color: "red", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ShieldAlert size={14} /> Verification failed! Use code of all 1s (e.g. <code>111111</code>) to pass.
                  </span>
                )}
                {isSuccess && (
                  <span style={{ color: "var(--success)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={14} /> Validation passed! Verification token generated.
                  </span>
                )}

                <button
                  className="btn btn-primary"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  style={{ width: "200px" }}
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>OTP Logic Design Rules</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><ShieldCheck size={14} /> Paste Event Auto-Split</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Clipboard pasting is intercepted. The string is regex-validated for numbers, split into single digits, and distributed to states via array index mappings.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-h)" }}><HelpCircle size={14} /> Focus Retention Alignment</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                If a user clicks inside empty boxes in the middle, the click listener forces focus to warp back to the first empty input element, preserving entry flow.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <strong style={{ display: "block", color: "var(--text-h)" }}>Dynamic Box Config:</strong>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "4px" }}>
                Inputs size scale dynamically. Modifying length states changes the size array size and loops dynamically.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
