import React from 'react';
import { Link } from 'react-router-dom';
import { MedicalCrossIcon } from '../auth/AuthLayout';
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';
import './PublicFooter.css';

export default function PublicFooter() {
  return (
    <footer className="clinical-footer">
      <div className="footer-top-strip">
        <div className="footer-container footer-strip-content">
          <div className="footer-emergency-pill">
            <FaClock style={{ color: '#38bdf8' }} />
            <span>24/7 Outpatient Scheduling Available Online</span>
          </div>
          <div className="footer-security-pill">
            <FaShieldAlt style={{ color: '#34d399' }} />
            <span>Encrypted SQLite On-Premise Relational Storage</span>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-container footer-grid">
          {/* Brand & Mission Column */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <MedicalCrossIcon />
              </div>
              <span className="footer-brand-name">MedBuddy</span>
            </div>
            <p className="footer-brand-desc">
              A comprehensive clinical scheduling platform bridging outpatient care. Book real-time consultation slots with licensed medical physicians across major clinical departments.
            </p>
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <FaMapMarkerAlt style={{ color: '#38bdf8' }} />
                <span>Punjab & Sindh Healthcare Pavilion, Pakistan</span>
              </div>
              <div className="footer-contact-item">
                <FaPhoneAlt style={{ color: '#38bdf8' }} />
                <span>+92 (300) 123-4567 • Mon - Sat, 8am - 8pm</span>
              </div>
              <div className="footer-contact-item">
                <FaEnvelope style={{ color: '#38bdf8' }} />
                <span>support@medbuddy.healthcare</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform Navigation</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  <FaArrowRight className="footer-link-arrow" /> Home
                </Link>
              </li>
              <li>
                <Link to="/services">
                  <FaArrowRight className="footer-link-arrow" /> Clinical Services
                </Link>
              </li>
              <li>
                <Link to="/find-doctors">
                  <FaArrowRight className="footer-link-arrow" /> Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/locations">
                  <FaArrowRight className="footer-link-arrow" /> Healthcare Locations
                </Link>
              </li>
              <li>
                <Link to="/about">
                  <FaArrowRight className="footer-link-arrow" /> About MedBuddy
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  <FaArrowRight className="footer-link-arrow" /> Privacy & Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Departments */}
          <div className="footer-col">
            <h4 className="footer-heading">Specialized Care</h4>
            <ul className="footer-links">
              <li>
                <Link to="/find-doctors">Cardiology & Heart Care</Link>
              </li>
              <li>
                <Link to="/find-doctors">Pediatrics & Child Health</Link>
              </li>
              <li>
                <Link to="/find-doctors">General & Internal Medicine</Link>
              </li>
              <li>
                <Link to="/find-doctors">Dental & Oral Health</Link>
              </li>
              <li>
                <Link to="/find-doctors">Psychology & Wellness</Link>
              </li>
            </ul>
          </div>

          {/* Portals & Accounts */}
          <div className="footer-col">
            <h4 className="footer-heading">Clinical Access</h4>
            <p className="footer-col-note">
              Dedicated portals tailored for both patients and healthcare practitioners.
            </p>
            <div className="footer-btn-stack">
              <Link to="/register/patient" className="footer-cta-btn primary">
                Patient Registration
              </Link>
              <Link to="/register/doctor" className="footer-cta-btn secondary">
                Doctor Credentials Sign Up
              </Link>
              <Link to="/login" className="footer-portal-link">
                Already registered? Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container footer-bottom-content">
          <span>
            © {new Date().getFullYear()} MedBuddy Healthcare Technologies. All rights reserved.
          </span>
          <div className="footer-legal-links">
            <Link to="/terms">Terms of Service</Link>
            <span className="dot-sep">•</span>
            <Link to="/terms">HIPAA Compliance & Privacy</Link>
            <span className="dot-sep">•</span>
            <Link to="/about">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
