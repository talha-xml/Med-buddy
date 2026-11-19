import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ProfileModal from '../../components/layout/ProfileModal';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaExclamationTriangle, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import '../../styles/Dashboard.css';
import '../../styles/DangerZone.css';
import { fetchAppointments, updateAppointmentStatus, getUserProfile } from '../../services/apiService';
import { getDoctorStatus } from '../../services/verificationService';
import { addNotification } from '../../services/notificationService';

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [patientSearch, setPatientSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [highlightAptId, setHighlightAptId] = useState(location.state?.highlightAppointmentId || null);

  // Read-only modal state (when doctor views patient profile)
  const [viewingUser, setViewingUser] = useState(null);

  // Styled Cancellation Confirmation Modal state
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Check if doctor's account is currently disabled/restricted by Admin
  const doctorStatus = currentUser ? getDoctorStatus(currentUser.id) : {};
  const isDoctorDisabled = doctorStatus.isEnabled === false || currentUser?.isEnabled === 0;

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await fetchAppointments({ doctorId: currentUser.id });
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync if navigated from notification
  useEffect(() => {
    if (location.state?.highlightAppointmentId) {
      setHighlightAptId(location.state.highlightAppointmentId);
      setTimeout(() => {
        const el = document.getElementById(location.state.highlightAppointmentId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }, [location.state]);

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    setCancelLoading(true);
    try {
      await handleStatusChange(cancellingAppointment.id, 'Cancelled');
      setCancellingAppointment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const apt = appointments.find((a) => a.id === id);
      await updateAppointmentStatus(id, newStatus);

      // Create notification backup for the patient
      if (apt && apt.patientId) {
        let notifMsg = `Your appointment with Dr. ${currentUser?.fullName || 'Physician'} at ${apt.time} on ${apt.date} has been marked as ${newStatus}.`;
        if (newStatus === 'Confirmed') {
          notifMsg = `Your appointment consultation with Dr. ${currentUser?.fullName} at ${apt.time} on ${apt.date} has been confirmed.`;
        } else if (newStatus === 'Cancelled') {
          notifMsg = `Your appointment consultation with Dr. ${currentUser?.fullName} at ${apt.time} on ${apt.date} has been cancelled.`;
        } else if (newStatus === 'Completed') {
          notifMsg = `Your consultation with Dr. ${currentUser?.fullName} has been marked as Completed.`;
        }

        addNotification({
          userId: apt.patientId,
          title: `Appointment ${newStatus}`,
          message: notifMsg,
          appointmentId: id,
          type: 'appointment_status'
        });
      }

      await loadData();
      setSuccessMsg(`Appointment status updated to "${newStatus}" in SQLite database.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update appointment status.');
    }
  };

  const handleViewPatientProfile = async (patientId) => {
    try {
      const patient = await getUserProfile(patientId);
      setViewingUser(patient);
    } catch (err) {
      alert('Could not load patient medical profile.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter !== 'ALL' && apt.status.toUpperCase() !== statusFilter) {
      return false;
    }
    if (patientSearch.trim()) {
      const q = patientSearch.toLowerCase().trim();
      const patientName = (apt.patientName || '').toLowerCase();
      if (!patientName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header-bar">
            <div className="dashboard-welcome">
              <h1>Doctor Clinical Portal</h1>
              <p>Welcome, {currentUser?.fullName}. Manage patient schedule, consultations, and practice details.</p>
            </div>
          </div>

          {/* Restricted Notice for Disabled Doctors */}
          {isDoctorDisabled && (
            <div
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#9f1239'
              }}
            >
              <div style={{ fontSize: '1.6rem', color: '#e11d48', display: 'flex', alignItems: 'center' }}>
                <FaExclamationTriangle />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#be123c' }}>
                  Account Restricted by Administrator
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#9f1239', lineHeight: 1.4 }}>
                  Your account is currently disabled by Admin for unverified clinical credentials. Your profile is hidden from the public directory and patients cannot book new appointments with you. Consultation scheduling actions are locked. Please verify your PMDC registration or contact support at <strong>admin@medbuddy.healthcare</strong>.
                </p>
              </div>
            </div>
          )}

          {successMsg && <div className="success-banner">{successMsg}</div>}

          {/* Quick Metrics */}
          <div className="stat-cards-grid">
            <div className="stat-card">
              <span className="stat-title">Total Patients Assigned</span>
              <span className="stat-value">{appointments.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Confirmed Appointments</span>
              <span className="stat-value" style={{ color: 'var(--primary)' }}>
                {appointments.filter((a) => a.status === 'Confirmed').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Pending Confirmation</span>
              <span className="stat-value" style={{ color: '#d97706' }}>
                {appointments.filter((a) => a.status === 'Pending').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Completed Consultations</span>
              <span className="stat-value" style={{ color: 'var(--accent)' }}>
                {appointments.filter((a) => a.status === 'Completed').length}
              </span>
            </div>
          </div>

          {/* Doctor's Appointments Section */}
          <div className="card-section">
            <div className="card-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <h3 className="card-section-title">Patient Appointments</h3>

              {/* Controls: Patient Search & Status Filter */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search Patients by Name */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FaSearch style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.85rem' }} />
                  <input
                    type="text"
                    placeholder="Search patients by name..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="input-field"
                    style={{
                      paddingLeft: '32px',
                      paddingRight: '12px',
                      fontSize: '0.85rem',
                      width: '220px',
                      height: '36px',
                      backgroundColor: '#f8fafc'
                    }}
                  />
                  {patientSearch && (
                    <button
                      type="button"
                      onClick={() => setPatientSearch('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter:</span>
                  <select
                    className="input-field"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', height: '36px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

              {filteredAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <p>
                    {patientSearch.trim()
                      ? `No appointments found matching patient "${patientSearch}".`
                      : 'No appointments match the selected filter.'}
                  </p>
                </div>
              ) : (
                <div className="appointment-grid">
                  {filteredAppointments.map((apt) => {
                    const isHighlighted = highlightAptId === apt.id;
                    return (
                      <div
                        id={apt.id}
                        className={`appointment-item ${isHighlighted ? 'highlighted-item' : ''}`}
                        key={apt.id}
                        style={
                          isHighlighted
                            ? {
                                border: '2px solid #7c3aed',
                                backgroundColor: '#faf5ff',
                                boxShadow: '0 6px 18px rgba(124, 58, 237, 0.15)'
                              }
                            : {}
                        }
                      >
                      <div className="apt-left">
                        <div className="apt-calendar-badge">
                          <div className="date-day">
                            {apt.date.split('-')[2] || <FaCalendarAlt style={{ fontSize: '1rem', marginTop: '4px' }} />}
                          </div>
                          <div className="date-sub">{apt.date}</div>
                        </div>
                        <div className="apt-details">
                          <h4>
                            Patient:{' '}
                            <span
                              className="clickable-name"
                              title="Click to view patient medical profile"
                              onClick={() => handleViewPatientProfile(apt.patientId)}
                            >
                              {apt.patientName}
                            </span>
                          </h4>
                          <p>
                            <strong>Time Slot:</strong> {apt.time} | <strong>Reason:</strong> {apt.reason}
                          </p>
                          <p style={{ marginTop: '3px', fontSize: '0.8rem', color: '#64748b' }}>
                            Ref ID: {apt.id}
                          </p>
                        </div>
                      </div>

                      <div className="apt-right">
                        <button
                          className="action-btn-sm"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleViewPatientProfile(apt.patientId)}
                        >
                          View Patient
                        </button>

                        <span className={`status-pill ${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>

                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <button
                            className="action-btn-sm complete"
                            onClick={() => handleStatusChange(apt.id, 'Completed')}
                            disabled={apt.status === 'Pending' || isDoctorDisabled}
                            title={
                              isDoctorDisabled
                                ? 'Account restricted by Admin'
                                : apt.status === 'Pending'
                                ? 'Approve & confirm this appointment first before marking it as completed'
                                : 'Mark this consultation as completed'
                            }
                            style={isDoctorDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            Mark Completed
                          </button>
                        )}

                        {apt.status === 'Pending' && (
                          <button
                            className="action-btn-sm"
                            style={{
                              color: isDoctorDisabled ? '#94a3b8' : '#047857',
                              backgroundColor: isDoctorDisabled ? '#f1f5f9' : '#ecfdf5',
                              borderColor: isDoctorDisabled ? '#cbd5e1' : '#a7f3d0',
                              cursor: isDoctorDisabled ? 'not-allowed' : 'pointer',
                              opacity: isDoctorDisabled ? 0.6 : 1
                            }}
                            onClick={() => !isDoctorDisabled && handleStatusChange(apt.id, 'Confirmed')}
                            disabled={isDoctorDisabled}
                            title={isDoctorDisabled ? 'Account restricted by Admin' : 'Approve consultation'}
                          >
                            <FaCheck style={{ marginRight: '4px', fontSize: '0.78rem' }} />
                            Approve & Confirm
                          </button>
                        )}

                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button
                            className="action-btn-sm cancel"
                            onClick={() => !isDoctorDisabled && setCancellingAppointment(apt)}
                            disabled={isDoctorDisabled}
                            title={isDoctorDisabled ? 'Account restricted by Admin' : 'Cancel appointment'}
                            style={isDoctorDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          </div>
        </div>

      {/* Read-Only Modal when Doctor views Patient profile */}
      {viewingUser && (
        <ProfileModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      {/* Styled Cancel Appointment Confirmation Modal */}
      {cancellingAppointment && (
        <div className="cancel-modal-overlay" onClick={() => !cancelLoading && setCancellingAppointment(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <div className="cancel-modal-icon-badge">
                <FaExclamationTriangle />
              </div>
              <div className="cancel-modal-title-group">
                <h3>Cancel Consultation</h3>
                <p>Are you sure you want to cancel this booking?</p>
              </div>
            </div>

            <div className="cancel-modal-body">
              <div className="cancel-appointment-summary">
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Patient</span>
                  <span className="cancel-summary-value">{cancellingAppointment.patientName}</span>
                </div>
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Date</span>
                  <span className="cancel-summary-value">{cancellingAppointment.date}</span>
                </div>
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Time Slot</span>
                  <span className="cancel-summary-value">{cancellingAppointment.time}</span>
                </div>
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Reason</span>
                  <span className="cancel-summary-value">{cancellingAppointment.reason}</span>
                </div>
              </div>

              <p className="cancel-modal-warning-text">
                Cancelling this appointment will notify the patient immediately. This action cannot be reversed.
              </p>
            </div>

            <div className="cancel-modal-actions">
              <button
                type="button"
                className="cancel-dismiss-btn"
                onClick={() => setCancellingAppointment(null)}
                disabled={cancelLoading}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="cancel-confirm-btn"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Consultation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
