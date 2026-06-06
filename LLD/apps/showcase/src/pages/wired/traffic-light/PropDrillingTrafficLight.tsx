import React, { useState, useEffect, useCallback } from "react";
import { translate } from "@statelab/theme";
import { Sparkles, Play, Pause, ChevronRight, Settings, Code} from "lucide-react";

// --- Types & Interfaces ---
export type LightColor = "green" | "yellow" | "red";

interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onNext: () => void;
  onSelectColor: (c: LightColor) => void;
}

interface TimerProps {
  timeLeft: number;
  activeColor: LightColor;
}

// --- Data Layer: Custom Hook ---
export function usePropDrillingTrafficLightLogic() {
  const [activeColor, setActiveColor] = useState<LightColor>("red");
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(4); // Red is 4s, Yellow is 1s, Green is 3s

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
    setIsRunning((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    const next = nextColor(activeColor);
    setActiveColor(next);
    setTimeLeft(getDuration(next));
  }, [activeColor, nextColor, getDuration]);

  const handleSelectColor = useCallback((color: LightColor) => {
    setActiveColor(color);
    setTimeLeft(getDuration(color));
  }, [getDuration]);

  return {
    activeColor,
    isRunning,
    timeLeft,
    handleToggle,
    handleNext,
    handleSelectColor,
    getDuration};
}

// --- UI Presentation Components ---

const TrafficLightDisplay: React.FC<{ activeColor: LightColor }> = ({ activeColor }) => {
  return (
    <div className="traffic-light-housing">
      <div className={`light-bulb red-bulb ${activeColor === "red" ? "active" : ""}`} />
      <div className={`light-bulb yellow-bulb ${activeColor === "yellow" ? "active" : ""}`} />
      <div className={`light-bulb green-bulb ${activeColor === "green" ? "active" : ""}`} />
    </div>
  );
};

const LightControls: React.FC<ControlsProps> = ({ isRunning, onToggle, onNext, onSelectColor }) => {
  return (
    <div className="traffic-light-controls">
      <div className="button-group">
        <button onClick={onToggle} className={`btn ${isRunning ? "btn-secondary" : "btn-primary"}`}>
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          <span>{isRunning ? "Pause Loop" : "Start Loop"}</span>
        </button>
        <button onClick={onNext} className="btn btn-secondary">
          <ChevronRight size={16} />
          <span>Force Next</span>
        </button>
      </div>

      <div className="manual-override">
        <span className="control-label">Manual Override:</span>
        <div className="override-buttons">
          <button onClick={() => onSelectColor("red")} className="btn btn-danger-outline btn-sm">Red</button>
          <button onClick={() => onSelectColor("yellow")} className="btn btn-warning-outline btn-sm">Yellow</button>
          <button onClick={() => onSelectColor("green")} className="btn btn-success-outline btn-sm">Green</button>
        </div>
      </div>
    </div>
  );
};

const LightTimer: React.FC<TimerProps> = ({ timeLeft, activeColor }) => {
  return (
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
  );
};

export const PropDrillingTrafficLight: React.FC = () => {
  const {
    activeColor,
    isRunning,
    timeLeft,
    handleToggle,
    handleNext,
    handleSelectColor} = usePropDrillingTrafficLightLogic();

  return (
    <div className="page-container traffic-light-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Settings className="todos-title-icon" />
          <h3>Traffic Light Controller (Engine 1: Prop Drilling)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/traffic-light/PropDrillingTrafficLight.tsx`}
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

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This feature models finite state transitions and automatic interval loops threaded through props.
        </p>
      </div>

      <div className="traffic-light-layout-grid">
        <div className="traffic-light-card flex-center">
          <TrafficLightDisplay activeColor={activeColor} />
        </div>

        <div className="traffic-light-details">
          <LightTimer timeLeft={timeLeft} activeColor={activeColor} />
          <LightControls
            isRunning={isRunning}
            onToggle={handleToggle}
            onNext={handleNext}
            onSelectColor={handleSelectColor}
          />
        </div>
      </div>
    </div>
  );
};
