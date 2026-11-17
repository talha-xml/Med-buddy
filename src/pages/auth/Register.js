import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout, {
  UserIcon,
  EmailIcon,
  LockIcon,
  PhoneIcon,
  LocationIcon
} from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { standardSpecialties } from '../../services/clinicalData';
import { FaStethoscope } from 'react-icons/fa';
import { recordNewUser } from '../../services/adminDataService';
import { updateDoctorVerification } from '../../services/verificationService';

export default function Register() {
  const navigate = useNavigate();
  const { role: urlRole } = useParams();
  const { register } = useAuth();

  // Route determines exact role: /register/patient or /register/doctor
  const role = urlRole === 'doctor' ? 'doctor' : 'patient';
  const isDoctor = role === 'doctor';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Lahore',
    country: 'Pakistan',
    dateOfBirth: '', // for patient
    specialty: '', // for doctor
    yearsOfExperience: '', // for doctor
    experienceDomain: '', // for doctor
    bio: '', // for doctor
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Specialty Search & Dropdown State for Doctors
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
    s.toLowerCase().includes((formData.specialty || '').toLowerCase().trim())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the medical privacy policy and terms.');
      return;
    }

    setLoading(true);
    try {
      const createdUser = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        role: role,
        dateOfBirth: !isDoctor ? formData.dateOfBirth : undefined,
        specialty: isDoctor ? formData.specialty : undefined,
        yearsOfExperience:
          isDoctor && formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        experienceDomain: isDoctor ? formData.experienceDomain : undefined,
        bio: isDoctor ? formData.bio : undefined,
        password: formData.password
      });

      // Synchronize into frontend records pool
      if (createdUser) {
        recordNewUser(createdUser);
        // By default, doctors are not verified
        if (isDoctor) {
          updateDoctorVerification(createdUser.id, false, 'Pending Initial Credential Verification');
        }
      }

      setLoading(false);
      navigate(`/login/${role}`, { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout
      title={isDoctor ? 'Doctor & Specialist Registration' : 'Patient Registration'}
      subtitle={
        isDoctor
          ? 'Register your clinical credentials to accept appointments and manage patient bookings'
          : 'Create your patient account to book consultation slots and manage clinical appointments'
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: isDoctor ? '#ede9fe' : '#e0f2fe',
            color: isDoctor ? '#7c3aed' : '#0284c7',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          {isDoctor ? <FaStethoscope /> : <UserIcon size={14} />}
          {isDoctor ? 'Doctor / Clinical Practitioner' : 'Patient Account'}
        </span>
      </div>

      {error && <div className="auth-error-alert">{error}</div>}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {/* Compact Grid Form Fields */}
        <div className="auth-form-grid triple-col">
          {/* Full Name */}
          <div className="form-group-compact">
            <label htmlFor="fullName">Full Legal Name</label>
            <div className="input-container">
              <span className="input-icon">
                {isDoctor ? <FaStethoscope /> : <UserIcon />}
              </span>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder={isDoctor ? 'Dr. Sarah Mitchell, MD' : 'John Doe'}
                className="input-field-compact"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group-compact">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <span className="input-icon">
                <EmailIcon />
              </span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder={isDoctor ? 'doctor@clinic.org' : 'name@example.com'}
                className="input-field-compact"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group-compact">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-container">
              <span className="input-icon">
                <PhoneIcon />
              </span>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+92 300 1234567"
                className="input-field-compact"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Location: City */}
          <div className="form-group-compact">
            <label htmlFor="city">City / Location</label>
            <div className="input-container">
              <span className="input-icon">
                <LocationIcon />
              </span>
              <select
                id="city"
                name="city"
                className="input-field-compact"
                style={{ paddingLeft: '34px', cursor: 'pointer' }}
                value={formData.city}
                onChange={handleChange}
                required
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
          </div>

          {/* Location: Country */}
          <div className="form-group-compact">
            <label htmlFor="country">Country</label>
            <div className="input-container">
              <input
                id="country"
                type="text"
                name="country"
                className="input-field-compact"
                style={{ paddingLeft: '12px' }}
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Patient Only: Date of Birth */}
          {!isDoctor && (
            <div className="form-group-compact">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <div className="input-container">
                <input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  className="input-field-compact"
                  style={{ paddingLeft: '12px' }}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          )}

          {/* Doctor Only: Specialty & Experience */}
          {isDoctor && (
            <>
              <div className="form-group-compact" ref={specialtyRef}>
                <label htmlFor="specialty">Medical Specialty</label>
                <div className="input-container specialty-combobox-wrapper">
                  <input
                    id="specialty"
                    type="text"
                    name="specialty"
                    placeholder="Search specialty e.g. Cardiology..."
                    className="input-field-compact"
                    style={{ paddingLeft: '12px' }}
                    value={formData.specialty}
                    autoComplete="off"
                    onFocus={() => setSpecialtyDropdownOpen(true)}
                    onChange={(e) => {
                      handleChange(e);
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
                              formData.specialty.toLowerCase() === item.toLowerCase() ? 'active' : ''
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, specialty: item }));
                              setSpecialtyDropdownOpen(false);
                            }}
                          >
                            <span>{item}</span>
                            {formData.specialty.toLowerCase() === item.toLowerCase() && (
                              <span style={{ color: '#0d9488', fontSize: '0.8rem' }}>✓</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="specialty-dropdown-empty">
                          No standard match. You can keep typing "{formData.specialty}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-compact">
                <label htmlFor="yearsOfExperience">Years of Experience</label>
                <div className="input-container">
                  <input
                    id="yearsOfExperience"
                    type="number"
                    name="yearsOfExperience"
                    placeholder="e.g. 10"
                    min="0"
                    max="60"
                    className="input-field-compact"
                    style={{ paddingLeft: '12px' }}
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Doctor Domain Expertise (Spans full width) */}
              <div className="form-group-compact span-full">
                <label htmlFor="experienceDomain">Specific Experience Domain & Expertise</label>
                <div className="input-container">
                  <input
                    id="experienceDomain"
                    name="experienceDomain"
                    type="text"
                    placeholder="e.g. Interventional Cardiology, Pediatric Critical Care, Preventative Heart Health..."
                    className="input-field-compact"
                    style={{ paddingLeft: '12px' }}
                    value={formData.experienceDomain}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Doctor Bio & Clinical Background Paragraph */}
              <div className="form-group-compact span-full">
                <label htmlFor="bio">Professional Bio & Clinical Background</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={2}
                  placeholder="Describe your medical education, hospital affiliations, patient care approach, and clinical background..."
                  className="input-field-compact"
                  style={{
                    paddingLeft: '12px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    resize: 'vertical',
                    minHeight: '52px',
                    fontFamily: 'inherit'
                  }}
                  value={formData.bio}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Password */}
          <div className="form-group-compact">
            <label htmlFor="password">Password (min 8 chars)</label>
            <div className="input-container">
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                id="password"
                type="password"
                name="password"
                className="input-field-compact"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group-compact">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-container">
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="input-field-compact"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Terms row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
            />
            <span>I accept the medical privacy policy and HIPAA rules</span>
          </label>
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.84rem', color: 'var(--primary)', textDecoration: 'underline' }}
          >
            View Terms & Policies
          </Link>
        </div>

        {/* Bottom Actions Row */}
        <div className="auth-bottom-action-row">
          <div className="auth-switch-link">
            Already have an account? <Link to={`/login/${role}`}>Sign In</Link>
            <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
            <Link to="/register" style={{ color: '#64748b' }}>
              Switch Role
            </Link>
          </div>

          <div className="auth-btn-wrapper">
            <button type="submit" className="auth-submit-btn-wide" disabled={loading}>
              {loading ? 'Creating Account...' : `Register as ${isDoctor ? 'Doctor' : 'Patient'}`}
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
