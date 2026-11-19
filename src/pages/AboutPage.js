import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import {
  FaShieldAlt,
  FaUserCheck,
  FaDatabase,
  FaArrowRight
} from 'react-icons/fa';
import '../styles/AboutPage.css';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="about-hero-section">
        <span className="section-tag">About MedBuddy</span>
        <h1 className="about-hero-title">
          Empowering Seamless Healthcare Access
        </h1>
        <p className="about-hero-subtitle">
          MedBuddy was founded to eliminate hospital waiting queues, reduce administrative burden on healthcare providers, and connect patients with verified physicians in real-time.
        </p>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-content-section">
        <div className="about-split-grid">
          <div className="about-story-card">
            <h3>Our Clinical Mission</h3>
            <p>
              In traditional outpatient clinics, patients often spend hours waiting for consultations without clarity on physician availability or scheduling status.
            </p>
            <p>
              MedBuddy bridges this gap through a unified digital healthcare scheduling platform. We ensure patients can select practitioners by specialty and location, book slots with transparent real-time tracking, and receive prompt clinical confirmation.
            </p>
            <p>
              For doctors and clinic teams, MedBuddy provides an intuitive dashboard to manage incoming appointments, approve consultation requests, and keep medical schedules organized.
            </p>
          </div>

          <div className="about-values-card">
            <h3>Core Principles</h3>
            <div className="values-list">
              <div className="value-item">
                <div className="value-icon"><FaUserCheck /></div>
                <div>
                  <h4>Verified Medical Practitioners</h4>
                  <p>Every physician profile reflects authentic credentials, domain expertise, and clinical years of practice.</p>
                </div>
              </div>

              <div className="value-item">
                <div className="value-icon"><FaDatabase /></div>
                <div>
                  <h4>On-Premise Privacy & Security</h4>
                  <p>Operating on an isolated SQLite relational database to ensure strict privacy and full data control.</p>
                </div>
              </div>

              <div className="value-item">
                <div className="value-icon"><FaShieldAlt /></div>
                <div>
                  <h4>HIPAA Compliant & Confidential</h4>
                  <p>Strict role segregation prevents unauthorized cross-role access and safeguards patient medical history.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="about-metrics-section">
        <div className="about-metrics-container">
          <div className="metric-box">
            <span className="metric-number">100%</span>
            <span className="metric-label">Verified Doctors</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">24/7</span>
            <span className="metric-label">Slot Scheduling</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">8+</span>
            <span className="metric-label">Major Cities</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">Zero</span>
            <span className="metric-label">Waiting Room Queues</span>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="about-cta-section">
        <div className="about-cta-box">
          <h2>Join MedBuddy Today</h2>
          <p>
            Whether you need a consultation with a specialist or want to list your clinical practice, getting started takes less than a minute.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <button
              onClick={() => navigate('/register')}
              className="nav-register-btn"
              style={{ border: 'none', cursor: 'pointer', padding: '12px 28px', fontSize: '1rem' }}
            >
              Get Started <FaArrowRight style={{ marginLeft: '6px' }} />
            </button>
            <Link
              to="/find-doctors"
              className="nav-login-btn"
              style={{ padding: '11px 24px', fontSize: '1rem' }}
            >
              Browse Specialists
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Clinical Footer */}
      <PublicFooter />
    </div>
  );
}
