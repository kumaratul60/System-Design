import React, { useState, useEffect, useRef } from "react";
import { translate } from "@statelab/theme";
import { Clock, Play, Pause, RotateCcw, AlertTriangle, Plus, Trash2, CheckCircle2, Volume2, Code} from "lucide-react";

interface TimerHistoryItem {
  id: string;
  name: string;
  duration: number; // in seconds
  completedAt: string;
}

interface ActiveTimer {
  id: string;
  name: string;
  totalSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  lastTickTimestamp: number;
}

export const CountdownTimer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "mid" | "advance">("basic");

  // ==========================================
  // --- BASIC TAB (Simple Input Countdown) ---
  // ==========================================
  const [basicHours, setBasicHours] = useState(0);
  const [basicMinutes, setBasicMinutes] = useState(5);
  const [basicSeconds, setBasicSeconds] = useState(0);
  const [basicRemaining, setBasicRemaining] = useState(0);
  const [basicIsRunning, setBasicIsRunning] = useState(false);
  const basicTimerRef = useRef<any>(null);

  const startBasicTimer = () => {
    if (basicIsRunning) return;
    let totalSec = basicRemaining;
    if (totalSec <= 0) {
      totalSec = basicHours * 3600 + basicMinutes * 60 + basicSeconds;
    }
    if (totalSec <= 0) return;

    setBasicRemaining(totalSec);
    setBasicIsRunning(true);

    basicTimerRef.current = setInterval(() => {
      setBasicRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(basicTimerRef.current);
          setBasicIsRunning(false);
          alert("Time's up! (Basic Timer Completed)");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseBasicTimer = () => {
    setBasicIsRunning(false);
    if (basicTimerRef.current) clearInterval(basicTimerRef.current);
  };

  const resetBasicTimer = () => {
    setBasicIsRunning(false);
    if (basicTimerRef.current) clearInterval(basicTimerRef.current);
    setBasicRemaining(0);
    setBasicHours(0);
    setBasicMinutes(5);
    setBasicSeconds(0);
  };

  // Sync basic inputs when basicRemaining changes
  const formatBasicTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // --- MID TAB (Presets & Tab Sync) ---------
  // ==========================================
  const [midRemaining, setMidRemaining] = useState(300); // Default 5 minutes
  const [midTotal, setMidTotal] = useState(300);
  const [midIsRunning, setMidIsRunning] = useState(false);
  const [midSoundEnabled, setMidSoundEnabled] = useState(true);
  const midTimerRef = useRef<any>(null);

  const selectPreset = (secs: number) => {
    setMidIsRunning(false);
    if (midTimerRef.current) clearInterval(midTimerRef.current);
    setMidRemaining(secs);
    setMidTotal(secs);
  };

  const startMidTimer = () => {
    if (midIsRunning) return;
    setMidIsRunning(true);

    midTimerRef.current = setInterval(() => {
      setMidRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(midTimerRef.current);
          setMidIsRunning(false);
          if (midSoundEnabled) {
            // Simulated beep using web audio API
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              osc.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
              console.error(e);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseMidTimer = () => {
    setMidIsRunning(false);
    if (midTimerRef.current) clearInterval(midTimerRef.current);
  };

  const resetMidTimer = () => {
    setMidIsRunning(false);
    if (midTimerRef.current) clearInterval(midTimerRef.current);
    setMidRemaining(300);
    setMidTotal(300);
  };

  // Sync document title to ticking countdown
  useEffect(() => {
    if (activeTab !== "mid" || !midIsRunning) {
      document.title = "lld";
      return;
    }
    const m = Math.floor(midRemaining / 60);
    const s = midRemaining % 60;
    document.title = `(${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}) Timer Active`;
    return () => {
      document.title = "lld";
    };
  }, [midRemaining, midIsRunning, activeTab]);

  // ==========================================
  // --- ADVANCE TAB (Multi Timers & Sync) ----
  // ==========================================
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [timerHistory, setTimerHistory] = useState<TimerHistoryItem[]>([]);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerSecs, setNewTimerSecs] = useState(60);

  const addNewTimer = () => {
    if (newTimerSecs <= 0) return;
    const name = newTimerName.trim() || `Task Timer ${activeTimers.length + 1}`;
    const newTimer: ActiveTimer = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      totalSeconds: newTimerSecs,
      remainingSeconds: newTimerSecs,
      isPaused: false,
      lastTickTimestamp: Date.now()};
    setActiveTimers((prev) => [...prev, newTimer]);
    setNewTimerName("");
    setNewTimerSecs(60);
  };

  const togglePauseTimer = (id: string) => {
    setActiveTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            isPaused: !t.isPaused,
            lastTickTimestamp: Date.now(), // Reset timestamp on resume
          };
        }
        return t;
      })
    );
  };

  const deleteTimer = (id: string) => {
    setActiveTimers((prev) => prev.filter((t) => t.id !== id));
  };

  // High resolution tick handler utilizing timestamps to avoid drift in background tabs
  useEffect(() => {
    if (activeTab !== "advance" || activeTimers.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      setActiveTimers((prev) => {
        const updated: ActiveTimer[] = [];
        const completed: TimerHistoryItem[] = [];

        prev.forEach((timer) => {
          if (timer.isPaused) {
            updated.push(timer);
            return;
          }

          // Calculate precise elapsed milliseconds since last evaluated state
          const elapsedMs = now - timer.lastTickTimestamp;
          const elapsedSecs = Math.floor(elapsedMs / 1000);

          if (elapsedSecs >= 1) {
            const nextRemaining = Math.max(0, timer.remainingSeconds - elapsedSecs);
            
            if (nextRemaining <= 0) {
              // Timer finished! Log to history
              completed.push({
                id: timer.id,
                name: timer.name,
                duration: timer.totalSeconds,
                completedAt: new Date().toLocaleTimeString()});
            } else {
              updated.push({
                ...timer,
                remainingSeconds: nextRemaining,
                lastTickTimestamp: timer.lastTickTimestamp + elapsedSecs * 1000, // Sync timestamp bound
              });
            }
          } else {
            updated.push(timer);
          }
        });

        if (completed.length > 0) {
          setTimerHistory((h) => [...completed, ...h].slice(0, 10));
        }

        return updated;
      });
    }, 200); // Fast evaluated loop to maintain timestamp sync

    return () => clearInterval(interval);
  }, [activeTimers, activeTab]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header" style={{ marginBottom: "20px" }}>
        <div className="todos-header-title">
          <Clock className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Countdown Timer Suite</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/CountdownTimer.tsx`}
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
          Basic (HH:MM:SS Countdown)
        </button>
        <button
          className={`btn ${activeTab === "mid" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mid")}
        >
          Mid (Presets & Ring Sync)
        </button>
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("advance")}
        >
          Advance (Multi-Timers & Drift Correction)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "24px", alignItems: "start" }}>
        {/* Left Interactive Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* TAB 1: BASIC COUNTER */}
          {activeTab === "basic" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Standard Countdown inputs</h4>

              {basicRemaining > 0 ? (
                /* Active View */
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: "3rem", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--text-h)", marginBottom: "16px" }}>
                    {formatBasicTime(basicRemaining)}
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {basicIsRunning ? (
                      <button className="btn btn-secondary" onClick={pauseBasicTimer}><Pause size={16} /> Pause</button>
                    ) : (
                      <button className="btn btn-primary" onClick={startBasicTimer}><Play size={16} /> Resume</button>
                    )}
                    <button className="btn btn-secondary" onClick={resetBasicTimer}><RotateCcw size={16} /> Reset</button>
                  </div>
                </div>
              ) : (
                /* Form Inputs */
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Hours</label>
                      <input type="number" min="0" value={basicHours} onChange={(e) => setBasicHours(Math.max(0, Number(e.target.value)))} className="select-input" style={{ width: "70px", fontSize: "1.2rem", textAlign: "center" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Minutes</label>
                      <input type="number" min="0" max="59" value={basicMinutes} onChange={(e) => setBasicMinutes(Math.max(0, Math.min(59, Number(e.target.value))))} className="select-input" style={{ width: "70px", fontSize: "1.2rem", textAlign: "center" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Seconds</label>
                      <input type="number" min="0" max="59" value={basicSeconds} onChange={(e) => setBasicSeconds(Math.max(0, Math.min(59, Number(e.target.value))))} className="select-input" style={{ width: "70px", fontSize: "1.2rem", textAlign: "center" }} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={startBasicTimer}>Start Countdown</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MID PRESETS & ACCORDION RING */}
          {activeTab === "mid" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Preset Durations & Title Synchronization</h4>

              {/* Preset buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                <button className="btn btn-secondary" onClick={() => selectPreset(60)}>1 Minute</button>
                <button className="btn btn-secondary" onClick={() => selectPreset(300)}>5 Minutes</button>
                <button className="btn btn-secondary" onClick={() => selectPreset(600)}>10 Minutes</button>
                <button className="btn btn-secondary" onClick={() => selectPreset(1800)}>30 Minutes</button>
              </div>

              {/* Progress ring display */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                <div style={{ position: "relative", width: "160px", height: "160px" }}>
                  <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="6" />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={2 * Math.PI * 70 * (1 - midRemaining / midTotal)}
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: "2rem", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--text-h)" }}>
                      {Math.floor(midRemaining / 60)}:{(midRemaining % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {midIsRunning ? (
                    <button className="btn btn-secondary" onClick={pauseMidTimer}><Pause size={16} /> Pause</button>
                  ) : (
                    <button className="btn btn-primary" onClick={startMidTimer}><Play size={16} /> Start</button>
                  )}
                  <button className="btn btn-secondary" onClick={resetMidTimer}><RotateCcw size={16} /> Reset</button>
                  
                  {/* Sound Switcher */}
                  <button className={`btn ${midSoundEnabled ? "btn-primary" : "btn-secondary"}`} onClick={() => setMidSoundEnabled(!midSoundEnabled)} title="Beep at completion">
                    <Volume2 size={16} /> {midSoundEnabled ? "Sound On" : "Muted"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCE MULTIPLE TIMERS */}
          {activeTab === "advance" && (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px" }}>
              <h4 style={{ marginBottom: "16px" }}>Task Timers Manager</h4>

              {/* Form to create new timer */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: "10px", marginBottom: "20px" }}>
                <input type="text" placeholder="Timer label (e.g. Code Review)..." value={newTimerName} onChange={(e) => setNewTimerName(e.target.value)} className="select-input" />
                <input type="number" placeholder="Seconds..." value={newTimerSecs} onChange={(e) => setNewTimerSecs(Math.max(1, Number(e.target.value)))} className="select-input" />
                <button className="btn btn-primary" onClick={addNewTimer}><Plus size={16} /> Add</button>
              </div>

              {/* Timers list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activeTimers.length === 0 ? (
                  <div style={{ padding: "16px", textDecoration: "italic", textAlign: "center", color: "var(--text-muted)", background: "var(--input-bg)", borderRadius: "6px" }}>No active timers. Add one above!</div>
                ) : (
                  activeTimers.map((timer) => {
                    const percentage = (timer.remainingSeconds / timer.totalSeconds) * 100;
                    return (
                      <div key={timer.id} style={{ border: "1px solid var(--border)", background: "var(--input-bg)", padding: "12px", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div>
                            <strong style={{ color: "var(--text-h)" }}>{timer.name}</strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>({timer.totalSeconds}s total)</span>
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>
                            {Math.floor(timer.remainingSeconds / 60)}:{(timer.remainingSeconds % 60).toString().padStart(2, "0")}
                          </span>
                        </div>

                        {/* Bar */}
                        <div style={{ width: "100%", height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                          <div style={{ width: `${percentage}%`, height: "100%", background: "var(--primary)", transition: "width 0.25s linear" }} />
                        </div>

                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button className="btn btn-secondary" onClick={() => togglePauseTimer(timer.id)} style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
                            {timer.isPaused ? "Resume" : "Pause"}
                          </button>
                          <button className="btn btn-secondary" onClick={() => deleteTimer(timer.id)} style={{ padding: "4px 8px", fontSize: "0.75rem", color: "red" }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Info Board */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--border-radius)", background: "var(--card-bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4>Background Drift Logs</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            <div>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", marginBottom: "4px" }}><AlertTriangle size={14} style={{ color: "#f59e0b" }} /> Tab Inactivity Problem</span>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>
                Browsers throttle <code>setInterval</code> loops down to once per minute in inactive background tabs to save battery. Traditional loops fall behind.
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <span style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Timestamp Offset Solution:</span>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>
                The Advance timer does not assume 1 loop iteration = 1 second. Instead, it captures <code>Date.now()</code> delta offsets inside the evaluator loop, ensuring time remaining updates precisely even when tabs are backgrounded.
              </span>
            </div>

            {activeTab === "advance" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", marginBottom: "6px" }}><CheckCircle2 size={14} style={{ color: "var(--success)" }} /> Completed History Log</span>
                {timerHistory.length === 0 ? (
                  <span style={{ color: "var(--text-muted)" }}>No completed timers yet.</span>
                ) : (
                  <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {timerHistory.map((item) => (
                      <div key={item.id} style={{ fontSize: "0.72rem", color: "var(--success)", display: "flex", justifyContent: "space-between" }}>
                        <span>✓ {item.name} ({item.duration}s)</span>
                        <span>{item.completedAt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
