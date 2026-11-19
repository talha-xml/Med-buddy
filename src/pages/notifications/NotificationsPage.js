import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../services/notificationService';
import {
  FaBell,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaExclamationCircle,
  FaCheckDouble,
  FaArrowLeft
} from 'react-icons/fa';
import '../../styles/NotificationsPage.css';

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'

  const fetchNotifs = React.useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const list = await getNotifications(currentUser.id);
      setNotifications(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchNotifs();
    const handleUpdate = () => fetchNotifs();
    window.addEventListener('medbuddy_notifications_updated', handleUpdate);
    return () => window.removeEventListener('medbuddy_notifications_updated', handleUpdate);
  }, [fetchNotifs]);

  const handleNotificationClick = async (notif) => {
    if (Number(notif.isRead) === 0) {
      await markNotificationAsRead(notif.id, currentUser.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: 1 } : n))
      );
    }

    const targetDashboard =
      currentUser.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    navigate(targetDashboard, {
      state: {
        highlightAppointmentId: notif.appointmentId,
        activeTab: 'appointments'
      }
    });
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return Number(n.isRead) === 0;
    if (filter === 'READ') return Number(n.isRead) === 1;
    return true;
  });

  const unreadCount = notifications.filter((n) => Number(n.isRead) === 0).length;

  return (
    <>
      <Navbar />
      <div className="notifications-page">
        <div className="notifications-page-container">
          {/* Header */}
          <div className="notifs-page-header">
            <button
              type="button"
              className="back-btn"
              onClick={() =>
                navigate(currentUser?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')
              }
            >
              <FaArrowLeft /> Back to Dashboard
            </button>

            <div className="notifs-page-title-row">
              <div className="title-left">
                <h1>All Notifications</h1>
                <p>Track clinical requests, appointment confirmations, and patient status updates.</p>
              </div>

              {unreadCount > 0 && (
                <button type="button" className="mark-all-read-btn" onClick={handleMarkAllRead}>
                  <FaCheckDouble /> Mark All as Read
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="notifs-filter-row">
              <button
                className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All Notifications ({notifications.length})
              </button>
              <button
                className={`filter-pill ${filter === 'UNREAD' ? 'active' : ''}`}
                onClick={() => setFilter('UNREAD')}
              >
                Unread ({unreadCount})
              </button>
              <button
                className={`filter-pill ${filter === 'READ' ? 'active' : ''}`}
                onClick={() => setFilter('READ')}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="notifs-loading">Loading notifications...</div>
          ) : filteredNotifs.length === 0 ? (
            <div className="notifs-empty-card">
              <FaBell className="empty-bell-icon" />
              <h3>No notifications to display</h3>
              <p>When you receive appointment updates or requests, they will appear here in chronological order.</p>
            </div>
          ) : (
            <div className="notifs-full-list">
              {filteredNotifs.map((notif) => {
                const isUnread = Number(notif.isRead) === 0;
                return (
                  <div
                    key={notif.id}
                    className={`notif-card ${isUnread ? 'card-unread' : 'card-read'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-card-icon-col">
                      <div className="card-icon-box">
                        {notif.type === 'appointment_request' ? (
                          <FaCalendarAlt style={{ color: '#0284c7' }} />
                        ) : notif.title.includes('Approved') || notif.title.includes('Confirmed') ? (
                          <FaCheckCircle style={{ color: '#16a34a' }} />
                        ) : notif.title.includes('Cancelled') ? (
                          <FaExclamationCircle style={{ color: '#ef4444' }} />
                        ) : (
                          <FaClock style={{ color: '#7c3aed' }} />
                        )}
                      </div>
                    </div>

                    <div className="notif-card-main">
                      <div className="notif-card-head">
                        <span className={`notif-card-title ${isUnread ? 'bold-text' : 'regular-text'}`}>
                          {notif.title}
                        </span>
                        <span className="notif-card-time">{formatTimestamp(notif.createdAt)}</span>
                      </div>

                      <p className={`notif-card-message ${isUnread ? 'bold-text' : 'regular-text'}`}>
                        {notif.message}
                      </p>

                      <span className="notif-action-hint">
                        Click to view appointment in dashboard →
                      </span>
                    </div>

                    {isUnread && <span className="card-unread-pill">Unread</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

