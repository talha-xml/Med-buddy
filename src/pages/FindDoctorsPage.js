import React from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import {
  FaCalendarCheck,
  FaUserMd,
  FaShieldAlt,
  FaClock,
  FaHospital
} from 'react-icons/fa';
import '../styles/FindDoctorsPage.css';

export default function FindDoctorsPage() {
  return (
    <div className="find-doctors-page">
      <PublicNavbar />

      {/* Main Promotional & Informational Showcase Hero */}
      <section className="find-doctors-hero" style={{ padding: '60px 24px 80px', maxWidth: '1000px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #e0f2fe, #ccfbf1)',
            color: '#0369a1',
            padding: '6px 18px',
            borderRadius: '24px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '16px',
            border: '1px solid #bae6fd'
          }}
        >
          <FaCalendarCheck style={{ color: '#0284c7' }} />
          <span>Streamlined Medical Scheduling</span>
        </div>

        <h1 className="find-doctors-title" style={{ fontSize: '2.8rem', lineHeight: 1.25 }}>
          Looking for booking appointment? <br />
          <span style={{ color: '#0284c7' }}>MedBuddy Makes it all Easy</span>
        </h1>

        <p className="find-doctors-subtitle" style={{ maxWidth: '720px', fontSize: '1.15rem' }}>
          Connect with certified specialists, select your consultation slot, and receive clinical confirmations with zero wait times. Fast, confidential, and fully digital.
        </p>

        {/* Feature Cards Showcase */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '40px',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '18px'
              }}
            >
              <FaUserMd />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
              Verified Medical Specialists
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              All doctors across all 21 departments are credential-checked with documented clinical experience, consultation hours, and domain expertise.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ccfbf1',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '18px'
              }}
            >
              <FaClock />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
              1-Hour Flexible Time Slots
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Pick any hour that fits your schedule with smart 1-hour session tracking, conflict protection, and automatic day-part detection.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '18px'
              }}
            >
              <FaHospital />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
              Nationwide Coverage
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Full coverage across 12 major metropolitan areas including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and more.
            </p>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div
          style={{
            marginTop: '40px',
            padding: '24px 30px',
            background: 'linear-gradient(135deg, #f0fdfa, #f8fafc)',
            border: '1.5px solid #ccfbf1',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#ccfbf1',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0
            }}
          >
            <FaShieldAlt />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#0f766e', fontSize: '1.05rem', fontWeight: 700 }}>
              Confidentiality & Medical Record Security
            </h4>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Physician schedules and patient appointment requests are kept completely private and secure within your verified personal portal.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Clinical Footer */}
      <PublicFooter />
    </div>
  );
}
