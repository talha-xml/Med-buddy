import React from 'react';
import '../../styles/ProfileModal.css';

export default function ProfileModal({ user, onClose }) {
  if (!user) return null;

  const isDoctor = user.role === 'doctor';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div
            className="modal-avatar-circle"
            style={{
              background: isDoctor
                ? 'linear-gradient(135deg, #7c3aed, #0284c7)'
                : 'linear-gradient(135deg, var(--primary), var(--secondary))'
            }}
          >
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="modal-user-name">{user.fullName}</h3>
            <span className={`brand-badge ${user.role}`}>
              {isDoctor ? 'Practitioner (Read-Only)' : 'Patient (Read-Only)'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {isDoctor ? (
            <div className="view-grid">
              <div className="view-field">
                <span className="view-label">Specialty</span>
                <span className="view-value">{user.specialty || 'General Practice'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">Experience</span>
                <span className="view-value">
                  {user.yearsOfExperience ? `${user.yearsOfExperience} Years` : 'Not specified'}
                </span>
              </div>
              <div className="view-field">
                <span className="view-label">Available Consultation Hours</span>
                <span className="view-value" style={{ color: '#0d9488', fontWeight: 700 }}>
                  {user.availableFrom && user.availableTo
                    ? `${user.availableFrom} – ${user.availableTo}`
                    : '09:00 AM – 05:00 PM'}
                </span>
              </div>
              <div className="view-field">
                <span className="view-label">City / Location</span>
                <span className="view-value">{user.city ? `${user.city}, ${user.country || 'Pakistan'}` : 'Lahore, Pakistan'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">Clinic Location</span>
                <span className="view-value">{user.clinicAddress || 'Hospital Main Pavilion'}</span>
              </div>
              <div className="view-field" style={{ gridColumn: 'span 2' }}>
                <span className="view-label">Domain Expertise</span>
                <span className="view-value">
                  {user.experienceDomain || 'General Clinical Medicine'}
                </span>
              </div>
              <div className="view-field">
                <span className="view-label">Clinic Location</span>
                <span className="view-value">{user.clinicAddress || 'Hospital Main Pavilion'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">Contact Phone</span>
                <span className="view-value">{user.phone || 'Clinic line'}</span>
              </div>
              <div className="view-field" style={{ gridColumn: 'span 2' }}>
                <span className="view-label">Professional Background</span>
                <p className="view-bio">{user.bio || 'Licensed healthcare practitioner.'}</p>
              </div>
            </div>
          ) : (
            <div className="view-grid">
              <div className="view-field">
                <span className="view-label">Date of Birth</span>
                <span className="view-value">{user.dateOfBirth || 'Not specified'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">City / Location</span>
                <span className="view-value">{user.city ? `${user.city}, ${user.country || 'Pakistan'}` : 'Lahore, Pakistan'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">Blood Group</span>
                <span className="view-value">{user.bloodGroup || 'O+'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">Contact Phone</span>
                <span className="view-value">{user.phone || 'None provided'}</span>
              </div>
              <div className="view-field">
                <span className="view-label">Known Allergies</span>
                <span
                  className="view-value"
                  style={{ color: user.allergies ? '#dc2626' : 'inherit' }}
                >
                  {user.allergies || 'None documented'}
                </span>
              </div>
              <div className="view-field" style={{ gridColumn: 'span 2' }}>
                <span className="view-label">Emergency Contact</span>
                <span className="view-value">{user.emergencyContact || 'None on file'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span className="read-only-notice">
            Read-only view. You do not have permissions to modify another user's medical records.
          </span>
          <button className="action-btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
