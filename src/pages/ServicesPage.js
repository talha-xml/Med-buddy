import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { clinicalServices } from '../services/clinicalData';
import { FaCheck, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import './ServicesPage.css';

export default function ServicesPage() {
  return (
    <div className="services-page">
      <PublicNavbar />

      {/* Header Banner */}
      <section className="services-hero">
        <span className="section-tag">Clinical Departments & Care</span>
        <h1 className="services-hero-title">Our Healthcare Services</h1>
        <p className="services-hero-subtitle">
          Comprehensive, multi-disciplinary medical services provided by board-certified doctors, specialists, and clinical staff.
        </p>
      </section>

      {/* Main Services Grid */}
      <section className="services-content-section">
        <div className="services-detailed-grid">
          {clinicalServices.map((service, idx) => (
            <div className="service-detail-card" key={service.id}>
              <div className="service-detail-header">
                <div className="service-detail-icon">{service.icon}</div>
                <div>
                  <span className="service-idx-badge">Department 0{idx + 1}</span>
                  <h3>{service.title}</h3>
                </div>
              </div>

              <p className="service-detail-desc">{service.desc}</p>

              <div className="service-features-list">
                <div className="service-feature-item">
                  <FaCheck className="feature-check-icon" />
                  <span>Licensed physician consultation</span>
                </div>
                <div className="service-feature-item">
                  <FaCheck className="feature-check-icon" />
                  <span>Routine diagnostic follow-ups</span>
                </div>
                <div className="service-feature-item">
                  <FaCheck className="feature-check-icon" />
                  <span>Electronic medical scheduling</span>
                </div>
              </div>

              <div className="service-card-footer">
                <Link to="/find-doctors" className="service-action-btn">
                  Find Doctors in this Field <FaArrowRight style={{ fontSize: '0.8rem' }} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Box */}
      <section className="services-trust-section">
        <div className="services-trust-card">
          <div className="trust-icon-box">
            <FaShieldAlt />
          </div>
          <div>
            <h3>HIPAA-Compliant & Clinical Standard Care</h3>
            <p>
              Every department complies with rigorous international healthcare protocols. Consultations and records are stored confidentially in our secure SQLite database.
            </p>
          </div>
          <Link to="/register/patient" className="nav-register-btn" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
            Book Consultation
          </Link>
        </div>
      </section>

      {/* Modern Clinical Footer */}
      <PublicFooter />
    </div>
  );
}
