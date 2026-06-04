import React from "react";
import { useEngine } from "@statelab/state-engines";
import { PropDrillingTrello } from "./wired/trello/PropDrillingTrello";
import { LocalStorageTrello } from "./wired/trello/LocalStorageTrello";
import { ContextTrello } from "./wired/trello/ContextTrello";
import { XStateTrello } from "./wired/trello/XStateTrello";
import { ZustandTrello } from "./wired/trello/ZustandTrello";
import { ReduxTrello } from "./wired/trello/ReduxTrello";

export const Trello: React.FC = () => {
  const { activeEngine } = useEngine();

  switch (activeEngine) {
    case "prop-drilling":
      return <PropDrillingTrello />;
    case "local-storage":
      return <LocalStorageTrello />;
    case "context":
      return <ContextTrello />;
    case "xstate":
      return <XStateTrello />;
    case "zustand":
      return <ZustandTrello />;
    case "redux":
      return <ReduxTrello />;
    default:
      return <PropDrillingTrello />;
  }
};
export default Trello;
