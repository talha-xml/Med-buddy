import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import ProfileModal from '../../components/layout/ProfileModal';
import { useAuth } from '../../context/AuthContext';
import { FaSearch } from 'react-icons/fa';
import '../patient/Dashboard.css';
import '../../components/layout/DangerZone.css';
import { fetchAppointments, updateAppointmentStatus, getUserProfile } from '../../services/apiService';

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [patientSearch, setPatientSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Read-only modal state (when doctor views patient profile)
  const [viewingUser, setViewingUser] = useState(null);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
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
                  {filteredAppointments.map((apt) => (
                    <div className="appointment-item" key={apt.id}>
                      <div className="apt-left">
                        <div className="apt-calendar-badge">
                          <div className="date-day">{apt.date.split('-')[2] || '📅'}</div>
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
                            disabled={apt.status === 'Pending'}
                            title={
                              apt.status === 'Pending'
                                ? 'Approve & confirm this appointment first before marking it as completed'
                                : 'Mark this consultation as completed'
                            }
                          >
                            Mark Completed
                          </button>
                        )}

                        {apt.status === 'Pending' && (
                          <button
                            className="action-btn-sm"
                            style={{ color: '#047857', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
                            onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                          >
                            ✓ Approve & Confirm
                          </button>
                        )}

                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button
                            className="action-btn-sm cancel"
                            onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Read-Only Modal when Doctor views Patient profile */}
      {viewingUser && (
        <ProfileModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}
    </>
  );
}
