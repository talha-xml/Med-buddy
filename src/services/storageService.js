// Mock Database and Initial Seed Data for SlotBuddy
const USERS_STORAGE_KEY = 'slotbuddy_users';
const APPOINTMENTS_STORAGE_KEY = 'slotbuddy_appointments';
const CURRENT_USER_KEY = 'slotbuddy_current_user';

const INITIAL_USERS = [
  {
    id: 'pat-1',
    fullName: 'Emily Watson',
    email: 'emily.watson@example.com',
    password: 'password123',
    role: 'patient',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1992-06-15',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    emergencyContact: 'David Watson (+1 555-876-5432)'
  }
];

const INITIAL_APPOINTMENTS = [];

export const initStorage = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(APPOINTMENTS_STORAGE_KEY)) {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
  }
};

export const getUsers = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
};

export const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const updateUserProfile = (updatedUser) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
  const current = getCurrentUser();
  if (current && current.id === updatedUser.id) {
    setCurrentUser({ ...current, ...updatedUser });
  }
};

export const getAppointments = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(APPOINTMENTS_STORAGE_KEY) || '[]');
};

export const bookAppointment = (appointmentData) => {
  const appointments = getAppointments();
  const newAppointment = {
    id: 'apt-' + Date.now(),
    status: 'Pending',
    ...appointmentData
  };
  appointments.push(newAppointment);
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  return newAppointment;
};

export const updateAppointmentStatus = (appointmentId, newStatus) => {
  const appointments = getAppointments();
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index !== -1) {
    appointments[index].status = newStatus;
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  }
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

