import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MedicalCrossIcon, UserIcon } from '../../components/auth/AuthLayout';
import { FaArrowRight, FaStethoscope } from 'react-icons/fa';
import '../../styles/RoleSelect.css';

export default function RoleSelect() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode is 'register' or 'login'
  const isRegister = location.pathname.includes('register') || location.pathname.includes('signup');
  const targetAction = isRegister ? 'register' : 'login';

  return (
    <div className="role-select-wrapper">
      {/* Top Navbar */}
      <div className="role-select-topbar">
        <Link to="/" className="auth-nav-brand">
          <div className="auth-nav-icon">
            <MedicalCrossIcon />
          </div>
          <span className="auth-nav-title">MedBuddy</span>
        </Link>
        <Link to="/" className="auth-back-home">
          ← Back to Home
        </Link>
      </div>

      {/* Main Selection Body */}
      <div className="role-select-content">
        <div className="role-select-head">
          <h1>
            {isRegister
              ? 'Are you Registering as a Patient or Doctor?'
              : 'Are you Signing In as a Patient or Doctor?'}
          </h1>
          <p>
            {isRegister
              ? 'Choose your role to open the dedicated registration form tailored for your needs.'
              : 'Choose your account type to access your specialized healthcare portal.'}
          </p>
        </div>

        <div className="role-cards-container">
          {/* Patient Card */}
          <div
            className="role-select-card"
            role="button"
            onClick={() => navigate(`/${targetAction}/patient`)}
          >
            <div>
              <div className="role-select-icon">
                <UserIcon size={32} />
              </div>
              <h3>I am a Patient</h3>
              <p>
                {isRegister
                  ? 'Create a patient record, book doctor appointments, track clinical visits, and manage healthcare information.'
                  : 'Sign in to schedule doctor consultations, check visit approvals, and review medical records.'}
              </p>
            </div>
            <div className="role-select-action">
              <span>{isRegister ? 'Continue to Patient Registration' : 'Patient Sign In'}</span>
              <FaArrowRight />
            </div>
          </div>

          {/* Doctor Card */}
          <div
            className="role-select-card doctor"
            role="button"
            onClick={() => navigate(`/${targetAction}/doctor`)}
          >
            <div>
              <div className="role-select-icon">
                <FaStethoscope style={{ width: '32px', height: '32px' }} />
              </div>
              <h3>I am a Doctor / Practitioner</h3>
              <p>
                {isRegister
                  ? 'Register clinical credentials, specialty, years of experience, and clinical expertise to accept patient bookings.'
                  : 'Sign in to review appointment requests, approve patient slots, and manage your daily clinic schedule.'}
              </p>
            </div>
            <div className="role-select-action">
              <span>{isRegister ? 'Continue to Doctor Registration' : 'Doctor Sign In'}</span>
              <FaArrowRight />
            </div>
          </div>
        </div>

        <div className="role-select-bottom-prompt">
          {isRegister ? (
            <span>
              Already have an account? <Link to="/login">Sign In here</Link>
            </span>
          ) : (
            <span>
              Don't have an account yet? <Link to="/register">Register here</Link>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="role-select-footer">
        © 2026 MedBuddy Healthcare Management. Built with React & SQLite.
      </div>
    </div>
  );
}
