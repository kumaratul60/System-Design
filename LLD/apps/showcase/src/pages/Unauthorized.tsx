import React from "react";
import { Link } from "react-router-dom";
import { useAppState } from "@statelab/state-engines";
import { translate } from "@statelab/theme";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const { language } = useAppState();

  return (
    <div className="page-container unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-container">
          <ShieldAlert className="unauthorized-header-icon" />
        </div>
        <h2 className="unauthorized-title">{translate(language, "unauthorizedTitle")}</h2>
        <p className="unauthorized-message">{translate(language, "unauthorizedMessage")}</p>
        <Link to="/" className="btn btn-secondary home-link-btn">
          <ArrowLeft size={18} />
          <span>{translate(language, "unauthorizedGoHome")}</span>
        </Link>
      </div>
    </div>
  );
};
