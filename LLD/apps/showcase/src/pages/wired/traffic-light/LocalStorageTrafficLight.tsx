import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Play, Pause, ChevronRight, Settings } from "lucide-react";
import type { LightColor } from "./PropDrillingTrafficLight";

// --- Data Layer: Custom Hook ---
export function useLocalStorageTrafficLightLogic() {
  const [activeColor, setActiveColor] = useState<LightColor>(() => {
    const saved = localStorage.getItem("lld_tl_color");
    return (saved as LightColor) || "red";
  });

  const [isRunning, setIsRunning] = useState<boolean>(() => {
    const saved = localStorage.getItem("lld_tl_running");
    return saved !== "false";
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem("lld_tl_time");
    return saved ? parseInt(saved, 10) : 4;
  });

  // Save to storage
  useEffect(() => {
    localStorage.setItem("lld_tl_color", activeColor);
    localStorage.setItem("lld_tl_running", isRunning.toString());
    localStorage.setItem("lld_tl_time", timeLeft.toString());
  }, [activeColor, isRunning, timeLeft]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lld_tl_color" && e.newValue) {
        setActiveColor(e.newValue as LightColor);
      }
      if (e.key === "lld_tl_running" && e.newValue) {
        setIsRunning(e.newValue !== "false");
      }
      if (e.key === "lld_tl_time" && e.newValue) {
        setTimeLeft(parseInt(e.newValue, 10));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const nextColor = useCallback((current: LightColor): LightColor => {
    if (current === "green") return "yellow";
    if (current === "yellow") return "red";
    return "green";
  }, []);

  const getDuration = useCallback((color: LightColor): number => {
    if (color === "red") return 4;
    if (color === "yellow") return 1;
    return 3;
  }, []);

  // Timer loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const next = nextColor(activeColor);
          setActiveColor(next);
          return getDuration(next);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, activeColor, nextColor, getDuration]);

  const handleToggle = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      localStorage.setItem("lld_tl_running", next.toString());
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    const next = nextColor(activeColor);
    setActiveColor(next);
    const duration = getDuration(next);
    setTimeLeft(duration);
    localStorage.setItem("lld_tl_color", next);
    localStorage.setItem("lld_tl_time", duration.toString());
  }, [activeColor, nextColor, getDuration]);

  const handleSelectColor = useCallback((color: LightColor) => {
    setActiveColor(color);
    const duration = getDuration(color);
    setTimeLeft(duration);
    localStorage.setItem("lld_tl_color", color);
    localStorage.setItem("lld_tl_time", duration.toString());
  }, [getDuration]);

  return {
    activeColor,
    isRunning,
    timeLeft,
    handleToggle,
    handleNext,
    handleSelectColor,
  };
}

// --- UI Presentation Component ---
export const LocalStorageTrafficLight: React.FC = () => {
  const {
    activeColor,
    isRunning,
    timeLeft,
    handleToggle,
    handleNext,
    handleSelectColor,
  } = useLocalStorageTrafficLightLogic();

  return (
    <div className="page-container traffic-light-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Settings className="todos-title-icon" />
          <h3>Traffic Light Controller (Engine 2: LocalStorage Sync)</h3>
        </div>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Open this page in multiple windows: they will cycle color frames in perfect real-time synchronization!
        </p>
      </div>

      <div className="traffic-light-layout-grid">
        <div className="traffic-light-card flex-center">
          <div className="traffic-light-housing">
            <div className={`light-bulb red-bulb ${activeColor === "red" ? "active" : ""}`} />
            <div className={`light-bulb yellow-bulb ${activeColor === "yellow" ? "active" : ""}`} />
            <div className={`light-bulb green-bulb ${activeColor === "green" ? "active" : ""}`} />
          </div>
        </div>

        <div className="traffic-light-details">
          <div className="traffic-light-timer">
            <div className="timer-badge">
              <span className="timer-label">Sync Remaining:</span>
              <span className="timer-count">{timeLeft}s</span>
            </div>
            <div className="progress-bar-wrapper">
              <div
                className={`progress-bar-fill progress-bar-${activeColor}`}
                style={{ width: `${(timeLeft / (activeColor === "red" ? 4 : activeColor === "yellow" ? 1 : 3)) * 100}%` }}
              />
            </div>
          </div>

          <div className="traffic-light-controls">
            <div className="button-group">
              <button onClick={handleToggle} className={`btn ${isRunning ? "btn-secondary" : "btn-primary"}`}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isRunning ? "Pause Sync" : "Start Sync"}</span>
              </button>
              <button onClick={handleNext} className="btn btn-secondary">
                <ChevronRight size={16} />
                <span>Force Next</span>
              </button>
            </div>

            <div className="manual-override">
              <span className="control-label">Sync Manual Override:</span>
              <div className="override-buttons">
                <button onClick={() => handleSelectColor("red")} className="btn btn-danger-outline btn-sm">Red</button>
                <button onClick={() => handleSelectColor("yellow")} className="btn btn-warning-outline btn-sm">Yellow</button>
                <button onClick={() => handleSelectColor("green")} className="btn btn-success-outline btn-sm">Green</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
