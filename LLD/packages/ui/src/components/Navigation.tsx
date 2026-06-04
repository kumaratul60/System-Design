import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEngine, useAppState } from "@statelab/state-engines";
import type { EngineType, Language } from "@statelab/state-engines";
import { translate, translations } from "@statelab/theme";
import { Sun, Moon, LogOut, Cpu, Key, ChevronLeft, ChevronRight, Search, ExternalLink } from "lucide-react";

export interface SidebarLinkConfig {
  path: string;
  labelKey?: keyof typeof translations.en;
  icon?: React.ComponentType<{ size?: number }>;
}

export interface NavigationProps {
  links: SidebarLinkConfig[];
}

export const Navigation: React.FC<NavigationProps> = ({ links }) => {
  const { activeEngine, setActiveEngine } = useEngine();
  const { theme, setTheme, language, setLanguage, user, logout } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleEngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveEngine(e.target.value as EngineType);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const expandAndFocusSearch = () => {
    setIsCollapsed(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Filter links dynamically
  const filteredLinks = links.filter((link) => {
    if (!searchQuery.trim()) return true;
    const label = link.labelKey ? translate(language, link.labelKey) : "";
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Language dropdown is locked (disabled) for standard logged-in USER role, unlocked for ADMIN and guests.
  const isLangDisabled = user !== null && user.role !== "ADMIN";

  return (
    <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <Cpu className="brand-icon animated-spin" />
        {!isCollapsed && <span className="brand-text">LLD StateLab</span>}
        <button onClick={toggleCollapse} className="collapse-toggle-btn" aria-label="Toggle Sidebar">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Search Bar */}
      {isCollapsed ? (
        <button onClick={expandAndFocusSearch} className="sidebar-search-collapsed-btn" title="Search features">
          <Search size={18} />
        </button>
      ) : (
        <div className="sidebar-search">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* JS Editor External Link */}
      {isCollapsed ? (
        <a
          href="https://runlet.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-js-editor-icon"
          title="JS Editor"
        >
          <ExternalLink size={18} />
        </a>
      ) : (
        <a
          href="https://runlet.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-js-editor-link"
        >
          <ExternalLink size={14} />
          <span>JS Editor</span>
        </a>
      )}

      <nav className="sidebar-links">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? "active" : ""}
            >
              {Icon && <Icon size={18} />}
              {!isCollapsed && <span>{link.labelKey ? translate(language, link.labelKey) : ""}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Controls (Hidden when collapsed) */}
      {!isCollapsed && (
        <div className="sidebar-controls">
          {/* Active Engine */}
          <div className="control-group">
            <label className="control-label">{translate(language, "engineSelectorLabel")}</label>
            <select
              value={activeEngine}
              onChange={handleEngineChange}
              className="select-input engine-select select-block"
            >
              <option value="prop-drilling">1. Prop Drilling</option>
              <option value="local-storage">2. LocalStorage Sync</option>
              <option value="context">3. Context API</option>
              <option value="xstate">4. XState (FSM)</option>
              <option value="zustand">5. Zustand</option>
              <option value="redux">6. Redux Toolkit</option>
            </select>
          </div>

          {/* Language */}
          <div className="control-group">
            <label className="control-label">
              {translate(language, "language")} 
              {isLangDisabled && <span className="locked-badge"> ({translate(language, "langLockedTip")})</span>}
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={isLangDisabled}
              className={`select-input lang-select select-block ${isLangDisabled ? "disabled-lock" : ""}`}
              title={isLangDisabled ? translate(language, "langLockedTip") : ""}
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="hi">हिन्दी (HI)</option>
            </select>
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button onClick={handleThemeToggle} className="theme-toggle-btn" aria-label="Toggle theme">
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user ? (
          <div className="sidebar-user">
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-title" title={user.username}>{user.username}</span>
                <span className="user-role-badge">{user.role}</span>
              </div>
            )}
            <button onClick={handleLogout} className="logout-btn" title={translate(language, "navLogout")}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-secondary login-btn-sidebar" title={translate(language, "navLogin")}>
            <Key size={16} />
            {!isCollapsed && <span>{translate(language, "navLogin")}</span>}
          </Link>
        )}
      </div>
    </aside>
  );
};
