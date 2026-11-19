import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalCrossIcon } from '../../components/auth/AuthLayout';
import {
  getAdminSession,
  adminLogin,
  adminLogout,
  DEFAULT_ADMIN_CREDENTIALS
} from '../../services/adminService';
import { getAllPatients, getAllDoctors } from '../../services/adminDataService';
import {
  getDoctorStatus,
  toggleDoctorEnabled
} from '../../services/verificationService';
import { standardCities } from '../../services/clinicalData';
import {
  FaUserShield,
  FaUserMd,
  FaUsers,
  FaCity,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaPowerOff,
  FaSignOutAlt,
  FaLock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStethoscope,
  FaInfoCircle
} from 'react-icons/fa';
import '../../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Authentication state for admin
  const [adminUser, setAdminUser] = useState(getAdminSession());
  const [loginEmail, setLoginEmail] = useState(DEFAULT_ADMIN_CREDENTIALS.email);
  const [loginPassword, setLoginPassword] = useState(DEFAULT_ADMIN_CREDENTIALS.password);
  const [loginError, setLoginError] = useState('');

  // Data states
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'patients' | 'cities'
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorStatuses, setDoctorStatuses] = useState({});
  const [actionNotice, setActionNotice] = useState('');

  // Doctor filters
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorCityFilter, setDoctorCityFilter] = useState('ALL');
  const [doctorVerifyFilter, setDoctorVerifyFilter] = useState('ALL'); // 'ALL' | 'VERIFIED' | 'UNVERIFIED'
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('ALL'); // 'ALL' | 'ENABLED' | 'DISABLED'

  // Patient filters
  const [patientSearch, setPatientSearch] = useState('');
  const [patientCityFilter, setPatientCityFilter] = useState('ALL');

  // Load records from DB / local pools
  const refreshData = useCallback(async () => {
    try {
      // First try to fetch live doctors from backend if running, else use local data service
      let docList = [];
      let patList = [];

      try {
        const res = await fetch('http://localhost:5000/api/doctors');
        if (res.ok) {
          const data = await res.json();
          docList = data.doctors || [];
        }
      } catch (e) {
        // backend offline, fall back to mock pool
      }

      if (!docList || docList.length === 0) {
        docList = getAllDoctors();
      }

      // Merge with stored doctors list so dynamically registered doctors appear
      const localDocs = getAllDoctors();
      const mergedDocsMap = new Map();
      docList.forEach((d) => mergedDocsMap.set(d.id, d));
      localDocs.forEach((d) => mergedDocsMap.set(d.id, { ...d, ...mergedDocsMap.get(d.id) }));
      const finalDocs = Array.from(mergedDocsMap.values());
      setDoctors(finalDocs);

      // Load patients
      patList = getAllPatients();
      setPatients(patList);

      // Load statuses for all doctors
      const statuses = {};
      finalDocs.forEach((d) => {
        statuses[d.id] = getDoctorStatus(d.id);
      });
      setDoctorStatuses(statuses);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      refreshData();
    }
  }, [adminUser, refreshData]);

  // Handle Admin Login
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const user = adminLogin(loginEmail, loginPassword);
      setAdminUser(user);
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    }
  };

  const handleAdminLogout = () => {
    adminLogout();
    setAdminUser(null);
  };

  // Toggle Doctor Enabled / Disabled
  const handleToggleDoctorEnabled = (doctorId, currentEnabled) => {
    const nextEnabled = !currentEnabled;
    const doc = doctors.find((d) => d.id === doctorId);
    toggleDoctorEnabled(doctorId, nextEnabled);
    setDoctorStatuses((prev) => ({
      ...prev,
      [doctorId]: {
        ...prev[doctorId],
        isEnabled: nextEnabled
      }
    }));
    showNotice(
      `Doctor credentials for ${doc?.fullName || 'Doctor'} have been ${
        nextEnabled ? 'ENABLED' : 'DISABLED'
      }.`
    );
  };

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4500);
  };

  // Metrics and City Aggregations
  const totalDoctorsCount = doctors.length;
  const totalPatientsCount = patients.length;

  const verifiedDoctorsCount = useMemo(() => {
    return doctors.filter((d) => doctorStatuses[d.id]?.isVerified).length;
  }, [doctors, doctorStatuses]);

  const disabledDoctorsCount = useMemo(() => {
    return doctors.filter((d) => doctorStatuses[d.id]?.isEnabled === false).length;
  }, [doctors, doctorStatuses]);

  // Aggregate by Cities
  const cityMetrics = useMemo(() => {
    const map = {};

    // Initialize all standard cities
    standardCities.forEach((city) => {
      map[city] = { city, doctors: 0, patients: 0, verifiedDoctors: 0, total: 0 };
    });

    // Count doctors
    doctors.forEach((doc) => {
      const city = doc.city || 'Lahore';
      if (!map[city]) {
        map[city] = { city, doctors: 0, patients: 0, verifiedDoctors: 0, total: 0 };
      }
      map[city].doctors += 1;
      if (doctorStatuses[doc.id]?.isVerified) {
        map[city].verifiedDoctors += 1;
      }
      map[city].total += 1;
    });

    // Count patients
    patients.forEach((pat) => {
      const city = pat.city || 'Lahore';
      if (!map[city]) {
        map[city] = { city, doctors: 0, patients: 0, verifiedDoctors: 0, total: 0 };
      }
      map[city].patients += 1;
      map[city].total += 1;
    });

    // Filter to cities that have records or are standard
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [doctors, patients, doctorStatuses]);

  // Filtered Doctors List
  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const status = doctorStatuses[d.id] || { isVerified: false, isEnabled: true };

      // City filter
      if (doctorCityFilter !== 'ALL' && (d.city || 'Lahore').toLowerCase() !== doctorCityFilter.toLowerCase()) {
        return false;
      }

      // Verification filter
      if (doctorVerifyFilter === 'VERIFIED' && !status.isVerified) return false;
      if (doctorVerifyFilter === 'UNVERIFIED' && status.isVerified) return false;

      // Status filter
      if (doctorStatusFilter === 'ENABLED' && status.isEnabled === false) return false;
      if (doctorStatusFilter === 'DISABLED' && status.isEnabled !== false) return false;

      // Search keyword
      if (doctorSearch.trim()) {
        const q = doctorSearch.toLowerCase();
        const name = (d.fullName || '').toLowerCase();
        const email = (d.email || '').toLowerCase();
        const specialty = (d.specialty || '').toLowerCase();
        const city = (d.city || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !specialty.includes(q) && !city.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [doctors, doctorStatuses, doctorCityFilter, doctorVerifyFilter, doctorStatusFilter, doctorSearch]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (patientCityFilter !== 'ALL' && (p.city || 'Lahore').toLowerCase() !== patientCityFilter.toLowerCase()) {
        return false;
      }

      if (patientSearch.trim()) {
        const q = patientSearch.toLowerCase();
        const name = (p.fullName || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !city.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [patients, patientCityFilter, patientSearch]);

  // ==================== RENDER: ADMIN SIGN-IN IF NOT LOGGED IN ====================
  if (!adminUser) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-box">
          <div className="admin-login-head">
            <div className="admin-icon-shield">
              <FaUserShield />
            </div>
            <h1>MedBuddy Admin Control</h1>
            <p>Access master governance, city analytics, and medical credentials verification.</p>
          </div>

          {loginError && <div className="admin-alert-error">{loginError}</div>}

          <form onSubmit={handleAdminLoginSubmit} className="admin-login-form">
            <div className="admin-input-group">
              <label>Administrator Email</label>
              <div className="admin-input-with-icon">
                <FaEnvelope className="admin-input-icon" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@medbuddy.healthcare"
                  required
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Administrator Password</label>
              <div className="admin-input-with-icon">
                <FaLock className="admin-input-icon" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="admin-demo-pill">
              <span>Demo Credentials:</span>
              <code>admin@medbuddy.healthcare</code> / <code>admin123</code>
            </div>

            <button type="submit" className="admin-primary-btn">
              Authenticate & Access Admin Portal
            </button>
          </form>

          <div className="admin-login-footer">
            <button type="button" onClick={() => navigate('/')} className="admin-back-btn">
              ← Return to MedBuddy Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER: ADMIN MAIN DASHBOARD ====================
  return (
    <div className="admin-dashboard-page">
      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-logo-badge">
            <MedicalCrossIcon />
          </div>
          <div>
            <span className="admin-app-name">MedBuddy</span>
            <span className="admin-tag-pill">Central Governance</span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <div className="admin-user-pill">
            <FaUserShield className="admin-user-icon" />
            <div className="admin-user-details">
              <span className="admin-user-name">{adminUser.fullName}</span>
              <span className="admin-user-role">Super Administrator</span>
            </div>
          </div>

          <button onClick={handleAdminLogout} className="admin-signout-btn" title="Sign Out">
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-container">
        {actionNotice && (
          <div className="admin-banner-notice">
            <FaInfoCircle />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Dashboard Title & Quick Stats */}
        <div className="admin-header-row">
          <div>
            <h1 className="admin-page-title">Healthcare Administrative Portal</h1>
            <p className="admin-page-subtitle">
              Monitor registered medical practitioners & patients across Pakistani cities, review verification status, and manage doctor portal access.
            </p>
          </div>

          <div className="admin-nav-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & Cities
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctors')}
            >
              Doctors Management ({doctors.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
              onClick={() => setActiveTab('patients')}
            >
              Registered Patients ({patients.length})
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card primary">
            <div className="metric-icon-box blue">
              <FaUsers />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Registered Patients</span>
              <h2 className="metric-value">{totalPatientsCount}</h2>
              <span className="metric-subtext">Active outpatient accounts</span>
            </div>
          </div>

          <div className="admin-metric-card purple">
            <div className="metric-icon-box purple">
              <FaUserMd />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Registered Doctors</span>
              <h2 className="metric-value">{totalDoctorsCount}</h2>
              <span className="metric-subtext">Across {cityMetrics.filter((c) => c.doctors > 0).length} cities</span>
            </div>
          </div>

          <div className="admin-metric-card green">
            <div className="metric-icon-box green">
              <FaCheckCircle />
            </div>
            <div className="metric-info">
              <span className="metric-label">Verified Doctors</span>
              <h2 className="metric-value">{verifiedDoctorsCount}</h2>
              <span className="metric-subtext">
                {totalDoctorsCount > 0
                  ? `${Math.round((verifiedDoctorsCount / totalDoctorsCount) * 100)}% verified credentials`
                  : '0% verified'}
              </span>
            </div>
          </div>

          <div className="admin-metric-card orange">
            <div className="metric-icon-box orange">
              <FaPowerOff />
            </div>
            <div className="metric-info">
              <span className="metric-label">Disabled Doctor Logins</span>
              <h2 className="metric-value">{disabledDoctorsCount}</h2>
              <span className="metric-subtext">Access revoked by Admin</span>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & CITY DISTRIBUTION */}
        {activeTab === 'overview' && (
          <div className="admin-section-card">
            <div className="admin-card-head">
              <div>
                <h2 className="admin-card-title">Geographical Distribution Across Cities</h2>
                <p className="admin-card-subtitle">
                  Real-time breakdown of registered doctors and patients across Pakistani metropolitan centers.
                </p>
              </div>

              <div className="admin-head-actions">
                <span className="admin-chip">
                  <FaCity /> {cityMetrics.filter((c) => c.total > 0).length} Active Regional Centers
                </span>
              </div>
            </div>

            <div className="city-analytics-grid">
              {cityMetrics
                .filter((c) => c.total > 0 || ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'].includes(c.city))
                .map((item) => (
                  <div key={item.city} className="city-stat-card">
                    <div className="city-card-header">
                      <div className="city-name-group">
                        <FaMapMarkerAlt className="city-pin-icon" />
                        <h3>{item.city}</h3>
                      </div>
                      <span className="city-total-badge">{item.total} Users</span>
                    </div>

                    <div className="city-counts-split">
                      <div className="city-split-item">
                        <span className="split-num doc-color">{item.doctors}</span>
                        <span className="split-label">Doctors</span>
                      </div>
                      <div className="city-split-divider" />
                      <div className="city-split-item">
                        <span className="split-num pat-color">{item.patients}</span>
                        <span className="split-label">Patients</span>
                      </div>
                      <div className="city-split-divider" />
                      <div className="city-split-item">
                        <span className="split-num ver-color">{item.verifiedDoctors}</span>
                        <span className="split-label">Verified</span>
                      </div>
                    </div>

                    {/* Proportional visual bar */}
                    <div className="city-bar-track">
                      <div
                        className="city-bar-fill-doc"
                        style={{
                          width: `${item.total ? (item.doctors / item.total) * 100 : 0}%`
                        }}
                        title={`Doctors: ${item.doctors}`}
                      />
                      <div
                        className="city-bar-fill-pat"
                        style={{
                          width: `${item.total ? (item.patients / item.total) * 100 : 0}%`
                        }}
                        title={`Patients: ${item.patients}`}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: DOCTORS MANAGEMENT & CREDENTIALS VERIFICATION */}
        {activeTab === 'doctors' && (
          <div className="admin-section-card">
            <div className="admin-card-head">
              <div>
                <h2 className="admin-card-title">Doctor Credentials & Verification Governance</h2>
                <p className="admin-card-subtitle">
                  Inspect doctors, review self-verification status, or disable login credentials instantly.
                </p>
              </div>
            </div>

            {/* Doctor Filter Controls */}
            <div className="admin-filter-bar">
              <div className="admin-search-field">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search doctor by name, email, specialty, city..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                />
              </div>

              <div className="admin-filter-selects">
                <div className="select-wrapper">
                  <FaFilter className="filter-icon" />
                  <select
                    value={doctorCityFilter}
                    onChange={(e) => setDoctorCityFilter(e.target.value)}
                  >
                    <option value="ALL">All Cities</option>
                    {standardCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="select-wrapper">
                  <select
                    value={doctorVerifyFilter}
                    onChange={(e) => setDoctorVerifyFilter(e.target.value)}
                  >
                    <option value="ALL">All Verification Statuses</option>
                    <option value="VERIFIED">Verified Doctors Only</option>
                    <option value="UNVERIFIED">Unverified Doctors (Default)</option>
                  </select>
                </div>

                <div className="select-wrapper">
                  <select
                    value={doctorStatusFilter}
                    onChange={(e) => setDoctorStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Account States</option>
                    <option value="ENABLED">Active / Enabled Only</option>
                    <option value="DISABLED">Disabled Login Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Doctors Table */}
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor / Practitioner</th>
                    <th>Clinical Specialty</th>
                    <th>City & Region</th>
                    <th>Verification Status</th>
                    <th>Login Access</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-empty-cell">
                        No doctors match the selected search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doc, idx) => {
                      const status = doctorStatuses[doc.id] || {
                        isVerified: false,
                        isEnabled: true
                      };
                      const isVerified = status.isVerified;
                      const isEnabled = status.isEnabled !== false;

                      return (
                        <tr key={doc.id} className={!isEnabled ? 'row-disabled' : ''}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-avatar-mini doctor">
                                {doc.fullName?.charAt(0) || 'D'}
                              </div>
                              <div>
                                <div className="admin-cell-title">{doc.fullName}</div>
                                <div className="admin-cell-sub">{doc.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="specialty-badge">
                              <FaStethoscope />
                              <span>{doc.specialty || 'General Practitioner'}</span>
                            </div>
                            {doc.yearsOfExperience ? (
                              <div className="admin-cell-sub">
                                {doc.yearsOfExperience} yrs experience
                              </div>
                            ) : null}
                          </td>

                          <td>
                            <div className="admin-city-tag">
                              <FaMapMarkerAlt />
                              <span>{doc.city || 'Lahore'}</span>
                            </div>
                          </td>

                          <td>
                            {isVerified ? (
                              <span className="status-badge verified">
                                <FaCheckCircle /> Verified Physician
                              </span>
                            ) : (
                              <span className="status-badge unverified">
                                <FaTimesCircle /> Not Verified (Default)
                              </span>
                            )}
                          </td>

                          <td>
                            {isEnabled ? (
                              <span className="status-badge enabled">Active / Allowed</span>
                            ) : (
                              <span className="status-badge disabled">
                                <FaPowerOff /> Login Disabled
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="admin-action-btn-group">
                              {/* Enable / Disable Doctor Credentials Button (Disabled if doctor is verified) */}
                              <button
                                type="button"
                                className={`action-pill-btn ${isEnabled ? 'btn-danger' : 'btn-enable'}`}
                                onClick={() => handleToggleDoctorEnabled(doc.id, isEnabled)}
                                disabled={isVerified}
                                title={
                                  isVerified
                                    ? 'Verified doctors cannot be disabled'
                                    : isEnabled
                                    ? 'Disable Doctor Login'
                                    : 'Enable Doctor Login'
                                }
                                style={
                                  isVerified
                                    ? { opacity: 0.45, cursor: 'not-allowed', backgroundColor: '#94a3b8' }
                                    : {}
                                }
                              >
                                {isVerified ? 'Cannot Disable (Verified)' : isEnabled ? 'Disable Doctor' : 'Enable Doctor'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED PATIENTS DIRECTORY */}
        {activeTab === 'patients' && (
          <div className="admin-section-card">
            <div className="admin-card-head">
              <div>
                <h2 className="admin-card-title">Registered Patients Roster</h2>
                <p className="admin-card-subtitle">
                  Browse all active patient accounts and their demographic distributions.
                </p>
              </div>
            </div>

            {/* Patient Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-field">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search patient by name, email, city..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              <div className="select-wrapper">
                <FaFilter className="filter-icon" />
                <select
                  value={patientCityFilter}
                  onChange={(e) => setPatientCityFilter(e.target.value)}
                >
                  <option value="ALL">All Cities</option>
                  {standardCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patients Table */}
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email Address</th>
                    <th>City & Region</th>
                    <th>Contact Phone</th>
                    <th>Blood Group</th>
                    <th>Allergies</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-empty-cell">
                        No patient records found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((pat) => (
                      <tr key={pat.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar-mini patient">
                              {pat.fullName?.charAt(0) || 'P'}
                            </div>
                            <div className="admin-cell-title">{pat.fullName}</div>
                          </div>
                        </td>
                        <td>{pat.email}</td>
                        <td>
                          <div className="admin-city-tag">
                            <FaMapMarkerAlt />
                            <span>{pat.city || 'Lahore'}</span>
                          </div>
                        </td>
                        <td>{pat.phone || '—'}</td>
                        <td>
                          {pat.bloodGroup ? (
                            <span className="blood-pill">{pat.bloodGroup}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span className="allergy-text">{pat.allergies || 'None'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
