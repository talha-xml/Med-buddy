import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  setCurrentUser as setStoredCurrentUser,
  updateUserProfile as apiUpdateProfile,
  deleteAccount as apiDeleteAccount
} from '../services/apiService';
import { canDoctorLogin } from '../services/verificationService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUserState(null);
    setStoredCurrentUser(null);
  }, []);

  // Check login validity on initial load
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'doctor') {
        const check = canDoctorLogin(user.id);
        if (!check.allowed) {
          logout();
          setLoading(false);
          return;
        }
      }
      setUserState(user);
    }
    setLoading(false);
  }, [logout]);

  // Reactive listener for admin disable events across tabs/components
  useEffect(() => {
    const handleStatusChanged = () => {
      const active = getCurrentUser();
      if (active && active.role === 'doctor') {
        const check = canDoctorLogin(active.id);
        if (check.reason === 'disabled') {
          alert(check.message);
          logout();
          window.location.href = '/login/doctor';
        }
      }
    };

    window.addEventListener('medbuddy_doctor_status_changed', handleStatusChanged);
    return () => {
      window.removeEventListener('medbuddy_doctor_status_changed', handleStatusChanged);
    };
  }, [logout]);

  const login = async (email, password, selectedRole) => {
    // 1. Authenticate with credentials
    const user = await loginUser(email, password, selectedRole);

    // 2. If user is a doctor, verify they are allowed before establishing session
    if (user.role === 'doctor') {
      const check = canDoctorLogin(user.id);
      if (!check.allowed) {
        // Do NOT establish session
        logout();
        const err = new Error(check.message);
        err.reason = check.reason;
        err.user = user;
        throw err;
      }
    }

    // 3. Set verified & enabled session
    setStoredCurrentUser(user);
    setUserState(user);
    return user;
  };

  const register = async (userData) => {
    const user = await registerUser(userData);
    return user;
  };

  const updateProfile = async (data) => {
    if (!currentUser) return;
    const updated = await apiUpdateProfile(currentUser.id, data);
    setUserState(updated);
    return updated;
  };

  const removeAccount = async (password) => {
    if (!currentUser) return;
    const res = await apiDeleteAccount(currentUser.id, password);
    setUserState(null);
    setStoredCurrentUser(null);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        removeAccount
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
