import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const ProtectedRoute = ({ children }) => {
  const token = useStore((state) => state.token);

  if (!token) {
    // Redirect to Auth page if not logged in
    return <Navigate to="/auth" replace />;
  }

  return children ? children : <Outlet />;
};
