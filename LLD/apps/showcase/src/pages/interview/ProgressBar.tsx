import React, { useState, useEffect, useRef } from "react";
import { Activity, Play, Pause, RotateCcw, Check, TrendingUp, HelpCircle } from "lucide-react";

export const ProgressBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Standard Progress) --------
  // ==========================================
  const [basicVal, setBasicVal] = useState(40);

  // ==========================================
  // --- MID TAB (Multi-stage Stepper) --------
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Cart details", "Shipping info", "Payment details", "Order complete"];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // ==========================================
  // --- ADVANCE TAB (Simulator + Metrics) ----
  // ==========================================
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPercentage, setSimPercentage] = useState(0);
  const [bytesProcessed, setBytesProcessed] = useState(0);
  const totalBytes = 104857600; // 100 Megabytes
  
  // Ref pointers to track timestamps
  const simTimerRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);
  const startTimestampRef = useRef<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0); // in MB/s
  const [eta, setEta] = useState<number | null>(null);

  const startSimulation = () => {
    if (simPercentage >= 100) {
      // Reset first
      setSimPercentage(0);
      setBytesProcessed(0);
      setDownloadSpeed(0);
      setEta(null);
    }
    setIsSimulating(true);
    lastUpdateRef.current = performance.now();
    if (startTimestampRef.current === 0 || simPercentage === 0) {
      startTimestampRef.current = performance.now();
    }
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimPercentage(0);
    setBytesProcessed(0);
    setDownloadSpeed(0);
    setEta(null);
    startTimestampRef.current = 0;
  };

  useEffect(() => {
    if (!isSimulating) {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
      return;
    }

    lastUpdateRef.current = performance.now();

    simTimerRef.current = setInterval(() => {
      const now = performance.now();
      const timeDiff = (now - lastUpdateRef.current) / 1000; // time since last tick in seconds
      lastUpdateRef.current = now;

      // Simulated random download speeds (between 4MB/s and 12MB/s)
      const speedMBs = 4 + Math.random() * 8;
      setDownloadSpeed(speedMBs);

      const bytesAdded = speedMBs * 1024 * 1024 * timeDiff;

      setBytesProcessed((prevBytes) => {
        const nextBytes = Math.min(prevBytes + bytesAdded, totalBytes);
        const nextPercentage = (nextBytes / totalBytes) * 100;
        setSimPercentage(nextPercentage);

        // Calculate ETA
        const bytesRemaining = totalBytes - nextBytes;
        const speedBytesSec = speedMBs * 1024 * 1024;
        const remainingSeconds = speedBytesSec > 0 ? Math.max(0, bytesRemaining / speedBytesSec) : 0;
        setEta(nextBytes >= totalBytes ? 0 : Math.round(remainingSeconds));

        if (nextBytes >= totalBytes) {
          setIsSimulating(false);
          setDownloadSpeed(0);
          setEta(0);
          if (simTimerRef.current) {
            clearInterval(simTimerRef.current);
            simTimerRef.current = null;
          }
        }

        return nextBytes;
      });
    }, 150); // Throttled ticker update rate (150ms)

    return () => {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    };
  }, [isSimulating]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Activity className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Progress Bar Visualizer Suite</h3>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic (Custom Color Bars)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Multi-stage Checkout Stepper)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (File Download Simulator)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Interactive Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC BAR SLIDERS */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Basic Progress Components</h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Control slider */}
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Adjust Progress Value: {basicVal}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={basicVal}
                    onChange={(e) => setBasicVal(Number(e.target.value))}
                    style={{ width: "100%", cursor: "pointer", marginTop: "6px" }}
                  />
                </div>

                {/* 1. Primary style */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span>Primary Loader</span>
                    <span>{basicVal}%</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", background: "var(--input-bg)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${basicVal}%`, height: "100%", background: "var(--primary)", transition: "width 0.2s ease" }} />
                  </div>
                </div>

                {/* 2. Success style */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span>Success Indicator</span>
                    <span>{basicVal}%</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", background: "var(--input-bg)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${basicVal}%`, height: "100%", background: "#10b981", transition: "width 0.2s ease" }} />
                  </div>
                </div>

                {/* 3. Warning style */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span>Alert / Warning</span>
                    <span>{basicVal}%</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", background: "var(--input-bg)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${basicVal}%`, height: "100%", background: "#f59e0b", transition: "width 0.2s ease" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MID TRANSACTION STEPPER */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "20px" }}>Checkout Stepper Wizard</h4>

              {/* Stepper graphical layout */}
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "32px", padding: "0 10px" }}>
                
                {/* Background connector line */}
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "40px",
                    right: "40px",
                    height: "4px",
                    background: "var(--border)",
                    zIndex: 1,
                  }}
                />

                {/* Active connector fill */}
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "40px",
                    width: `${((currentStep - 1) / (steps.length - 1)) * 85}%`,
                    height: "4px",
                    background: "var(--primary)",
                    zIndex: 2,
                    transition: "width 0.3s ease",
                  }}
                />

                {steps.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = stepNum < currentStep;
                  const isActive = stepNum === currentStep;

                  return (
                    <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10, position: "relative", width: "80px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: isCompleted ? "var(--primary)" : isActive ? "var(--card-bg)" : "var(--input-bg)",
                          border: isActive ? "3px solid var(--primary)" : "2px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          color: isCompleted ? "var(--bg)" : isActive ? "var(--text-h)" : "var(--text-muted)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {isCompleted ? <Check size={16} /> : stepNum}
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          textAlign: "center",
                          marginTop: "8px",
                          fontWeight: isActive ? "bold" : "normal",
                          color: isActive ? "var(--text-h)" : "var(--text-muted)",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step info description */}
              <div style={{ background: "var(--input-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", minHeight: "80px", marginBottom: "16px" }}>
                <strong style={{ display: "block", color: "var(--text-h)", marginBottom: "4px" }}>
                  Step {currentStep}: {steps[currentStep - 1]}
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {currentStep === 1 && "Select items from store catalog, apply coupons and set item quantities."}
                  {currentStep === 2 && "Enter your primary shipping location address, zipcode, and choose delivery speed."}
                  {currentStep === 3 && "Submit credit card details or tokenized payment systems."}
                  {currentStep === 4 && "Order registered! Simulating success response code dispatch."}
                </span>
              </div>

              {/* Stepper buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={handlePrevStep} disabled={currentStep === 1}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={handleNextStep} disabled={currentStep === steps.length}>
                  Next Stage
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE PROGRESS SIMULATOR */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>High-Performance Metrics Simulator</h4>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", marginBottom: "20px" }}>
                {/* Circular ring */}
                <div style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
                  <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - simPercentage / 100)}
                      style={{ transition: "stroke-dashoffset 0.15s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-h)" }}>{Math.round(simPercentage)}%</span>
                  </div>
                </div>

                {/* Simulated file info */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "bold" }}>LLD_Lab_Bundle_v1.0.tar.gz</span>
                    <span style={{ color: "var(--text-muted)" }}>{(bytesProcessed / (1024 * 1024)).toFixed(1)}MB / 100MB</span>
                  </div>
                  
                  {/* Linear Bar */}
                  <div style={{ width: "100%", height: "10px", background: "var(--input-bg)", borderRadius: "5px", overflow: "hidden", marginBottom: "12px" }}>
                    <div style={{ width: `${simPercentage}%`, height: "100%", background: "var(--primary)", transition: "width 0.15s ease" }} />
                  </div>

                  {/* Simulator Controls */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {!isSimulating ? (
                      <button className="btn btn-primary" onClick={startSimulation} style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Play size={12} /> {simPercentage > 0 ? "Resume" : "Start Download"}
                      </button>
                    ) : (
                      <button className="btn btn-secondary" onClick={pauseSimulation} style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Pause size={12} /> Pause
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={resetSimulation} style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Panel */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Download Process Telemetry</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Simulator Status:</span>{" "}
              <span style={{ color: isSimulating ? "var(--success)" : "var(--text-muted)" }}>
                {isSimulating ? "DOWNLOADING" : simPercentage >= 100 ? "COMPLETED" : "IDLE"}
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "8px" }}>
              <h5 style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}><TrendingUp size={14} /> System Math Engine</h5>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-muted)" }}>
                <div>Download Speed: <span style={{ color: "var(--text-h)" }}>{downloadSpeed.toFixed(1)} MB/s</span></div>
                <div>Estimated ETA: <span style={{ color: "var(--text-h)" }}>{eta !== null ? `${eta} seconds` : "N/A"}</span></div>
                <div>Processed Bytes: <span style={{ color: "var(--text-h)" }}>{Math.round(bytesProcessed).toLocaleString()} B</span></div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "8px" }}>
              <h5 style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}><HelpCircle size={14} /> Speed/ETA Math formulas</h5>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Speed calculations require delta-time offsets to prevent clock skew:
                <br />
                <code>bytesAdded = speed * 1024 * 1024 * deltaTime</code>.
                <br />
                ETA is derived from remaining capacity:
                <br />
                <code>ETA = bytesRemaining / bytesPerSecond</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
