import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppState } from "@statelab/state-engines";
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
  const { theme, setTheme, user, logout } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
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
    const label = link.labelKey ? translate(link.labelKey) : "";
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
              {!isCollapsed && <span>{link.labelKey ? translate(link.labelKey) : ""}</span>}
            </Link>
          );
        })}
      </nav>

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
            <button onClick={handleLogout} className="logout-btn" title={translate("navLogout")}>
              <LogOut size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
