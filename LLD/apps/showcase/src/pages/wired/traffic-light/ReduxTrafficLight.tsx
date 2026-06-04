import React, { useEffect } from "react";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Sparkles, Play, Pause, ChevronRight, Settings } from "lucide-react";
import type { LightColor } from "./PropDrillingTrafficLight";

interface TrafficLightSliceState {
  activeColor: LightColor;
  isRunning: boolean;
  timeLeft: number;
}

const initialState: TrafficLightSliceState = {
  activeColor: "red",
  isRunning: true,
  timeLeft: 4,
};

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

// Slice
const trafficLightSlice = createSlice({
  name: "trafficLight",
  initialState,
  reducers: {
    toggleLoop: (state) => {
      state.isRunning = !state.isRunning;
    },
    forceNext: (state) => {
      state.activeColor = nextColor(state.activeColor);
      state.timeLeft = getDuration(state.activeColor);
    },
    selectColor: (state, action) => {
      state.activeColor = action.payload;
      state.timeLeft = getDuration(action.payload);
    },
    tick: (state) => {
      if (!state.isRunning) return;
      if (state.timeLeft <= 1) {
        state.activeColor = nextColor(state.activeColor);
        state.timeLeft = getDuration(state.activeColor);
      } else {
        state.timeLeft -= 1;
      }
    },
  },
});

// Configure Store
const localTrafficStore = configureStore({
  reducer: {
    trafficStore: trafficLightSlice.reducer,
  },
});

type LocalTrafficRootState = ReturnType<typeof localTrafficStore.getState>;

// --- Data Layer: Custom Hook ---
export function useReduxTrafficLightLogic() {
  const dispatch = useDispatch();
  const activeColor = useSelector((state: LocalTrafficRootState) => state.trafficStore.activeColor);
  const isRunning = useSelector((state: LocalTrafficRootState) => state.trafficStore.isRunning);
  const timeLeft = useSelector((state: LocalTrafficRootState) => state.trafficStore.timeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(trafficLightSlice.actions.tick());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleToggle = () => dispatch(trafficLightSlice.actions.toggleLoop());
  const handleNext = () => dispatch(trafficLightSlice.actions.forceNext());
  const handleSelectColor = (color: LightColor) => dispatch(trafficLightSlice.actions.selectColor(color));

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
const ReduxTrafficLightInner: React.FC = () => {
  const {
    activeColor,
    isRunning,
    timeLeft,
    handleToggle,
    handleNext,
    handleSelectColor,
  } = useReduxTrafficLightLogic();

  return (
    <div className="page-container traffic-light-page">
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Settings className="todos-title-icon" />
          <h3>Traffic Light Controller (Engine 6: Redux Toolkit)</h3>
        </div>
      </div>

      <div className="welcome-banner">
        <p className="welcome-text">
          <Sparkles size={16} className="inline-icon" style={{ marginRight: "8px", verticalAlign: "middle" }} />
          This controller dispatches state ticks to update a Redux action slice context.
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

export const ReduxTrafficLight: React.FC = () => {
  return (
    <Provider store={localTrafficStore}>
      <ReduxLightWrapper />
    </Provider>
  );
};

// Simple proxy element to dodge naming collissions
const ReduxLightWrapper: React.FC = () => {
  return <ReduxTrafficLightInner />;
};
