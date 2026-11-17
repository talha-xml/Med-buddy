import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { ShieldCheckIcon } from '../components/auth/AuthLayout';
import doctorHeroImg from '../assets/doctor-hero-bg.jpg';
import { FaArrowRight, FaUserMd, FaHospital, FaClock, FaCheckCircle } from 'react-icons/fa';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page template-style">
      <PublicNavbar />

      {/* Hero Section matching the doctor template design */}
      <section
        className="template-hero-section"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.25) 75%, transparent 100%), url(${doctorHeroImg})`
        }}
      >
        <div className="template-hero-container">
          <div className="template-hero-content">
            <div className="template-hero-badge">
              <ShieldCheckIcon /> Certified Healthcare Scheduling Platform
            </div>
            <h1 className="template-hero-title">
              Healthcare Appointments <br />
              <span>Made Simple & Effortless</span>
            </h1>
            <p className="template-hero-subtitle">
              Connect with top-rated medical specialists, manage clinic appointments, and take control of your healthcare journey with real-time slot scheduling.
            </p>

            <div className="template-hero-btn-row">
              <button
                className="template-primary-btn"
                onClick={() => navigate('/register')}
              >
                Make An Appointment <FaArrowRight style={{ marginLeft: '8px', fontSize: '0.9rem' }} />
              </button>
              <Link to="/find-doctors" className="template-secondary-btn">
                Explore Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid: Why Choose MedBuddy (No horizontal lines) */}
      <section className="home-section clean-section">
        <div className="section-head">
          <span className="section-tag">Why Choose MedBuddy</span>
          <h2 className="section-title">A Modern Healthcare Experience</h2>
          <p className="section-subtitle">
            Engineered to streamline outpatient workflows, enhance doctor-patient communication, and eliminate waiting room friction.
          </p>
        </div>

        <div className="stats-banner-row">
          <div className="stats-banner-item">
            <div className="stats-icon-circle"><FaUserMd /></div>
            <h3>Verified Physicians</h3>
            <p>Access certified clinical specialists and practitioners across top hospitals.</p>
          </div>
          <div className="stats-banner-item">
            <div className="stats-icon-circle"><FaHospital /></div>
            <h3>Multi-City Support</h3>
            <p>Discover clinics and practitioners in Lahore, Karachi, Islamabad, and nationwide.</p>
          </div>
          <div className="stats-banner-item">
            <div className="stats-icon-circle"><FaClock /></div>
            <h3>Real-Time Slots</h3>
            <p>Select flexible morning, afternoon, and evening slots that fit your daily schedule.</p>
          </div>
          <div className="stats-banner-item">
            <div className="stats-icon-circle"><FaCheckCircle /></div>
            <h3>Instant Tracking</h3>
            <p>Live status updates from submission to doctor confirmation and completion.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner (No horizontal lines) */}
      <section className="home-section clean-section" style={{ paddingBottom: '70px' }}>
        <div className="home-cta-card">
          <h2>Ready to Schedule Your Next Consultation?</h2>
          <p>
            Join thousands of patients who have streamlined their medical visits. Create a patient account in under a minute or explore practitioners in your city.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
            <Link to="/register/patient" className="nav-register-btn" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Register as Patient
            </Link>
            <Link to="/register/doctor" className="nav-login-btn" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Join as Medical Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Clinical Footer */}
      <PublicFooter />
    </div>
  );
}
