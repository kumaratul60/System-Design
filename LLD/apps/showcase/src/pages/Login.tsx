import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { UserCheck, ShieldAlert, Key } from "lucide-react";

export const Login: React.FC = () => {
  const { login, language } = useAppState();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: { pathname: string } } | null;
  const redirectPath = state?.from?.pathname || "/todos";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    login(username.trim(), role);
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="page-container login-page">
      <div className="login-card">
        <div className="login-card-header">
          <div className="login-icon-circle">
            <Key className="login-header-icon" />
          </div>
          <h2 className="login-title">{translate(language, "loginTitle")}</h2>
          <p className="login-subtitle">{translate(language, "loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={translate(language, "usernamePlaceholder")}
              className="text-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Security Role</label>
            <div className="role-selection-grid">
              <label className={`role-option-card ${role === "USER" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={role === "USER"}
                  onChange={() => setRole("USER")}
                  className="sr-only"
                />
                <UserCheck className="role-icon" />
                <span className="role-name">{translate(language, "roleUser")}</span>
                <span className="role-badge badge-user">USER</span>
              </label>

              <label className={`role-option-card ${role === "ADMIN" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === "ADMIN"}
                  onChange={() => setRole("ADMIN")}
                  className="sr-only"
                />
                <ShieldAlert className="role-icon" />
                <span className="role-name">{translate(language, "roleAdmin")}</span>
                <span className="role-badge badge-admin">ADMIN</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block submit-login-btn">
            {translate(language, "loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
};
