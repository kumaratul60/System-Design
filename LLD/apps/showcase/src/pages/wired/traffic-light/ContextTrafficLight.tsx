import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Sparkles, Play, Pause, ChevronRight, Settings } from "lucide-react";
import type { LightColor } from "./PropDrillingTrafficLight";

interface TrafficLightContextType {
  activeColor: LightColor;
  isRunning: boolean;
  timeLeft: number;
  toggleLoop: () => void;
  forceNext: () => void;
  selectColor: (c: LightColor) => void;
}

const TrafficLightContext = createContext<TrafficLightContextType | undefined>(undefined);

// --- Custom Provider Component ---
const TrafficLightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeColor, setActiveColor] = useState<LightColor>("red");
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(4);

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

  const toggleLoop = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const forceNext = useCallback(() => {
    const next = nextColor(activeColor);
    setActiveColor(next);
    setTimeLeft(getDuration(next));
  }, [activeColor, nextColor, getDuration]);

  const selectColor = useCallback((color: LightColor) => {
    setActiveColor(color);
    setTimeLeft(getDuration(color));
  }, [getDuration]);

  return (
    <TrafficLightContext.Provider
      value={{
        activeColor,
        isRunning,
        timeLeft,
        toggleLoop,
        forceNext,
        selectColor,
      }}
    >
      {children}
    </TrafficLightContext.Provider>
  );
};

// --- Data Layer: Custom Hook ---
export function useTrafficLightContext() {
  const context = useContext(TrafficLightContext);
  if (!context) {
    throw new Error("useTrafficLightContext must be used within a TrafficLightProvider");
  }
  return context;
}

// Inner presentation layout
const ContextTrafficLightInner: React.FC = () => {
  const {
    activeColor,
    isRunning,
    timeLeft,
    toggleLoop,
    forceNext,
    selectColor,
  } = useTrafficLightContext();

  return (
    <div className="page-container traffic-light-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Settings className="todos-title-icon" />
          <h3>Traffic Light Controller (Engine 3: Context API Bus)</h3>
        </div>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This controller queries active timers and transitions through a centralized Context provider.
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
              <span className="timer-label">Time Remaining:</span>
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
              <button onClick={toggleLoop} className={`btn ${isRunning ? "btn-secondary" : "btn-primary"}`}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isRunning ? "Pause Loop" : "Start Loop"}</span>
              </button>
              <button onClick={forceNext} className="btn btn-secondary">
                <ChevronRight size={16} />
                <span>Force Next</span>
              </button>
            </div>

            <div className="manual-override">
              <span className="control-label">Manual Override:</span>
              <div className="override-buttons">
                <button onClick={() => selectColor("red")} className="btn btn-danger-outline btn-sm">Red</button>
                <button onClick={() => selectColor("yellow")} className="btn btn-warning-outline btn-sm">Yellow</button>
                <button onClick={() => selectColor("green")} className="btn btn-success-outline btn-sm">Green</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export wrapped with Provider
export const ContextTrafficLight: React.FC = () => {
  return (
    <TrafficLightProvider>
      <ContextTrafficLightInner />
    </TrafficLightProvider>
  );
};
