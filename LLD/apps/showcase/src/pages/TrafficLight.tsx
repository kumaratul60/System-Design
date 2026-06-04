import React from "react";
import { useEngine } from "@statelab/state-engines";
import { PropDrillingTrafficLight } from "./wired/traffic-light/PropDrillingTrafficLight";
import { LocalStorageTrafficLight } from "./wired/traffic-light/LocalStorageTrafficLight";
import { ContextTrafficLight } from "./wired/traffic-light/ContextTrafficLight";
import { XStateTrafficLight } from "./wired/traffic-light/XStateTrafficLight";
import { ZustandTrafficLight } from "./wired/traffic-light/ZustandTrafficLight";
import { ReduxTrafficLight } from "./wired/traffic-light/ReduxTrafficLight";

export const TrafficLight: React.FC = () => {
  const { activeEngine } = useEngine();

  switch (activeEngine) {
    case "prop-drilling":
      return <PropDrillingTrafficLight />;
    case "local-storage":
      return <LocalStorageTrafficLight />;
    case "context":
      return <ContextTrafficLight />;
    case "xstate":
      return <XStateTrafficLight />;
    case "zustand":
      return <ZustandTrafficLight />;
    case "redux":
      return <ReduxTrafficLight />;
    default:
      return <PropDrillingTrafficLight />;
  }
};
export default TrafficLight;
