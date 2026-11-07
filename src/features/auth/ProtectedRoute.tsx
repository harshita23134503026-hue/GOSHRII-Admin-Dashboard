import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { AdminRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If specified, only these roles may access this route. Unauthenticated users
   *  are always redirected to /login regardless of this setting. */
  allowedRoles?: AdminRole[];
}

/**
 * Wraps any route that requires authentication and optionally a specific role.
 * - Unauthenticated → redirected to /login
 * - Authenticated but wrong role → redirected to /dashboard (not a 404)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, admin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
    // Role not permitted — send to dashboard silently
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
