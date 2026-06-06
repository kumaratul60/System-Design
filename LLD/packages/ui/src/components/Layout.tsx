import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAppState } from "@statelab/state-engines";
import type { SidebarLinkConfig } from "./Navigation";
import { FlaskConical, Sun, Moon, ExternalLink } from "lucide-react";

const GithubIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.465-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.51 11.51 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.218.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const Layout: React.FC<{ links: SidebarLinkConfig[] }> = () => {
  const { theme, setTheme } = useAppState();

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="monorepo-shell">
      {/* Top Header Navbar */}
      <header className="shell-header">
        <div className="header-container">
          <Link to="/" className="header-brand">
            <FlaskConical className="brand-icon animated-spin" />
            <span className="brand-text">Frontend Lab</span>
          </Link>
          
          <div className="header-actions">
            {/* Theme Toggle */}
            <button onClick={handleThemeToggle} className="theme-toggle-btn" aria-label="Toggle theme">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/kumaratul60"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-toggle-btn"
              title="GitHub Profile"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
            >
              <GithubIcon size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="shell-main-wrapper">
        <main className="shell-content">
          <Outlet />
        </main>

        <footer className="shell-footer">
          <div className="footer-copyright">
            <span>© 2026 Frontend Lab. All rights reserved.</span>
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

