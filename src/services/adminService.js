// Admin Auth and Session Service (Frontend only)
// Uses sessionStorage so admin session is transient to the browser tab/session
// and NEVER persists across closing and reopening or bleeds into public portal sign-in.
const ADMIN_STORAGE_KEY = 'medbuddy_admin_auth';

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'admin@medbuddy.healthcare',
  password: 'admin123',
  fullName: 'Super Administrator',
  role: 'admin'
};

export function getAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminSession(adminData) {
  if (adminData) {
    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
  } else {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

export function adminLogin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() && password === DEFAULT_ADMIN_CREDENTIALS.password) {
    const adminUser = {
      id: 'admin-master',
      fullName: DEFAULT_ADMIN_CREDENTIALS.fullName,
      email: DEFAULT_ADMIN_CREDENTIALS.email,
      role: 'admin'
    };
    setAdminSession(adminUser);
    return adminUser;
  }
  throw new Error('Invalid Admin email or password. (Demo: admin@medbuddy.healthcare / admin123)');
}

export function adminLogout() {
  setAdminSession(null);
}
