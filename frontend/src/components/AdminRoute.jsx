import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const AdminRoute = ({ children }) => {
  const token = useStore((state) => state.token);
  const role = useStore((state) => state.role);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'admin') {
    // If authenticated but not admin, redirect to landing
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};
