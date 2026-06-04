import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppState } from "@statelab/state-engines";

interface RouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user } = useAppState();
  const location = useLocation();

  // If already logged in, redirect away from login page to todos
  if (user && location.pathname === "/login") {
    return <Navigate to="/todos" replace />;
  }

  return <>{children}</>;
};

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { user } = useAppState();
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PrivateRoute: React.FC<RouteProps> = ({ children }) => {
  const { user } = useAppState();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
