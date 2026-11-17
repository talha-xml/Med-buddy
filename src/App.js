import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import FindDoctorsPage from './pages/FindDoctorsPage';
import LocationsPage from './pages/LocationsPage';
import AboutPage from './pages/AboutPage';
import RoleSelect from './pages/auth/RoleSelect';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Terms from './pages/auth/Terms';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ViewProfile from './pages/profile/ViewProfile';
import EditProfile from './pages/profile/EditProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import GuestRoute from './components/layout/GuestRoute';
import AdminRoute from './components/layout/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/find-doctors" element={<FindDoctorsPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Role Choice Intermediary Pages (Guest only) */}
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RoleSelect />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <RoleSelect />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <RoleSelect />
              </GuestRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <GuestRoute>
                <RoleSelect />
              </GuestRoute>
            }
          />

          {/* Hidden Admin Direct URL Entry Points (Guarded by AdminRoute) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/login/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/register/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Role-Specific Registration Forms (Guest only) */}
          <Route
            path="/register/:role"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Role-Specific Login Forms (Guest only) */}
          <Route
            path="/login/:role"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          {/* Terms and Policies */}
          <Route path="/terms" element={<Terms />} />

          {/* Patient Routes (Guarded: Admin & Doctor cannot access) */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRole="patient">
                <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile/edit"
            element={
              <ProtectedRoute allowedRole="patient">
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes (Guarded: Admin & Patient cannot access) */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRole="doctor">
                <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile/edit"
            element={
              <ProtectedRoute allowedRole="doctor">
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
