import React, { useEffect } from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import { Sparkles, Play, Pause, ChevronRight, Settings } from "lucide-react";
import type { LightColor } from "./PropDrillingTrafficLight";

const getDuration = (color: LightColor): number => {
  if (color === "red") return 4;
  if (color === "yellow") return 1;
  return 3;
};

// --- XState FSM Machine Configuration ---
const tlFsmMachine = createMachine({
  id: "trafficLightFsm",
  initial: "red",
  context: {
    timeLeft: 4,
    isRunning: true,
  },
  states: {
    red: {
      on: {
        TICK: [
          {
            guard: ({ context }) => context.isRunning && context.timeLeft <= 1,
            target: "green",
            actions: assign({ timeLeft: () => getDuration("green") }),
          },
          {
            guard: ({ context }) => context.isRunning,
            actions: assign({ timeLeft: ({ context }) => context.timeLeft - 1 }),
          },
        ],
        FORCE_NEXT: {
          target: "green",
          actions: assign({ timeLeft: () => getDuration("green") }),
        },
        TOGGLE: {
          actions: assign({ isRunning: ({ context }) => !context.isRunning }),
        },
      },
    },
    yellow: {
      on: {
        TICK: [
          {
            guard: ({ context }) => context.isRunning && context.timeLeft <= 1,
            target: "red",
            actions: assign({ timeLeft: () => getDuration("red") }),
          },
          {
            guard: ({ context }) => context.isRunning,
            actions: assign({ timeLeft: ({ context }) => context.timeLeft - 1 }),
          },
        ],
        FORCE_NEXT: {
          target: "red",
          actions: assign({ timeLeft: () => getDuration("red") }),
        },
        TOGGLE: {
          actions: assign({ isRunning: ({ context }) => !context.isRunning }),
        },
      },
    },
    green: {
      on: {
        TICK: [
          {
            guard: ({ context }) => context.isRunning && context.timeLeft <= 1,
            target: "yellow",
            actions: assign({ timeLeft: () => getDuration("yellow") }),
          },
          {
            guard: ({ context }) => context.isRunning,
            actions: assign({ timeLeft: ({ context }) => context.timeLeft - 1 }),
          },
        ],
        FORCE_NEXT: {
          target: "yellow",
          actions: assign({ timeLeft: () => getDuration("yellow") }),
        },
        TOGGLE: {
          actions: assign({ isRunning: ({ context }) => !context.isRunning }),
        },
      },
    },
  },
  // Global transitions to override specific colors manually
  on: {
    SELECT_RED: {
      target: ".red",
      actions: assign({ timeLeft: () => getDuration("red") }),
    },
    SELECT_YELLOW: {
      target: ".yellow",
      actions: assign({ timeLeft: () => getDuration("yellow") }),
    },
    SELECT_GREEN: {
      target: ".green",
      actions: assign({ timeLeft: () => getDuration("green") }),
    },
  },
});

// --- Data Layer: Custom Hook ---
export function useXStateTrafficLightLogic() {
  const [state, send] = useMachine(tlFsmMachine);
  const activeColor = state.value as LightColor;
  const { timeLeft, isRunning } = state.context;

  useEffect(() => {
    const timer = setInterval(() => {
      send({ type: "TICK" });
    }, 1000);
    return () => clearInterval(timer);
  }, [send]);

  const handleToggle = () => send({ type: "TOGGLE" });
  const handleNext = () => send({ type: "FORCE_NEXT" });
  const handleSelectColor = (color: LightColor) => {
    if (color === "red") send({ type: "SELECT_RED" });
    else if (color === "yellow") send({ type: "SELECT_YELLOW" });
    else send({ type: "SELECT_GREEN" });
  };

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
export const XStateTrafficLight: React.FC = () => {
  const {
    activeColor,
    isRunning,
    timeLeft,
    handleToggle,
    handleNext,
    handleSelectColor,
  } = useXStateTrafficLightLogic();

  return (
    <div className="page-container traffic-light-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Settings className="todos-title-icon" />
          <h3>Traffic Light Controller (Engine 4: XState FSM)</h3>
        </div>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This controller defines an XState Finite State Machine actor whose core states are the lights themselves!
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
              <button onClick={handleToggle} className={`btn ${isRunning ? "btn-secondary" : "btn-primary"}`}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isRunning ? "Pause Loop" : "Start Loop"}</span>
              </button>
              <button onClick={handleNext} className="btn btn-secondary">
                <ChevronRight size={16} />
                <span>Force Next</span>
              </button>
            </div>

            <div className="manual-override">
              <span className="control-label">Manual Override:</span>
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
