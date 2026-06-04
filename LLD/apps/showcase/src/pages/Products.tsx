import React from "react";
import { useEngine, useAppState } from "@statelab/state-engines";
import { PropDrillingProduct } from "./wired/products/PropDrillingProduct";
import { LocalStorageProduct } from "./wired/products/LocalStorageProduct";
import { ContextProduct } from "./wired/products/ContextProduct";
import { XStateProduct } from "./wired/products/XStateProduct";
import { ZustandProduct } from "./wired/products/ZustandProduct";
import { ReduxProduct } from "./wired/products/ReduxProduct";

export const Products: React.FC = () => {
  const { activeEngine } = useEngine();
  const { user, language } = useAppState();

  switch (activeEngine) {
    case "prop-drilling":
      return <PropDrillingProduct user={user} language={language} />;
    case "local-storage":
      return <LocalStorageProduct user={user} language={language} />;
    case "context":
      return <ContextProduct user={user} language={language} />;
    case "xstate":
      return <XStateProduct user={user} language={language} />;
    case "zustand":
      return <ZustandProduct user={user} language={language} />;
    case "redux":
      return <ReduxProduct user={user} language={language} />;
    default:
      return <PropDrillingProduct user={user} language={language} />;
  }
};
