import React, { useEffect } from "react";
import { translate } from "@statelab/theme";
import { create } from "zustand";
import { Sparkles, Play, Pause, ChevronRight, Settings, Code} from "lucide-react";
import type { LightColor } from "./PropDrillingTrafficLight";

interface TrafficLightState {
  activeColor: LightColor;
  isRunning: boolean;
  timeLeft: number;
  toggleLoop: () => void;
  forceNext: () => void;
  selectColor: (color: LightColor) => void;
  tick: () => void;
}

const getDuration = (color: LightColor): number => {
  if (color === "red") return 4;
  if (color === "yellow") return 1;
  return 3;
};

const nextColor = (color: LightColor): LightColor => {
  if (color === "green") return "yellow";
  if (color === "yellow") return "red";
  return "green";
};

// --- Local Zustand Store ---
const useLocalTrafficLightStore = create<TrafficLightState>((set, get) => ({
  activeColor: "red",
  isRunning: true,
  timeLeft: 4,
  toggleLoop: () => set((state) => ({ isRunning: !state.isRunning })),
  forceNext: () => {
    const next = nextColor(get().activeColor);
    set({ activeColor: next, timeLeft: getDuration(next) });
  },
  selectColor: (color) => set({ activeColor: color, timeLeft: getDuration(color) }),
  tick: () => {
    if (!get().isRunning) return;
    const currentTimer = get().timeLeft;
    if (currentTimer <= 1) {
      const next = nextColor(get().activeColor);
      set({ activeColor: next, timeLeft: getDuration(next) });
    } else {
      set({ timeLeft: currentTimer - 1 });
    }
  }}));

// --- Data Layer: Custom Hook ---
export function useZustandTrafficLightLogic() {
  const activeColor = useLocalTrafficLightStore((state) => state.activeColor);
  const isRunning = useLocalTrafficLightStore((state) => state.isRunning);
  const timeLeft = useLocalTrafficLightStore((state) => state.timeLeft);
  
  const toggleLoop = useLocalTrafficLightStore((state) => state.toggleLoop);
  const forceNext = useLocalTrafficLightStore((state) => state.forceNext);
  const selectColor = useLocalTrafficLightStore((state) => state.selectColor);
  const tick = useLocalTrafficLightStore((state) => state.tick);

  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  return {
    activeColor,
    isRunning,
    timeLeft,
    toggleLoop,
    forceNext,
    selectColor};
}

// --- UI Presentation Component ---
export const ZustandTrafficLight: React.FC = () => {
  const {
    activeColor,
    isRunning,
    timeLeft,
    toggleLoop,
    forceNext,
    selectColor} = useZustandTrafficLightLogic();

  return (
    <div className="page-container traffic-light-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Settings className="todos-title-icon" />
          <h3>Traffic Light Controller (Engine 5: Zustand Store)</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/wired/traffic-light/ZustandTrafficLight.tsx`}
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
          This controller manages the automatic state-transition ticking cleanly within an atomic store hook.
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
