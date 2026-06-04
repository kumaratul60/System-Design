import React, { createContext, useContext, useState, useEffect } from "react";
import type { AppState } from "./types";
import { usePropDrillingState } from "./1-prop-drilling/PropDrillingEngine";
import { useLocalStorageState } from "./2-local-storage/LocalStorageEngine";
import { useContextApiState, ContextProvider as ReactContextProvider } from "./3-context-api/ContextApiEngine";
import { useXStateEngine } from "./4-xstate/XStateEngine";
import { useZustandEngine } from "./5-zustand/ZustandEngine";
import { useReduxEngine, reduxStore } from "./6-redux/ReduxEngine";
import { Provider as ReduxProvider } from "react-redux";

export type EngineType = "prop-drilling" | "local-storage" | "context" | "xstate" | "zustand" | "redux";

interface EngineContextType {
  activeEngine: EngineType;
  setActiveEngine: (engine: EngineType) => void;
  state: AppState;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

const EngineManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEngine, setActiveEngineState] = useState<EngineType>(() => {
    const saved = localStorage.getItem("lld_active_engine");
    return (saved as EngineType) || "prop-drilling";
  });

  const setActiveEngine = (engine: EngineType) => {
    setActiveEngineState(engine);
    localStorage.setItem("lld_active_engine", engine);
  };

  // Instantiate all engine states unconditionally (adhering to Rule of Hooks)
  const propDrillingState = usePropDrillingState();
  const localStorageState = useLocalStorageState();
  const contextApiState = useContextApiState();
  const xstateEngineState = useXStateEngine();
  const zustandEngineState = useZustandEngine();
  const reduxEngineState = useReduxEngine();

  // Resolve active engine state
  const getActiveState = (): AppState => {
    switch (activeEngine) {
      case "prop-drilling":
        return propDrillingState;
      case "local-storage":
        return localStorageState;
      case "context":
        return contextApiState;
      case "xstate":
        return xstateEngineState;
      case "zustand":
        return zustandEngineState;
      case "redux":
        return reduxEngineState;
      default:
        return propDrillingState;
    }
  };

  const activeState = getActiveState();

  // Synchronize CSS custom properties (Theme) dynamically on the document root
  useEffect(() => {
    const root = document.documentElement;
    if (activeState.theme === "dark") {
      root.classList.add("dark");
      root.style.setProperty("--bg", "#121214");
      root.style.setProperty("--text", "#e4e4e7");
      root.style.setProperty("--text-h", "#ffffff");
      root.style.setProperty("--border", "#27272a");
      root.style.setProperty("--card-bg", "rgba(39, 39, 42, 0.5)");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--bg", "#ffffff");
      root.style.setProperty("--text", "#27272a");
      root.style.setProperty("--text-h", "#09090b");
      root.style.setProperty("--border", "#e4e4e7");
      root.style.setProperty("--card-bg", "rgba(244, 244, 245, 0.5)");
    }
  }, [activeState.theme]);

  // Synchronize the Theme and Language settings across all stores when user changes activeEngine
  useEffect(() => {
    const syncTheme = activeState.theme;
    const syncLang = activeState.language;

    // Direct mutators to keep UI consistent during engine switching
    const states = [
      propDrillingState,
      localStorageState,
      contextApiState,
      xstateEngineState,
      zustandEngineState,
      reduxEngineState
    ];

    states.forEach((s) => {
      if (s.theme !== syncTheme) s.setTheme(syncTheme);
      if (s.language !== syncLang) s.setLanguage(syncLang);
    });
  }, [
    activeEngine,
    activeState.theme,
    activeState.language,
    propDrillingState,
    localStorageState,
    contextApiState,
    xstateEngineState,
    zustandEngineState,
    reduxEngineState
  ]);

  // Synchronize the authenticated user state across all stores
  useEffect(() => {
    const syncUser = activeState.user;

    const states = [
      propDrillingState,
      localStorageState,
      contextApiState,
      xstateEngineState,
      zustandEngineState,
      reduxEngineState
    ];

    states.forEach((s) => {
      if (syncUser) {
        if (!s.user || s.user.username !== syncUser.username || s.user.role !== syncUser.role) {
          s.login(syncUser.username, syncUser.role);
        }
      } else {
        if (s.user !== null) {
          s.logout();
        }
      }
    });
  }, [
    activeState.user,
    propDrillingState,
    localStorageState,
    contextApiState,
    xstateEngineState,
    zustandEngineState,
    reduxEngineState
  ]);

  return (
    <EngineContext.Provider value={{ activeEngine, setActiveEngine, state: activeState }}>
      {children}
    </EngineContext.Provider>
  );
};

// Root provider wrapping Context and Redux providers
export const EngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider store={reduxStore}>
      <ReactContextProvider>
        <EngineManagerProvider>
          {children}
        </EngineManagerProvider>
      </ReactContextProvider>
    </ReduxProvider>
  );
};

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error("useEngine must be used within an EngineProvider");
  }
  return context;
};

export const useAppState = (): AppState => {
  const { state } = useEngine();
  return state;
};
