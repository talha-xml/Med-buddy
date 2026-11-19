// Frontend Verification and Doctor Status Storage Helper
// Manages doctor verification & account status (enabled/disabled) across frontend and SQLite sync
import { updateUserProfile } from './apiService';

const DOCTOR_STATUS_KEY = 'medbuddy_doctor_verification_status';
export const ADMIN_CONTACT_EMAIL = 'admin@medbuddy.healthcare';

/**
 * Structure of status record per doctorId:
 * {
 *   isVerified: boolean, // default false
 *   isEnabled: boolean,  // default true
 *   pmdcNumber: string | null,
 *   verificationDate: string | null,
 *   verificationNotes: string | null
 * }
 */

export function getDoctorStatusMap() {
  try {
    const raw = localStorage.getItem(DOCTOR_STATUS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to read doctor status map:', e);
    return {};
  }
}

export function saveDoctorStatusMap(map) {
  try {
    localStorage.setItem(DOCTOR_STATUS_KEY, JSON.stringify(map));
    // Dispatch custom event for real-time reactive sync across components and open tabs
    window.dispatchEvent(new Event('medbuddy_doctor_status_changed'));
  } catch (e) {
    console.error('Failed to save doctor status map:', e);
  }
}

/**
 * Get status of a single doctor
 * Default for doctors: isVerified = false, isEnabled = true
 */
export function getDoctorStatus(doctorId) {
  if (!doctorId) return { isVerified: false, isEnabled: true, pmdcNumber: null };
  const map = getDoctorStatusMap();
  if (map[doctorId]) {
    return {
      isVerified: map[doctorId].isVerified ?? false,
      isEnabled: map[doctorId].isEnabled ?? true,
      pmdcNumber: map[doctorId].pmdcNumber || null,
      verificationDate: map[doctorId].verificationDate || null,
      verificationNotes: map[doctorId].verificationNotes || null
    };
  }
  return {
    isVerified: false,
    isEnabled: true,
    pmdcNumber: null,
    verificationDate: null,
    verificationNotes: null
  };
}

/**
 * Update verification status or PMDC number of a doctor
 */
export function updateDoctorVerification(doctorId, isVerified, notes = '', pmdcNumber = '') {
  const map = getDoctorStatusMap();
  const current = map[doctorId] || { isEnabled: true };
  map[doctorId] = {
    ...current,
    isVerified: Boolean(isVerified),
    isEnabled: true, // Verified doctors are guaranteed enabled
    pmdcNumber: pmdcNumber || current.pmdcNumber || null,
    verificationDate: isVerified ? new Date().toISOString() : null,
    verificationNotes: notes || (isVerified ? 'Verified by Medical Practitioner' : 'Pending Verification')
  };
  saveDoctorStatusMap(map);

  // Sync with backend API asynchronously if reachable
  updateUserProfile(doctorId, {
    isVerified: Boolean(isVerified),
    isEnabled: true
  }).catch(() => {});

  return map[doctorId];
}

/**
 * Admin action: Enable or Disable doctor credentials
 * Note: Only unverified doctors can be disabled.
 */
export function toggleDoctorEnabled(doctorId, isEnabled) {
  const map = getDoctorStatusMap();
  const current = map[doctorId] || { isVerified: false, isEnabled: true };

  // Rule: If doctor is verified, admin cannot disable them
  if (current.isVerified && isEnabled === false) {
    return current;
  }

  map[doctorId] = {
    ...current,
    isEnabled: Boolean(isEnabled)
  };
  saveDoctorStatusMap(map);

  // Sync with backend API asynchronously if reachable
  updateUserProfile(doctorId, { isEnabled: Boolean(isEnabled) }).catch(() => {});

  return map[doctorId];
}

/**
 * Check if doctor can login or stay logged in
 * Doctors (even if disabled) are allowed to log in to their account,
 * but disabled doctors will have restricted capabilities and be hidden from public directories.
 */
export function canDoctorLogin(doctorId) {
  const status = getDoctorStatus(doctorId);
  const isDisabled = status.isEnabled === false;

  return {
    allowed: true,
    isDisabled: isDisabled,
    message: isDisabled
      ? `Your account has been restricted by the Administrator. Please contact ${ADMIN_CONTACT_EMAIL} to restore full access.`
      : ''
  };
}
