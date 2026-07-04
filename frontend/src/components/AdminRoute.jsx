import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function AdminRoute({ children }) {
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    // Not an admin, redirect to landing
    return <Navigate to="/" replace />;
  }

  return children;
}
