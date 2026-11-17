import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaTimes } from 'react-icons/fa';
import { updateDoctorVerification, getDoctorStatus } from '../../services/verificationService';
import './VerificationModal.css';

export default function VerificationModal({ doctor, isOpen, onClose, onVerified }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [medicalSchool, setMedicalSchool] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  // Sync state whenever modal opens or doctor changes
  useEffect(() => {
    if (isOpen && doctor) {
      const status = getDoctorStatus(doctor.id);
      const verified = Boolean(status.isVerified);
      setIsAlreadyVerified(verified);

      // Pre-fill existing PMDC number if available
      if (status.pmdcNumber) {
        setLicenseNumber(status.pmdcNumber);
      } else if (status.verificationNotes && status.verificationNotes.includes('Verified license:')) {
        const match = status.verificationNotes.match(/PMDC-[\w-]+/i);
        if (match) setLicenseNumber(match[0]);
      } else {
        setLicenseNumber('');
      }

      setMedicalSchool('');
      setAgreed(verified); // Already agreed previously if verified
      setValidationError('');
      setSuccess(false);
    }
  }, [isOpen, doctor]);

  if (!isOpen || !doctor) return null;

  // Validate format: PMDC-(any 5+ digit number), e.g. PMDC-12345 or PMDC-948123
  const validatePMDC = (val) => {
    const trimmed = (val || '').trim();
    const regex = /^PMDC-\d{5,}(-[A-Za-z])?$/i;
    return regex.test(trimmed);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedLicense = licenseNumber.trim().toUpperCase();

    if (!validatePMDC(trimmedLicense)) {
      setValidationError(
        'Invalid PMDC License Format. Please enter in the format: PMDC-(5+ digit number), e.g. PMDC-12345'
      );
      return;
    }

    if (!agreed) {
      setValidationError('Please check the confirmation box to attest your medical practitioner credentials.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const schoolText = medicalSchool.trim() || 'Medical College Graduate';
      const updated = updateDoctorVerification(
        doctor.id,
        true,
        `Verified license: ${trimmedLicense} (${schoolText})`,
        trimmedLicense
      );
      setSubmitting(false);
      setSuccess(true);
      if (onVerified) {
        onVerified(updated);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 500);
  };

  return (
    <div className="verification-modal-overlay" onClick={onClose}>
      <div className="verification-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="verification-modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>

        <div className="verification-modal-header">
          <div className="verification-badge-icon">
            <FaShieldAlt />
          </div>
          <h2>
            {isAlreadyVerified ? 'Update Your PMDC Number' : 'Please Verify Your Doctor Profile'}
          </h2>
          <p>
            {isAlreadyVerified
              ? 'Your medical credentials are verified. You can update your PMDC registration number below.'
              : 'Verify your clinical license and medical practitioner credentials to activate your account and manage patient consultations.'}
          </p>
        </div>

        {success ? (
          <div className="verification-success-view">
            <FaCheckCircle className="success-icon-anim" />
            <h3>
              {isAlreadyVerified
                ? 'PMDC Number Updated Successfully!'
                : 'Account Verified Successfully!'}
            </h3>
            <p>
              Your verified PMDC registration number has been saved as{' '}
              <strong>{licenseNumber.toUpperCase()}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="verification-form">
            <div className="verification-doctor-summary">
              <div className="summary-field">
                <span className="summary-label">Doctor Name:</span>
                <span className="summary-value">{doctor.fullName}</span>
              </div>
              <div className="summary-field">
                <span className="summary-label">Clinical Specialty:</span>
                <span className="summary-value">{doctor.specialty || 'General Medicine'}</span>
              </div>
              <div className="summary-field">
                <span className="summary-label">Practice Location:</span>
                <span className="summary-value">{doctor.city || 'Lahore'}, Pakistan</span>
              </div>
              {isAlreadyVerified && (
                <div className="summary-field">
                  <span className="summary-label">Current Status:</span>
                  <span className="summary-value" style={{ color: '#16a34a' }}>
                    ✓ Verified Practitioner
                  </span>
                </div>
              )}
            </div>

            {validationError && (
              <div className="verification-error-pill">
                <FaExclamationTriangle />
                <span>{validationError}</span>
              </div>
            )}

            <div className="verification-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>
                  {isAlreadyVerified ? 'Update your PMDC Number *' : 'PMDC License Number *'}
                </label>
                <span className="format-hint-badge">Format: PMDC-12345</span>
              </div>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => {
                  setLicenseNumber(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. PMDC-12345"
                autoFocus
              />
              <span className="input-helper-text">
                Type <code>PMDC-</code> followed by at least 5 digits (e.g. <code>PMDC-48921</code>).
              </span>
            </div>

            {!isAlreadyVerified && (
              <div className="verification-input-group">
                <label>Graduating Medical College / University (Optional)</label>
                <input
                  type="text"
                  value={medicalSchool}
                  onChange={(e) => setMedicalSchool(e.target.value)}
                  placeholder="e.g. King Edward Medical University, Lahore"
                />
              </div>
            )}

            <div className="verification-alert-note">
              <FaExclamationTriangle />
              <span>
                {isAlreadyVerified
                  ? 'Updating your PMDC number will reflect across the official MedBuddy clinical directory instantly.'
                  : 'By verifying your credentials, your profile will be officially listed as a Verified Physician in the MedBuddy clinical directory.'}
              </span>
            </div>

            <label className="verification-checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (validationError) setValidationError('');
                }}
              />
              <span>
                I attest under penalty of administrative revocation that I am a licensed healthcare practitioner authorized to practice in Pakistan.
              </span>
            </label>

            <div className="verification-modal-actions">
              <button type="button" className="verification-cancel-btn" onClick={onClose}>
                {isAlreadyVerified ? 'Close' : 'Later'}
              </button>
              <button
                type="submit"
                className="verification-submit-btn"
                disabled={submitting || !licenseNumber.trim()}
              >
                {submitting
                  ? 'Saving...'
                  : isAlreadyVerified
                  ? 'Update PMDC Number'
                  : 'Verify My Account Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
