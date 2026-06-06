import React, { useState, useEffect } from "react";
import { translate } from "@statelab/theme";
import { useAppState } from "@statelab/state-engines";
import { Palette, Sun, Moon, Info, Zap, AlertCircle, Code} from "lucide-react";

// --- Data Layer: Custom Hook ---
export function useThemeSwitchLogic() {
  const { theme, setTheme } = useAppState();
  const [chaosMode, setChaosMode] = useState(() => {
    try {
      return localStorage.getItem("lld_chaos_mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("lld_chaos_mode", String(chaosMode));
  }, [chaosMode]);

  // Capture event listener at window level for Chaos Mode
  useEffect(() => {
    if (!chaosMode) return;

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if target is or resides inside a button or clickable link
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']")
      ) {
        setTheme(theme === "light" ? "dark" : "light");
      }
    };

    // Use { capture: true } to trigger handler during CAPTURE phase before normal bubble/stopProp blocks
    window.addEventListener("click", handleWindowClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleWindowClick, { capture: true });
    };
  }, [chaosMode, theme, setTheme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return {
    theme,
    setTheme,
    chaosMode,
    setChaosMode,
    toggleTheme};
}

// --- UI Presentation Component ---
export const ThemeSwitchShowcase: React.FC = () => {
  const { theme, chaosMode, setChaosMode, toggleTheme } = useThemeSwitchLogic();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="todos-card-header">
        <div className="todos-header-title">
          <Palette className="todos-title-icon" style={{ color: "var(--text-h)" }} />
          <h3>Interactive Theme Playground</h3>
                    <a
            href={`https://github.com/kumaratul60/System-Design/blob/main/LLD/apps/showcase/src/pages/interview/ThemeSwitchShowcase.tsx`}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Play zone */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"}}
        >
          <h4>Toggle Widgets</h4>

          {/* Widget 1: Neon sliding button */}
          <div
            style={{
              padding: "16px",
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"}}
          >
            <div>
              <strong style={{ display: "block", color: "var(--text-h)" }}>Neon Sliding Toggle</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Smooth sliding slider switch</span>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                width: "60px",
                height: "32px",
                borderRadius: "16px",
                background: theme === "light" ? "var(--border)" : "var(--primary)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.3s",
                padding: 0}}
              aria-label="Toggle theme sliding"
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  position: "absolute",
                  top: "4px",
                  left: theme === "light" ? "4px" : "32px",
                  transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"}}
              />
            </button>
          </div>

          {/* Widget 2: 3D Skeuomorphic Toggle */}
          <div
            style={{
              padding: "16px",
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"}}
          >
            <div>
              <strong style={{ display: "block", color: "var(--text-h)" }}>3D Push Switch</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Depresses and changes depth on toggle</span>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: theme === "light" ? "linear-gradient(135deg, #ffffff, #e0e0e0)" : "linear-gradient(135deg, #374151, #1f2937)",
                color: "var(--text-h)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                boxShadow: theme === "light" 
                  ? "0 4px 0 #b0b0b0, 0 4px 8px rgba(0,0,0,0.15)"
                  : "0 4px 0 #111827, 0 4px 8px rgba(0,0,0,0.3)",
                fontWeight: "bold",
                outline: "none",
                transition: "all 0.1s",
                transform: "translateY(0px)"}}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(4px)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = theme === "light" 
                  ? "0 4px 0 #b0b0b0, 0 4px 8px rgba(0,0,0,0.15)"
                  : "0 4px 0 #111827, 0 4px 8px rgba(0,0,0,0.3)";
              }}
              aria-label="Toggle theme push button"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                <span>{theme === "light" ? "DARK" : "LIGHT"}</span>
              </div>
            </button>
          </div>

          {/* Chaos Mode Toggle */}
          <div
            style={{
              padding: "20px",
              border: `2px dashed ${chaosMode ? "var(--warning)" : "var(--border)"}`,
              borderRadius: "var(--border-radius)",
              background: chaosMode ? "rgba(245, 158, 11, 0.05)" : "transparent",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              transition: "all 0.3s"}}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--warning)" }}>
              <Zap size={18} className={chaosMode ? "animated-pulse" : ""} />
              <h5 style={{ margin: 0, fontWeight: "bold" }}>Chaos Mode Easter Egg</h5>
            </div>

            <p style={{ fontSize: "0.85rem", margin: 0, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Enable this setting to wire up a window-level event capture listener. 
              <strong> Clicking ANY button, link, or tab anywhere in the entire application will switch the theme!</strong>
            </p>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={chaosMode}
                onChange={(e) => setChaosMode(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "var(--warning)" }}
              />
              <strong style={{ fontSize: "0.9rem", color: "var(--text-h)" }}>Enable Global Chaos Mode</strong>
            </label>
          </div>
        </div>

        {/* Informative pane */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--border-radius)",
            background: "var(--card-bg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"}}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Info size={18} style={{ color: "var(--primary)" }} />
            <h4 style={{ margin: 0 }}>LLD Architecture Details</h4>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
            In frontend LLD interviews, event propagation is a frequent topic. 
            This playground demonstrates the differences between event phases:
          </p>

          <div style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontSize: "0.9rem" }}>
                <AlertCircle size={14} /> 1. Capture Phase (High Priority)
              </strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0 18px", lineHeight: 1.4 }}>
                Events descend from the `window` node down to the target node. By registering the Chaos listener with `useCapture: true`, we intercept clicks before any standard button handlers can call `stopPropagation()`.
              </p>
            </div>

            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontSize: "0.9rem" }}>
                <AlertCircle size={14} /> 2. Target Phase
              </strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0 18px", lineHeight: 1.4 }}>
                The event reaches the target DOM element (the exact button clicked) and fires target-registered callback listeners.
              </p>
            </div>

            <div>
              <strong style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontSize: "0.9rem" }}>
                <AlertCircle size={14} /> 3. Bubbling Phase (Default)
              </strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0 18px", lineHeight: 1.4 }}>
                The event bubbles back up from the target to the root node. Traditional React event handling resolves during this phase.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeSwitchShowcase;
