import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute Guard:
 * - If a doctor or patient is logged in and types /admin, /login/admin, or /register/admin,
 *   they are blocked from accessing the admin portal and bounced directly back to their active dashboard.
 * - If an Admin is logged in, they see the admin portal.
 * - If an unauthenticated guest types /admin, they see the Admin Login form.
 */
export default function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If a patient or doctor is logged in, block them from /admin and bounce them back to their active dashboard
  if (currentUser) {
    const activeDashboard = currentUser.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    return <Navigate to={activeDashboard} replace state={{ from: location }} />;
  }

  // Otherwise, allow rendering the Admin Portal (or its Admin Login screen if not authenticated as admin)
  return children;
}
