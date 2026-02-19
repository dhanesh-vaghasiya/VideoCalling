import { Navigate } from "react-router-dom";
import { isAuthenticated, getAuthData } from "../services/auth";

/**
 * ProtectedRoute – wraps pages that need authentication and/or a specific role.
 *
 * Props
 * ─────
 *  children      – the page element to render
 *  requiredRole  – "user" | "doctor" | undefined (any authenticated user)
 *
 * Behaviour
 * ─────────
 *  • Not logged in          → redirect to /login
 *  • Logged in, wrong role  → redirect to the correct dashboard
 *  • Logged in, correct role → render the page
 *
 *  All redirects use `replace` so the browser back-button
 *  never lands on a page the user can't access.
 */
function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const { user } = getAuthData();

  // If we somehow have a token but no user object, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check – redirect to the correct dashboard if role doesn't match
  if (requiredRole && user.role !== requiredRole) {
    const dest = user.role === "doctor" ? "/doctor-dashboard" : "/dashboard";
    return <Navigate to={dest} replace />;
  }

  return children;
}

/**
 * GuestRoute – only accessible when NOT logged in.
 * If a logged-in user navigates here (e.g. via back button), they are
 * sent to their dashboard instead.
 */
function GuestRoute({ children }) {
  if (!isAuthenticated()) {
    return children;
  }

  const { user } = getAuthData();
  const dest = user?.role === "doctor" ? "/doctor-dashboard" : "/dashboard";
  return <Navigate to={dest} replace />;
}

export { ProtectedRoute, GuestRoute };
