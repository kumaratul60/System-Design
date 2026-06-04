import React from "react";
import { useEngine } from "@statelab/state-engines";
import { PropDrillingInfiniteScroll } from "./wired/infinite-scroll/PropDrillingInfiniteScroll";
import { LocalStorageInfiniteScroll } from "./wired/infinite-scroll/LocalStorageInfiniteScroll";
import { ContextInfiniteScroll } from "./wired/infinite-scroll/ContextInfiniteScroll";
import { XStateInfiniteScroll } from "./wired/infinite-scroll/XStateInfiniteScroll";
import { ZustandInfiniteScroll } from "./wired/infinite-scroll/ZustandInfiniteScroll";
import { ReduxInfiniteScroll } from "./wired/infinite-scroll/ReduxInfiniteScroll";

export const InfiniteScroll: React.FC = () => {
  const { activeEngine } = useEngine();

  switch (activeEngine) {
    case "prop-drilling":
      return <PropDrillingInfiniteScroll />;
    case "local-storage":
      return <LocalStorageInfiniteScroll />;
    case "context":
      return <ContextInfiniteScroll />;
    case "xstate":
      return <XStateInfiniteScroll />;
    case "zustand":
      return <ZustandInfiniteScroll />;
    case "redux":
      return <ReduxInfiniteScroll />;
    default:
      return <PropDrillingInfiniteScroll />;
  }
};
