import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  setCurrentUser as setStoredCurrentUser,
  updateUserProfile as apiUpdateProfile,
  deleteAccount as apiDeleteAccount
} from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUserState(null);
    setStoredCurrentUser(null);
  }, []);

  // Initial load check
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserState(user);
    }
    setLoading(false);
  }, []);

  // Reactive listener for admin status update events across tabs/components
  useEffect(() => {
    const handleStatusChanged = () => {
      const active = getCurrentUser();
      if (active && active.role === 'doctor') {
        // Re-read current user in case state was updated
        setUserState({ ...active });
      }
    };

    window.addEventListener('medbuddy_doctor_status_changed', handleStatusChanged);
    return () => {
      window.removeEventListener('medbuddy_doctor_status_changed', handleStatusChanged);
    };
  }, []);

  const login = async (email, password, selectedRole) => {
    // 1. Authenticate with credentials (both enabled and disabled doctors can log in)
    const user = await loginUser(email, password, selectedRole);

    // 2. Set session
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
