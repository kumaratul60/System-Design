import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import type { SidebarLinkConfig } from "./Navigation";
import { useEngine } from "@statelab/state-engines";
import { Info, ExternalLink } from "lucide-react";

export const Layout: React.FC<{ links: SidebarLinkConfig[] }> = ({ links }) => {
  const { activeEngine } = useEngine();

  // Engine information descriptions mapped dynamically
  const getEngineDescription = () => {
    switch (activeEngine) {
      case "prop-drilling":
        return {
          title: "Engine 1: Prop Drilling Approach",
          desc: "Raw React state (`useState`) resides in the root manager. State and callbacks are explicitly threaded down through props. Shows high structural coupling but requires zero external packages.",
          diagram: "Root App -> Layout -> Routes -> Page -> Components"
        };
      case "local-storage":
        return {
          title: "Engine 2: LocalStorage Persist & Sync",
          desc: "Synchronizes internal React states with browser localStore. Employs window storage listeners to automatically replicate and update state changes across different open tabs/windows in real time.",
          diagram: "UI Event -> Write to LocalStorage -> Window Storage Event -> Synced across Tabs"
        };
      case "context":
        return {
          title: "Engine 3: React Context API",
          desc: "Employs native React Context Providers to distribute states directly to consumer hooks. Eliminates prop drilling, but updates to any context value will trigger re-renders in all subscribing consumers.",
          diagram: "Context Provider -> Context Bus -> direct consumer hook hookups"
        };
      case "xstate":
        return {
          title: "Engine 4: XState Finite State Machine (FSM)",
          desc: "Enforces strict mathematical state boundaries. The application transitions between discrete states (idle, fetching) in response to strict event actions, avoiding invalid runtime configurations.",
          diagram: "State [idle] -> Event [FETCH_START] -> State [fetching] -> Event [FETCH_SUCCESS]"
        };
      case "zustand":
        return {
          title: "Engine 5: Zustand Atomic Store",
          desc: "Creates a fast, atomic Flux-based state container in a closure outside the React render cycle. Uses hook selectors to subscribe only to specific state changes, avoiding unnecessary renders.",
          diagram: "Action Dispatcher -> Zustand State Closure -> Selector Observer -> Direct Component Re-render"
        };
      case "redux":
        return {
          title: "Engine 6: Redux Toolkit (RTK)",
          desc: "The industry standard for clean unidirectional data flow. Dispatches payload actions to slices, recalculating next state trees using pure reducers and broadcasting via hook selectors.",
          diagram: "Component -> Action Creator -> Dispatch -> Reducer Slices -> Store -> useSelector"
        };
      default:
        return { title: "", desc: "", diagram: "" };
    }
  };

  const info = getEngineDescription();

  return (
    <div className="monorepo-shell">
      {/* Sidebar Navigation */}
      <Navigation links={links} />

      {/* Main Content Area */}
      <div className="shell-main-wrapper">
        <main className="shell-content">
          <Outlet />
        </main>

        <footer className="shell-footer">
          <div className="engine-info-banner">
            <div className="banner-content">
              <h4 className="banner-title">
                <Info size={16} />{info.title}
              </h4>
              <p className="banner-desc">{info.desc}</p>
              <div className="banner-diagram">
                <span className="diagram-label">Data Flow Outline:</span>
                <code>{info.diagram}</code>
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            <span>© {new Date().getFullYear()} LLD StateLab. Developed under SystemDesign laboratory context.</span>
            <a
              href="https://runlet.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <span>JS Editor</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
