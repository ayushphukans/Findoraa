// PrivateRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;