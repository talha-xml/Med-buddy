import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { standardSpecialties } from '../../services/clinicalData';
import '../../styles/Dashboard.css';

export default function EditProfile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const isDoctor = currentUser?.role === 'doctor';

  const [doctorForm, setDoctorForm] = useState({
    fullName: currentUser?.fullName || '',
    specialty: currentUser?.specialty || '',
    yearsOfExperience: currentUser?.yearsOfExperience || '',
    experienceDomain: currentUser?.experienceDomain || '',
    phone: currentUser?.phone || '',
    clinicAddress: currentUser?.clinicAddress || '',
    city: currentUser?.city || 'Lahore',
    country: currentUser?.country || 'Pakistan',
    bio: currentUser?.bio || ''
  });

  // Doctor Specialty Search & Dropdown State
  const [specialtyDropdownOpen, setSpecialtyDropdownOpen] = useState(false);
  const specialtyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (specialtyRef.current && !specialtyRef.current.contains(e.target)) {
        setSpecialtyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSpecialties = standardSpecialties.filter((s) =>
    s.toLowerCase().includes((doctorForm.specialty || '').toLowerCase().trim())
  );

  const [patientForm, setPatientForm] = useState({
    fullName: currentUser?.fullName || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    phone: currentUser?.phone || '',
    bloodGroup: currentUser?.bloodGroup || 'O+',
    allergies: currentUser?.allergies || '',
    chronicConditions: currentUser?.chronicConditions || '',
    emergencyContact: currentUser?.emergencyContact || '',
    city: currentUser?.city || 'Lahore',
    country: currentUser?.country || 'Pakistan'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      const dataToSave = isDoctor ? doctorForm : patientForm;
      await updateProfile(dataToSave);
      setSaving(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        navigate(isDoctor ? '/doctor/profile' : '/patient/profile');
      }, 1200);
    } catch (err) {
      setSaving(false);
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

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
              onClick={() => navigate(isDoctor ? '/doctor/profile' : '/patient/profile')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <FaArrowLeft />
              Back to View Profile
            </button>
          </div>

          {/* Edit Form Card */}
          <div className="profile-card" style={{ padding: '36px' }}>
            <div className="profile-avatar-row" style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div
                className="profile-avatar-circle"
                style={{
                  background: isDoctor
                    ? 'linear-gradient(135deg, #7c3aed, #0284c7)'
                    : 'linear-gradient(135deg, #0d9488, #0284c7)'
                }}
              >
                {currentUser.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>
                  Edit {isDoctor ? 'Practitioner' : 'Patient'} Profile
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Update your contact details, clinical credentials, and location settings.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {isDoctor ? (
                <>
                  <div className="booking-grid">
                    <div className="form-group">
                      <label>Full Practitioner Name</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={doctorForm.fullName}
                        onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group" ref={specialtyRef}>
                      <label>Medical Specialty</label>
                      <div className="specialty-combobox-wrapper">
                        <input
                          type="text"
                          placeholder="Search specialty e.g. Cardiology..."
                          className="input-field"
                          style={{ paddingLeft: '14px' }}
                          value={doctorForm.specialty}
                          autoComplete="off"
                          onFocus={() => setSpecialtyDropdownOpen(true)}
                          onChange={(e) => {
                            setDoctorForm({ ...doctorForm, specialty: e.target.value });
                            setSpecialtyDropdownOpen(true);
                          }}
                          required
                        />

                        {specialtyDropdownOpen && (
                          <div className="specialty-dropdown-menu">
                            {filteredSpecialties.length > 0 ? (
                              filteredSpecialties.map((item) => (
                                <div
                                  key={item}
                                  className={`specialty-dropdown-item ${
                                    doctorForm.specialty.toLowerCase() === item.toLowerCase() ? 'active' : ''
                                  }`}
                                  onClick={() => {
                                    setDoctorForm((prev) => ({ ...prev, specialty: item }));
                                    setSpecialtyDropdownOpen(false);
                                  }}
                                >
                                  <span>{item}</span>
                                  {doctorForm.specialty.toLowerCase() === item.toLowerCase() && (
                                    <span style={{ color: '#0d9488', fontSize: '0.8rem' }}>✓</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="specialty-dropdown-empty">
                                No standard match. You can keep typing "{doctorForm.specialty}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Years of Clinical Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={doctorForm.yearsOfExperience}
                        onChange={(e) => setDoctorForm({ ...doctorForm, yearsOfExperience: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={doctorForm.phone}
                        onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>City / Practice Location</label>
                      <select
                        className="input-field"
                        style={{ paddingLeft: '14px', cursor: 'pointer' }}
                        value={doctorForm.city || 'Lahore'}
                        onChange={(e) => setDoctorForm({ ...doctorForm, city: e.target.value })}
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={doctorForm.country || 'Pakistan'}
                        onChange={(e) => setDoctorForm({ ...doctorForm, country: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Specific Experience Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. Interventional Cardiology, Pediatric Critical Care"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={doctorForm.experienceDomain}
                        onChange={(e) => setDoctorForm({ ...doctorForm, experienceDomain: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Clinic / Hospital Room Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Metro Hospital, Suite 402"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={doctorForm.clinicAddress}
                        onChange={(e) => setDoctorForm({ ...doctorForm, clinicAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Professional Bio & Clinical Background</label>
                    <textarea
                      rows={4}
                      className="input-field"
                      style={{ paddingLeft: '14px', resize: 'vertical' }}
                      placeholder="Describe your medical background, certifications, and clinical approach..."
                      value={doctorForm.bio}
                      onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="booking-grid">
                  <div className="form-group">
                    <label>Full Legal Name</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.fullName}
                      onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.dateOfBirth}
                      onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>City / Location</label>
                    <select
                      className="input-field"
                      style={{ paddingLeft: '14px', cursor: 'pointer' }}
                      value={patientForm.city || 'Lahore'}
                      onChange={(e) => setPatientForm({ ...patientForm, city: e.target.value })}
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.country || 'Pakistan'}
                      onChange={(e) => setPatientForm({ ...patientForm, country: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.bloodGroup || 'O+'}
                      onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Known Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, Peanuts"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.allergies}
                      onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Existing Chronic Conditions</label>
                    <input
                      type="text"
                      placeholder="e.g. Hypertension, Asthma"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.chronicConditions}
                      onChange={(e) => setPatientForm({ ...patientForm, chronicConditions: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Emergency Contact (Name & Phone)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Watson - 0300-1234567"
                      className="input-field"
                      style={{ paddingLeft: '14px' }}
                      value={patientForm.emergencyContact}
                      onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="auth-submit-btn"
                  style={{ maxWidth: '240px', margin: 0 }}
                  disabled={saving}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
                <button
                  type="button"
                  className="action-btn-sm"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  onClick={() => navigate(isDoctor ? '/doctor/profile' : '/patient/profile')}
                >
                  Cancel
                </button>
              </div>

              {successMsg && (
                <div
                  className="success-banner"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', marginBottom: 0 }}
                >
                  <FaCheck /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="auth-error-alert" style={{ marginTop: '18px', marginBottom: 0 }}>
                  {errorMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

