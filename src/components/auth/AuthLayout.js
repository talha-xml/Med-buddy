import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/Logo.png';
import '../../styles/Auth.css';

export const MedicalCrossIcon = () => (
  <img
    src={logoImg}
    alt="MedBuddy Logo"
    className="medical-cross-icon"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block'
    }}
  />
);

export const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const UserIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ShieldCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function AuthLayout({ title, subtitle, centered = false, children }) {
  return (
    <div className="auth-wrapper">
      {/* Top Header */}
      <div className="auth-top-bar">
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

      {/* Main Full-Body Form */}
      <div className={`auth-fullbody-container ${centered ? 'is-centered-layout' : ''}`}>
        <div className={`auth-page-title-row ${centered ? 'centered-header' : ''}`}>
          <div className={centered ? 'title-text-center' : ''}>
            <h1 className="auth-page-title">{title}</h1>
            {subtitle && <p className="auth-page-subtitle">{subtitle}</p>}
          </div>
          <div className="auth-guarantee-badge">
            <ShieldCheckIcon />
            <span>HIPAA Compliant & Secure</span>
          </div>
        </div>

        {children}
      </div>

      {/* Footer Info */}
      <div className="auth-page-footer">
        <span>© 2026 MedBuddy Medical Appointment Scheduling System</span>
        <Link to="/terms" style={{ color: '#0284c7', textDecoration: 'none' }}>
          Terms of Service & Privacy Policy
        </Link>
      </div>
    </div>
  );
}
