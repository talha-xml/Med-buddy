import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout, { EmailIcon, LockIcon } from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { FaStethoscope, FaUserAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();
  const { role: urlRole } = useParams();
  const { login } = useAuth();

  // Role is explicitly determined by the route /login/patient or /login/doctor (defaults to patient)
  const role = urlRole === 'doctor' ? 'doctor' : 'patient';
  const isDoctor = role === 'doctor';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password, role);
      setLoading(false);

      if (user.role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <AuthLayout
      title={isDoctor ? 'Doctor & Practitioner Sign In' : 'Patient Portal Sign In'}
      subtitle={
        isDoctor
          ? 'Enter your clinical credentials to access your schedule and approve consultations'
          : 'Access your patient dashboard to schedule visits and view consultation history'
      }
      centered={true}
    >
      <div className="login-center-container">
        {/* Role Badge Indicator */}
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
            {isDoctor ? <FaStethoscope /> : <FaUserAlt />}
            {isDoctor ? 'Doctor / Clinical Staff' : 'Patient Account'}
          </span>
        </div>

        {error && (
          <div className="auth-error-alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <FaExclamationTriangle style={{ flexShrink: 0, marginTop: '3px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-vertical">
          {/* Vertical Field 1: Email */}
          <div className="form-group-compact">
            <label htmlFor="email">
              {isDoctor ? 'Doctor / Clinic Email Address' : 'Patient Email Address'}
            </label>
            <div className="input-container">
              <span className="input-icon">
                <EmailIcon />
              </span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder={isDoctor ? 'hassan@gmail.com' : 'emily.watson@example.com'}
                className="input-field-compact"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Vertical Field 2: Password */}
          <div className="form-group-compact">
            <label htmlFor="password">Account Password</label>
            <div className="input-container">
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••••••"
                className="input-field-compact"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Remember Me & Demo Password Hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
              Demo: <strong>password123</strong>
            </span>
          </div>

          {/* Vertical Action Stack */}
          <div className="auth-vertical-action-row">
            <button type="submit" className="auth-submit-btn-full" disabled={loading}>
              {loading ? 'Authenticating...' : `Sign In as ${isDoctor ? 'Doctor' : 'Patient'}`}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to={`/register/${role}`} style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'underline' }}>
                Register here
              </Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
              <Link to="/login" style={{ color: '#64748b' }}>
                Switch Role
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
