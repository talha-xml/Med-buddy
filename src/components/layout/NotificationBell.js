import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaArrowRight,
  FaExclamationCircle
} from 'react-icons/fa';
import '../../styles/NotificationBell.css';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifs = React.useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const list = await getNotifications(currentUser.id);
      setNotifications(list);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchNotifs();

    const handleUpdate = () => {
      fetchNotifs();
    };

    window.addEventListener('medbuddy_notifications_updated', handleUpdate);
    // Poll every 8 seconds for background database updates
    const interval = setInterval(fetchNotifs, 8000);

    return () => {
      window.removeEventListener('medbuddy_notifications_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchNotifs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => Number(n.isRead) === 0).length;
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notif) => {
    if (Number(notif.isRead) === 0) {
      await markNotificationAsRead(notif.id, currentUser.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: 1 } : n))
      );
    }

    setDropdownOpen(false);

    // Direct user to their dashboard pointing towards appointments tab
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

  const handleViewAll = () => {
    setDropdownOpen(false);
    navigate('/notifications');
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notif-bell-container" ref={containerRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-label="View notifications"
        aria-expanded={dropdownOpen}
      >
        <FaBell className="notif-bell-icon" />
        {unreadCount > 0 && (
          <span className="notif-badge-pill">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="notif-dropdown-menu">
          <div className="notif-dropdown-header">
            <div className="notif-header-title">
              <h3>Notifications</h3>
              {unreadCount > 0 && <span className="notif-count-chip">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list-scroll">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <FaBell className="notif-empty-icon" />
                <p>No notifications yet</p>
                <span>You're all caught up!</span>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const isUnread = Number(notif.isRead) === 0;
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${isUnread ? 'unread' : 'read'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-item-left">
                      <div className={`notif-status-dot ${isUnread ? 'dot-active' : ''}`} />
                      <div className="notif-icon-circle">
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

                    <div className="notif-item-content">
                      <div className="notif-item-title-row">
                        <span className={`notif-item-title ${isUnread ? 'bold-text' : 'regular-text'}`}>
                          {notif.title}
                        </span>
                        <span className="notif-item-time">{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className={`notif-item-message ${isUnread ? 'bold-text' : 'regular-text'}`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="notif-dropdown-footer">
            <button type="button" className="notif-view-all-btn" onClick={handleViewAll}>
              View all notifications <FaArrowRight style={{ fontSize: '0.78rem' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

