import React, { useState, useEffect, useCallback, useRef } from "react";
import { translate } from "@statelab/theme";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Plus, Flag, Hourglass, Coffee, Brain, Code} from "lucide-react";

// --- Stopwatch Hook (Data Layer 1) ---
// Accurate Timer Delta (Date.now() - startTime) is used to avoid cumulative interval drift.
export function useStopwatch() {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    const startTime = Date.now() - time;
    intervalRef.current = window.setInterval(() => {
      setTime(Date.now() - startTime);
    }, 10);
  }, [isRunning, time]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTime(0);
    setLaps([]);
  }, []);

  const addLap = useCallback(() => {
    setLaps((prev) => [...prev, time]);
  }, [time]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    time,
    isRunning,
    laps,
    start,
    pause,
    reset,
    addLap};
}

// --- Countdown Hook (Data Layer 2) ---
export function useCountdown(defaultSeconds = 60) {
  const [initialDuration, setInitialDuration] = useState<number>(defaultSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isRunning || timeLeft <= 0) return;
    setIsRunning(true);
    const targetTime = Date.now() + timeLeft * 1000;
    
    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setIsRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 200);
  }, [isRunning, timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(initialDuration);
  }, [initialDuration]);

  const setDuration = useCallback((seconds: number) => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const cleanSeconds = Math.max(1, seconds);
    setInitialDuration(cleanSeconds);
    setTimeLeft(cleanSeconds);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progress = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

  return {
    timeLeft,
    initialDuration,
    isRunning,
    start,
    pause,
    reset,
    setDuration,
    progress};
}

// --- Pomodoro Hook (Data Layer 3) ---
export function usePomodoro() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [workDuration, setWorkDuration] = useState<number>(25 * 60); // 25 min default
  const [breakDuration, setBreakDuration] = useState<number>(5 * 60); // 5 min default
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isRunning || timeLeft <= 0) return;
    setIsRunning(true);
    const targetTime = Date.now() + timeLeft * 1000;

    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Toggle work / break session modes
        setMode((prevMode) => {
          const nextMode = prevMode === "work" ? "break" : "work";
          const nextDuration = nextMode === "work" ? workDuration : breakDuration;
          setTimeLeft(nextDuration);

          if (prevMode === "work") {
            setSessionCount((s) => s + 1);
          }
          return nextMode;
        });
      }
    }, 200);
  }, [isRunning, timeLeft, workDuration, breakDuration]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setMode("work");
    setTimeLeft(workDuration);
  }, [workDuration]);

  const updateDurations = useCallback((workMins: number, breakMins: number) => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const cleanWork = Math.max(1, workMins * 60);
    const cleanBreak = Math.max(1, breakMins * 60);
    setWorkDuration(cleanWork);
    setBreakDuration(cleanBreak);
    setMode("work");
    setTimeLeft(cleanWork);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentMax = mode === "work" ? workDuration : breakDuration;
  const progress = currentMax > 0 ? (timeLeft / currentMax) * 100 : 0;

  return {
    timeLeft,
    mode,
    isRunning,
    sessionCount,
    start,
    pause,
    reset,
    updateDurations,
    progress,
    workDuration,
    breakDuration};
}

// --- Formatting Helpers ---
const formatStopwatchTime = (ms: number): string => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const centi = Math.floor((ms % 1000) / 10);

  const mm = String(min).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  const cc = String(centi).padStart(2, "0");

  return `${mm}:${ss}.${cc}`;
};

const formatCountdownTime = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

// --- UI Layer: Presentation Component ---
export const Timer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"stopwatch" | "countdown" | "pomodoro">("stopwatch");

  // Stopwatch States
  const sw = useStopwatch();

  // Countdown States
  const cd = useCountdown(60);
  const [minutesInput, setMinutesInput] = useState<number>(1);
  const [secondsInput, setSecondsInput] = useState<number>(0);

  const handleApplyDuration = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSec = minutesInput * 60 + secondsInput;
    cd.setDuration(totalSec);
  };

  // Pomodoro States
  const pomo = usePomodoro();
  const [workMinsInput, setWorkMinsInput] = useState<number>(25);
  const [breakMinsInput, setBreakMinsInput] = useState<number>(5);

  const handleApplyPomodoro = (e: React.FormEvent) => {
    e.preventDefault();
    pomo.updateDurations(workMinsInput, breakMinsInput);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <TimerIcon className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Chronometer & Timing Suite</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/Timer.tsx`}
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

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "1px", marginBottom: "20px" }}>
        {(["stopwatch", "countdown", "pomodoro"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              background: activeTab === tab ? "var(--card-bg)" : "transparent",
              color: activeTab === tab ? "var(--text-h)" : "var(--text-muted)",
              border: "1px solid transparent",
              borderBottomColor: activeTab === tab ? "transparent" : "var(--border)",
              borderTopLeftRadius: "var(--border-radius)",
              borderTopRightRadius: "var(--border-radius)",
              cursor: "pointer",
              fontWeight: 600,
              outline: "none",
              textTransform: "capitalize"}}
          >
            {tab === "pomodoro" ? "Pomodoro Timer" : `${tab} Mode`}
          </button>
        ))}
      </div>

      {/* stopwatch view */}
      {activeTab === "stopwatch" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Display Card */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px"}}
          >
            <div style={{ fontSize: "3.5rem", fontFamily: "var(--font-mono)", fontWeight: "bold", color: "var(--text-h)" }}>
              {formatStopwatchTime(sw.time)}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {!sw.isRunning ? (
                <button className="btn btn-primary" onClick={sw.start}>
                  <Play size={16} /> Start
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={sw.pause}>
                  <Pause size={16} /> Pause
                </button>
              )}

              <button className="btn btn-secondary" onClick={sw.addLap} disabled={!sw.isRunning}>
                <Flag size={16} /> Lap
              </button>

              <button className="btn btn-secondary" onClick={sw.reset}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          {/* Laps List Card */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "24px",
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"}}
          >
            <h4>Lap Records ({sw.laps.length})</h4>
            {sw.laps.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexGrow: 1,
                  color: "var(--text-muted)",
                  fontSize: "0.95rem",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--border-radius)"}}
              >
                No lap intervals marked yet.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: "8px",
                  maxHeight: "240px",
                  overflowY: "auto"}}
              >
                {sw.laps.map((lap, idx) => {
                  const diff = idx === 0 ? lap : lap - sw.laps[idx - 1];
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "var(--input-bg)",
                        borderRadius: "var(--border-radius)",
                        border: "1px solid var(--border)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.9rem"}}
                    >
                      <span style={{ fontWeight: "bold" }}>Lap {idx + 1}</span>
                      <span style={{ color: "var(--text-h)" }}>{formatStopwatchTime(lap)}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>+{formatStopwatchTime(diff)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* countdown view */}
      {activeTab === "countdown" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Display & Circular Progress Card */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px"}}
          >
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="var(--border)" strokeWidth="6" fill="transparent" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={cd.timeLeft === 0 ? "var(--danger)" : "var(--text-h)"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * cd.progress) / 100}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                    transition: "stroke-dashoffset 0.3s ease"}}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"}}
              >
                <span style={{ fontSize: "2.2rem", fontFamily: "var(--font-mono)", fontWeight: "bold", color: "var(--text-h)" }}>
                  {formatCountdownTime(cd.timeLeft)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {cd.timeLeft === 0 ? "TIME'S UP" : "remaining"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {!cd.isRunning ? (
                <button className="btn btn-primary" onClick={cd.start} disabled={cd.timeLeft === 0}>
                  <Play size={16} /> Start
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={cd.pause}>
                  <Pause size={16} /> Pause
                </button>
              )}
              <button className="btn btn-secondary" onClick={cd.reset}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          {/* Settings Card */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "24px",
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"}}
          >
            <h4 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Hourglass size={18} /> Configure Duration
            </h4>

            <form onSubmit={handleApplyDuration} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(Number(e.target.value))}
                    className="text-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={secondsInput}
                    onChange={(e) => setSecondsInput(Number(e.target.value))}
                    className="text-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "6px" }}>
                <Plus size={16} /> Update Timer Duration
              </button>
            </form>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
              {[30, 60, 120, 300].map((sec) => (
                <button
                  key={sec}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                  onClick={() => {
                    setMinutesInput(Math.floor(sec / 60));
                    setSecondsInput(sec % 60);
                    cd.setDuration(sec);
                  }}
                >
                  Quick {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* pomodoro view */}
      {activeTab === "pomodoro" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Circular session status display */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px"}}
          >
            {/* Visual Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: pomo.mode === "work" ? "var(--danger)" : "var(--success)" }}>
              {pomo.mode === "work" ? <Brain size={20} className={pomo.isRunning ? "animated-pulse" : ""} /> : <Coffee size={20} />}
              <strong style={{ fontSize: "1.1rem" }}>{pomo.mode === "work" ? "WORK INTERVAL" : "BREAK TIME!"}</strong>
            </div>

            {/* Circular Timer progress */}
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="var(--border)" strokeWidth="6" fill="transparent" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={pomo.mode === "work" ? "var(--danger)" : "var(--success)"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * pomo.progress) / 100}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                    transition: "stroke-dashoffset 0.3s ease"}}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"}}
              >
                <span style={{ fontSize: "2.2rem", fontFamily: "var(--font-mono)", fontWeight: "bold", color: "var(--text-h)" }}>
                  {formatCountdownTime(pomo.timeLeft)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Session #{pomo.sessionCount + 1}
                </span>
              </div>
            </div>

            {/* Play controls */}
            <div style={{ display: "flex", gap: "12px" }}>
              {!pomo.isRunning ? (
                <button className="btn btn-primary" onClick={pomo.start}>
                  <Play size={16} /> Start Focus
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={pomo.pause}>
                  <Pause size={16} /> Pause
                </button>
              )}
              <button className="btn btn-secondary" onClick={pomo.reset}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Focus sessions completed: <strong>{pomo.sessionCount}</strong>
            </div>
          </div>

          {/* Pomodoro settings */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-bg)",
              padding: "24px",
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"}}
          >
            <h4>Pomodoro Configuration</h4>

            <form onSubmit={handleApplyPomodoro} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Work duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={workMinsInput}
                    onChange={(e) => setWorkMinsInput(Number(e.target.value))}
                    className="text-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Break duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakMinsInput}
                    onChange={(e) => setBreakMinsInput(Number(e.target.value))}
                    className="text-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "6px" }}>
                <Plus size={16} /> Update Pomodoro Settings
              </button>
            </form>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
              {[[25, 5], [50, 10], [15, 3]].map(([work, b]) => (
                <button
                  key={work}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                  onClick={() => {
                    setWorkMinsInput(work);
                    setBreakMinsInput(b);
                    pomo.updateDurations(work, b);
                  }}
                >
                  {work}/{b} Interval
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
