const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CURRENT_USER_KEY = 'slotbuddy_current_user';

// Helper for API fetch
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.data = data;
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
      throw new Error(
        'Backend server is not running on port 5000. Please start it using "npm run server" or run "npm run dev".'
      );
    }
    throw err;
  }
}

// Authentication
export async function loginUser(email, password, role) {
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role })
  });
  // Do NOT store user in localStorage until all checks (verification & enabled) pass
  return result.user;
}

export async function registerUser(userData) {
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return result.user;
}

// User Profile
export async function getUserProfile(id) {
  const result = await apiRequest(`/users/${id}`);
  return result.user;
}

export async function updateUserProfile(id, updateData) {
  const result = await apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  const current = getCurrentUser();
  if (current && current.id === id) {
    setCurrentUser(result.user);
  }
  return result.user;
}

// Account Deletion
export async function deleteAccount(id, password) {
  const result = await apiRequest(`/users/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ password })
  });
  setCurrentUser(null);
  return result;
}

export async function fetchDoctors({ city, specialty, search } = {}) {
  const params = new URLSearchParams();
  if (city && city !== 'ALL') params.append('city', city);
  if (specialty && specialty !== 'ALL') params.append('specialty', specialty);
  if (search && search.trim() !== '') params.append('search', search.trim());
  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/doctors${query}`);
  return result.doctors || [];
}

// Appointments
export async function fetchAppointments({ patientId, doctorId } = {}) {
  const params = new URLSearchParams();
  if (patientId) params.append('patientId', patientId);
  if (doctorId) params.append('doctorId', doctorId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest(`/appointments${query}`);
  return result.appointments || [];
}

export async function createAppointment(appointmentData) {
  const result = await apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  });
  return result.appointment;
}

export async function updateAppointmentStatus(appointmentId, status) {
  const result = await apiRequest(`/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return result.appointment;
}

// Session persistence in browser memory/session
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}
