import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { FaUserEdit, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import '../patient/Dashboard.css';

export default function ViewProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isDoctor = currentUser.role === 'doctor';

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-container" style={{ maxWidth: '800px' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button
              type="button"
              className="action-btn-sm"
              onClick={() => navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <FaArrowLeft />
              Back to Dashboard
            </button>
            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => navigate(isDoctor ? '/doctor/profile/edit' : '/patient/profile/edit')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', maxWidth: '180px', margin: 0, padding: '10px 18px' }}
            >
              <FaUserEdit />
              Edit Profile
            </button>
          </div>

          {/* Main Profile Details Card */}
          <div className="profile-card" style={{ padding: '36px' }}>
            <div className="profile-avatar-row" style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '24px', marginBottom: '28px' }}>
              <div
                className="profile-avatar-circle"
                style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  background: isDoctor
                    ? 'linear-gradient(135deg, #7c3aed, #0284c7)'
                    : 'linear-gradient(135deg, #0d9488, #0284c7)'
                }}
              >
                {currentUser.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                    {currentUser.fullName}
                  </h1>
                  <span className={`brand-badge ${currentUser.role}`}>
                    {isDoctor ? 'Doctor / Clinical Staff' : 'Registered Patient'}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {currentUser.email} • ID: #{currentUser.id}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.84rem', color: '#059669', fontWeight: 600 }}>
                  <FaShieldAlt /> Verified Account Record
                </div>
              </div>
            </div>

            {/* Profile Grid Information */}
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.15rem', color: '#0f172a' }}>
              {isDoctor ? 'Practitioner Medical Information' : 'Patient Medical & Contact Information'}
            </h3>

            {isDoctor ? (
              <div className="view-grid">
                <div className="view-field">
                  <span className="view-label">Specialty</span>
                  <span className="view-value">{currentUser.specialty || 'General Practice'}</span>
                </div>
                <div className="view-field">
                  <span className="view-label">Years of Experience</span>
                  <span className="view-value">
                    {currentUser.yearsOfExperience ? `${currentUser.yearsOfExperience} Years` : 'Not specified'}
                  </span>
                </div>
                <div className="view-field">
                  <span className="view-label">City / Location</span>
                  <span className="view-value">{currentUser.city ? `${currentUser.city}, ${currentUser.country || 'Pakistan'}` : 'Lahore, Pakistan'}</span>
                </div>
                <div className="view-field">
                  <span className="view-label">Contact Phone</span>
                  <span className="view-value">{currentUser.phone || 'Clinic line'}</span>
                </div>
                <div className="view-field" style={{ gridColumn: 'span 2' }}>
                  <span className="view-label">Clinic / Hospital Room Location</span>
                  <span className="view-value">{currentUser.clinicAddress || 'Hospital Main Pavilion'}</span>
                </div>
                <div className="view-field" style={{ gridColumn: 'span 2' }}>
                  <span className="view-label">Domain Expertise</span>
                  <span className="view-value">
                    {currentUser.experienceDomain || 'General Clinical Medicine'}
                  </span>
                </div>
                <div className="view-field" style={{ gridColumn: 'span 2' }}>
                  <span className="view-label">Professional Background & Bio</span>
                  <p className="view-bio">{currentUser.bio || 'Licensed healthcare practitioner.'}</p>
                </div>
              </div>
            ) : (
              <div className="view-grid">
                <div className="view-field">
                  <span className="view-label">Date of Birth</span>
                  <span className="view-value">{currentUser.dateOfBirth || 'Not specified'}</span>
                </div>
                <div className="view-field">
                  <span className="view-label">City / Location</span>
                  <span className="view-value">{currentUser.city ? `${currentUser.city}, ${currentUser.country || 'Pakistan'}` : 'Lahore, Pakistan'}</span>
                </div>
                <div className="view-field">
                  <span className="view-label">Blood Group</span>
                  <span className="view-value">{currentUser.bloodGroup || 'O+'}</span>
                </div>
                <div className="view-field">
                  <span className="view-label">Contact Phone</span>
                  <span className="view-value">{currentUser.phone || 'None provided'}</span>
                </div>
                <div className="view-field" style={{ gridColumn: 'span 2' }}>
                  <span className="view-label">Known Allergies</span>
                  <span
                    className="view-value"
                    style={{ color: currentUser.allergies ? '#dc2626' : 'inherit' }}
                  >
                    {currentUser.allergies || 'None documented'}
                  </span>
                </div>
                <div className="view-field" style={{ gridColumn: 'span 2' }}>
                  <span className="view-label">Existing Chronic Conditions</span>
                  <span className="view-value">{currentUser.chronicConditions || 'None reported'}</span>
                </div>
                <div className="view-field" style={{ gridColumn: 'span 2' }}>
                  <span className="view-label">Emergency Contact Name & Phone</span>
                  <span className="view-value">{currentUser.emergencyContact || 'None provided'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

