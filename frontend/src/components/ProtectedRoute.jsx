import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function ProtectedRoute({ children }) {
  const token = useStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    // Redirect to the sign-in page, but save the current location they were trying to access
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
