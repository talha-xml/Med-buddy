import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminSession } from '../../services/adminService';

export default function GuestRoute({ children }) {
  const { currentUser } = useAuth();
  const adminUser = getAdminSession();
  const location = useLocation();

  // If Admin is logged in, redirect them to /admin
  if (adminUser) {
    return <Navigate to="/admin" replace />;
  }

  // If already authenticated as patient or doctor, redirect to their role-appropriate dashboard
  if (currentUser) {
    const targetDashboard = currentUser.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    return <Navigate to={targetDashboard} replace state={{ from: location }} />;
  }

  return children;
}
