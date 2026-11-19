import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, MedicalCrossIcon } from '../../components/auth/AuthLayout';
import '../../styles/Terms.css';

export default function Terms() {
  return (
    <div className="terms-wrapper">
      {/* Top Bar */}
      <div className="terms-top-bar">
        <Link to="/" className="terms-nav-brand">
          <div className="terms-nav-icon">
            <MedicalCrossIcon />
          </div>
          <span className="terms-nav-title">MedBuddy</span>
        </Link>
      </div>

      {/* Main Body */}
      <div className="terms-fullbody-container">
        <div className="terms-header-row">
          <div>
            <div className="terms-badge">
              <ShieldCheckIcon /> Medical Privacy & Terms
            </div>
            <h1 className="terms-title">Terms of Service & Patient Privacy Policy</h1>
            <p className="terms-meta">Last updated: November 2026 | Effective for all MedBuddy healthcare users</p>
          </div>
        </div>

        <div className="terms-grid-body">
          {/* Section 1 */}
          <div className="terms-section-cardless">
            <h2>1. Medical Disclaimer & Emergency Notice</h2>
            <p>
              MedBuddy is an appointment booking and clinical scheduling management platform.
              It is <strong>not</strong> designed for emergency medical scenarios. If you are experiencing a life-threatening
              emergency, please call emergency services (e.g. 911) or visit the nearest emergency room immediately.
            </p>
          </div>

          {/* Section 2 */}
          <div className="terms-section-cardless">
            <h2>2. HIPAA Compliance & Data Security</h2>
            <p>
              We prioritize patient confidentiality and comply with applicable health data protection regulations,
              including the Health Insurance Portability and Accountability Act (HIPAA):
            </p>
            <ul>
              <li>All Protected Health Information (PHI) is encrypted in transit and at rest in local SQLite storage.</li>
              <li>Only authorized clinical staff and doctors assigned to your care have access to your booking records.</li>
              <li>We never share medical history with third-party advertisers.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="terms-section-cardless">
            <h2>3. Appointment Bookings, Cancellations & Rescheduling</h2>
            <p>
              Patients agree to provide accurate and truthful medical information when reserving a doctor consultation slot.
              Appointments must be cancelled or rescheduled at least 24 hours prior to the scheduled time to prevent disruption
              to physician clinics.
            </p>
          </div>

          {/* Section 4 */}
          <div className="terms-section-cardless">
            <h2>4. Practitioner Responsibilities</h2>
            <p>
              Practitioners and clinical providers using MedBuddy confirm that they are properly licensed, credentialed,
              and in good standing with their respective medical boards and authorities.
            </p>
          </div>

          {/* Section 5 (Spanning bottom) */}
          <div className="terms-section-cardless" style={{ gridColumn: '1 / -1' }}>
            <h2>5. User Responsibilities & Consent</h2>
            <p>
              By registering an account, you consent to receive electronic appointment confirmations, reminders, and notifications
              related to your healthcare appointments and clinical schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="terms-page-footer">
        <span>© 2026 MedBuddy Healthcare Management. Built with React & SQLite.</span>
      </div>
    </div>
  );
}
