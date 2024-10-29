// PrivateRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function PrivateRoute({ children }) {
  const auth = useAuth();

  if (auth.loading) {
    // You can return a loading spinner or null here
    return null;
  }

  return auth.currentUser ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
