import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminSession } from '../../services/adminService';

export default function ProtectedRoute({ allowedRole, children }) {
  const { currentUser } = useAuth();
  const adminUser = getAdminSession();
  const location = useLocation();

  // If an Admin is logged in, they belong exclusively in the Admin Portal (/admin)
  // They cannot navigate to patient or doctor portals
  if (adminUser) {
    return <Navigate to="/admin" replace />;
  }

  // Regular user check
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Cross-role guard: patient cannot visit doctor dashboard, doctor cannot visit patient dashboard
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return children;
}
