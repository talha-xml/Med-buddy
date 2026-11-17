import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MedicalCrossIcon } from '../auth/AuthLayout';
import DeleteAccountModal from './DeleteAccountModal';
import VerificationModal from '../common/VerificationModal';
import { getDoctorStatus } from '../../services/verificationService';
import {
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt
} from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState({ isVerified: false, isEnabled: true });

  const dropdownRef = useRef(null);

  const isDoctor = currentUser?.role === 'doctor';

  // Keep verification status reactive
  useEffect(() => {
    if (isDoctor && currentUser?.id) {
      setDoctorStatus(getDoctorStatus(currentUser.id));
    }

    const handleStatusChange = () => {
      if (isDoctor && currentUser?.id) {
        setDoctorStatus(getDoctorStatus(currentUser.id));
      }
    };

    window.addEventListener('medbuddy_doctor_status_changed', handleStatusChange);
    return () => {
      window.removeEventListener('medbuddy_doctor_status_changed', handleStatusChange);
    };
  }, [isDoctor, currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    navigate(isDoctor ? '/doctor/profile' : '/patient/profile');
  };

  const handleEditProfile = () => {
    setDropdownOpen(false);
    navigate(isDoctor ? '/doctor/profile/edit' : '/patient/profile/edit');
  };

  const handleAccountStatusClick = () => {
    setDropdownOpen(false);
    setShowVerifyModal(true);
  };

  const handleDeleteAccountClick = () => {
    setDropdownOpen(false);
    setShowDeleteModal(true);
  };

  const initial = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <nav className="navbar">
        <div
          className="nav-brand"
          onClick={() => navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-icon-wrapper">
            <MedicalCrossIcon />
          </div>
          <span className="brand-title">MedBuddy</span>
          <span className={`brand-badge ${currentUser.role}`}>
            {isDoctor ? 'Medical Staff' : 'Patient Portal'}
          </span>
          {isDoctor && (
            <span
              className={`brand-badge verification-pill ${
                doctorStatus.isVerified ? 'verified' : 'unverified'
              }`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700,
                background: doctorStatus.isVerified ? '#dcfce7' : '#fef3c7',
                color: doctorStatus.isVerified ? '#15803d' : '#b45309',
                border: doctorStatus.isVerified ? '1px solid #bbf7d0' : '1px solid #fde68a'
              }}
            >
              {doctorStatus.isVerified ? <FaCheckCircle /> : <FaExclamationCircle />}
              {doctorStatus.isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          )}
        </div>

        <div className="nav-profile">
          <div className="user-info">
            <p className="user-name">{currentUser.fullName}</p>
            <p className="user-role-label">
              {isDoctor ? currentUser.specialty || 'Physician' : 'Patient'}
            </p>
          </div>

          {/* Profile Avatar Circle & Dropdown */}
          <div className="nav-avatar-menu-container" ref={dropdownRef}>
            <button
              type="button"
              className="nav-avatar-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="User profile menu"
              aria-expanded={dropdownOpen}
            >
              <div
                className="nav-avatar-circle"
                style={{
                  background: isDoctor
                    ? 'linear-gradient(135deg, #7c3aed, #0284c7)'
                    : 'linear-gradient(135deg, #0d9488, #0284c7)'
                }}
              >
                {initial}
              </div>
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-user-name">{currentUser.fullName}</div>
                  <div className="nav-dropdown-user-email">{currentUser.email}</div>
                  {isDoctor && (
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: doctorStatus.isVerified ? '#16a34a' : '#d97706'
                      }}
                    >
                      {doctorStatus.isVerified ? (
                        <>
                          <FaCheckCircle />
                          <span>Credentials Verified</span>
                        </>
                      ) : (
                        <>
                          <FaExclamationCircle />
                          <span>Not Verified</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="nav-dropdown-items">
                  <button type="button" className="nav-dropdown-item" onClick={handleViewProfile}>
                    <FaUserCircle className="dropdown-item-icon" />
                    <span>View Profile</span>
                  </button>

                  <button type="button" className="nav-dropdown-item" onClick={handleEditProfile}>
                    <FaEdit className="dropdown-item-icon" />
                    <span>Edit Profile</span>
                  </button>

                  {/* Account Status Option for Doctor (Placed directly above Sign Out) */}
                  {isDoctor && (
                    <button
                      type="button"
                      className="nav-dropdown-item account-status-item"
                      onClick={handleAccountStatusClick}
                      style={{
                        background: doctorStatus.isVerified ? '#f0fdf4' : '#fffbeb',
                        borderLeft: doctorStatus.isVerified ? '3px solid #22c55e' : '3px solid #f59e0b'
                      }}
                    >
                      <FaShieldAlt
                        className="dropdown-item-icon"
                        style={{ color: doctorStatus.isVerified ? '#16a34a' : '#d97706' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>Account Status</span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: doctorStatus.isVerified ? '#15803d' : '#b45309'
                          }}
                        >
                          {doctorStatus.isVerified ? 'Verified • Click to review' : 'Please Verify'}
                        </span>
                      </div>
                    </button>
                  )}

                  <button type="button" className="nav-dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-item-icon" />
                    <span>Sign Out</span>
                  </button>

                  <div className="nav-dropdown-divider" />

                  <button
                    type="button"
                    className="nav-dropdown-item item-danger"
                    onClick={handleDeleteAccountClick}
                  >
                    <FaTrashAlt className="dropdown-item-icon" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Doctor Verification Modal */}
      {isDoctor && (
        <VerificationModal
          doctor={currentUser}
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onVerified={(updated) => {
            setDoctorStatus(updated);
          }}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </>
  );
}
