import React from "react";
import { useAppState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { ShieldCheck, Eye, Lock, ShieldAlert } from "lucide-react";

export const Home: React.FC = () => {
  const { language } = useAppState();

  return (
    <div className="page-container home-page">
      <section className="hero-section">
        <h1 className="hero-title">{translate(language, "homeTitle")}</h1>
        <p className="hero-subtitle">{translate(language, "homeSubtitle")}</p>
        <div className="hero-card">
          <p>{translate(language, "homeIntro")}</p>
        </div>
      </section>

      <section className="routing-rules-section">
        <h3 className="section-title">
          <ShieldCheck className="section-icon" />
          {translate(language, "routingExplanationTitle")}
        </h3>
        
        <div className="routes-grid">
          <div className="route-card public-card">
            <div className="route-card-header">
              <Eye className="card-icon" />
              <h4>{translate(language, "publicRouteText").split(":")[0]}</h4>
            </div>
            <p className="card-desc">
              {translate(language, "publicRouteText").split(":")[1]}
            </p>
            <span className="route-badge badge-public">PUBLIC</span>
          </div>

          <div className="route-card protected-card">
            <div className="route-card-header">
              <Lock className="card-icon" />
              <h4>{translate(language, "protectedRouteText").split(":")[0]}</h4>
            </div>
            <p className="card-desc">
              {translate(language, "protectedRouteText").split(":")[1]}
            </p>
            <span className="route-badge badge-protected">PROTECTED</span>
          </div>

          <div className="route-card private-card">
            <div className="route-card-header">
              <ShieldAlert className="card-icon" />
              <h4>{translate(language, "privateRouteText").split(":")[0]}</h4>
            </div>
            <p className="card-desc">
              {translate(language, "privateRouteText").split(":")[1]}
            </p>
            <span className="route-badge badge-private">PRIVATE</span>
          </div>
        </div>
      </section>

      <section className="comparative-table-section">
        <h3 className="section-title">State Engines Architecture Matrix</h3>
        <div className="table-responsive">
          <table className="architecture-table">
            <thead>
              <tr>
                <th>State Management Engine</th>
                <th>Underlying Concept</th>
                <th>Boilerplate Scale</th>
                <th>Re-render Performance</th>
                <th>Ideal Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Prop Drilling</strong></td>
                <td>Raw state parameters passed down via intermediate nodes</td>
                <td>Low (Zero extra setup)</td>
                <td>Low (Parent resets force children re-renders)</td>
                <td>Simple prototypes, atomic features</td>
              </tr>
              <tr>
                <td><strong>2. LocalStorage Sync</strong></td>
                <td>Browser persisted storage synchronizations</td>
                <td>Low (Custom hooks & listeners)</td>
                <td>Medium (Synchronous parse-write blocks)</td>
                <td>Offline-ready state, preferences caching</td>
              </tr>
              <tr>
                <td><strong>3. Context API</strong></td>
                <td>React's native dependency injection bus</td>
                <td>Medium (Context definition & Providers)</td>
                <td>Medium (Context resets re-render all consumers)</td>
                <td>Auth status, language settings, simple global states</td>
              </tr>
              <tr>
                <td><strong>4. XState (FSM)</strong></td>
                <td>Finite State Machine mathematical transitions</td>
                <td>High (States, events, machine configs)</td>
                <td>High (Updates occur strictly on state events)</td>
                <td>Complex state machines, validation forms, checkouts</td>
              </tr>
              <tr>
                <td><strong>5. Zustand</strong></td>
                <td>Hook-based external store closures</td>
                <td>Very Low (Boomerang-free setup)</td>
                <td>Excellent (Reacts strictly to selected keys)</td>
                <td>Performance critical SPAs, rapid feature development</td>
              </tr>
              <tr>
                <td><strong>6. Redux Toolkit</strong></td>
                <td>Standard single state tree unidirectional updates</td>
                <td>High (Slices, reducers, stores, dispatchers)</td>
                <td>Excellent (useSelector maps direct dependencies)</td>
                <td>Large scale enterprise systems, extensive devtools logs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
