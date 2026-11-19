import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GuestRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If regular user (patient or doctor) is logged in, redirect them to their active dashboard
  if (currentUser) {
    const targetDashboard = currentUser.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    return <Navigate to={targetDashboard} replace state={{ from: location }} />;
  }

  // Public / Guest user proceeds normally to /login, /register, etc.
  return children;
}
