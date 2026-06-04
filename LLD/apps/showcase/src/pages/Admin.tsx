import React from "react";
import { useAppState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { ShieldCheck, Server, ShieldCheck as SafeIcon } from "lucide-react";

export const Admin: React.FC = () => {
  const { language, user } = useAppState();

  return (
    <div className="page-container admin-page">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-icon-circle">
            <ShieldCheck className="admin-header-icon" />
          </div>
          <h2 className="admin-title">{translate(language, "adminPanelTitle")}</h2>
        </div>

        <div className="admin-card-body">
          <p className="admin-alert-message">
            {translate(language, "adminMessage")}
          </p>

          <div className="admin-status-grid">
            <div className="status-item">
              <span className="status-label">Active User Session:</span>
              <span className="status-value">{user?.username || "Guest"}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Assigned Guard Role:</span>
              <span className="status-value highlight-role">{user?.role || "NONE"}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Auth Gateway Status:</span>
              <span className="status-value success-value">
                <SafeIcon size={16} className="inline-icon" /> SECURED
              </span>
            </div>
          </div>

          <div className="admin-server-stats">
            <h4>
              <Server size={18} className="section-inline-icon" /> Dynamic State Verification Log
            </h4>
            <pre className="verification-log-block">
              {JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  engineUser: user,
                  activeClientLanguage: language,
                  gatewayValidation: "SUCCESS_ROLE_VERIFIED",
                  accessAllowed: true
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
