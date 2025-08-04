import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function PrivateRoute({ children, requireAuth = true }: PrivateRouteProps) {
  const { user, loading, isProfileComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user && requireAuth) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but profile incomplete (except for profile page)
  if (user && !isProfileComplete && location.pathname !== '/profile') {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}