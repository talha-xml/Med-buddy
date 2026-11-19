// Client notification service with SQLite API integration & localStorage fallback
const NOTIFS_STORAGE_KEY = 'medbuddy_notifications_pool';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function getNotifications(userId) {
  if (!userId) return [];

  try {
    const res = await fetch(`${API_BASE}/notifications?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      // Sync into local backup storage
      saveLocalNotifications(userId, data.notifications || []);
      return data.notifications || [];
    }
  } catch (e) {
    // Backend offline, fallback to local storage
  }

  return getLocalNotifications(userId);
}

export async function markNotificationAsRead(id, userId) {
  if (!id) return;

  // Update local storage immediately for responsive UI
  markLocalNotificationRead(id, userId);

  try {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // Silent fail if offline
  }

  window.dispatchEvent(new Event('medbuddy_notifications_updated'));
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId) return;

  markAllLocalNotificationsRead(userId);

  try {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch (e) {
    // Silent fail if offline
  }

  window.dispatchEvent(new Event('medbuddy_notifications_updated'));
}

export function addNotification({ userId, title, message, appointmentId, type = 'appointment' }) {
  if (!userId) return;
  const list = getLocalNotifications(userId);
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    title,
    message,
    type,
    appointmentId: appointmentId || null,
    isRead: 0,
    createdAt: new Date().toISOString()
  };

  list.unshift(newNotif);
  saveLocalNotifications(userId, list);
  window.dispatchEvent(new Event('medbuddy_notifications_updated'));
  return newNotif;
}

// Local Storage helpers
function getAllStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getLocalNotifications(userId) {
  const all = getAllStoredNotifications();
  return all
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function saveLocalNotifications(userId, userNotifs) {
  const all = getAllStoredNotifications().filter((n) => n.userId !== userId);
  const combined = [...userNotifs, ...all];
  try {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(combined));
  } catch (e) {
    console.error('Failed to save local notifications:', e);
  }
}

function markLocalNotificationRead(id, userId) {
  const all = getAllStoredNotifications();
  const updated = all.map((n) => (n.id === id ? { ...n, isRead: 1 } : n));
  try {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
}

function markAllLocalNotificationsRead(userId) {
  const all = getAllStoredNotifications();
  const updated = all.map((n) => (n.userId === userId ? { ...n, isRead: 1 } : n));
  try {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
}

