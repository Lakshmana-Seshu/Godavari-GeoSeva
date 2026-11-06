import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Verifying authentication credentials..." size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-slate-200 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            Your account ({user?.role}) does not have administrative clearance to access this module.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-teal-800 text-white rounded-lg text-sm font-semibold hover:bg-teal-900 transition-colors"
          >
            Return to Public Portal
          </a>
        </div>
      </div>
    );
  }

  return children;
};
