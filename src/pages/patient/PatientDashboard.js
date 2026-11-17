import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import ProfileModal from '../../components/layout/ProfileModal';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import '../../components/layout/DangerZone.css';
import {
  fetchAppointments,
  fetchDoctors,
  createAppointment,
  updateAppointmentStatus,
  getUserProfile
} from '../../services/apiService';
import { standardSpecialties, standardCities } from '../../services/clinicalData';
import { FaSearch, FaMapMarkerAlt, FaStar, FaPhoneAlt, FaUserMd, FaStethoscope } from 'react-icons/fa';
import SearchableCombobox from '../../components/common/SearchableCombobox';

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'doctors' | 'book'
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState(currentUser?.city || 'Lahore');

  // Appointments List Filter & Search State
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('ALL');

  // Read-only modal state
  const [viewingUser, setViewingUser] = useState(null);

  // All registered doctors pool across system (for real-time booking filtering)
  const [allDoctorsPool, setAllDoctorsPool] = useState([]);

  // Booking Form State: Default to empty fields as requested
  const [bookingCity, setBookingCity] = useState('');
  const [bookingSpecialty, setBookingSpecialty] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [bookingReason, setBookingReason] = useState('');

  // Sync state whenever currentUser updates or re-loads
  useEffect(() => {
    if (currentUser) {
      if (currentUser.city) {
        setSelectedCity(currentUser.city);
      }
    }
  }, [currentUser]);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const cityParam = selectedCity === 'ALL' ? undefined : selectedCity;
      const specialtyParam = selectedSpecialty === 'ALL' ? undefined : selectedSpecialty;
      const [apts, docList, allDocs] = await Promise.all([
        fetchAppointments({ patientId: currentUser.id }),
        fetchDoctors({
          city: cityParam,
          specialty: specialtyParam,
          search: searchQuery
        }),
        fetchDoctors() // for listing all distinct specialties and complete doctor pool
      ]);
      setAppointments(apts);
      setDoctors(docList);
      setAllDoctorsPool(allDocs);

      const dbSpecs = allDocs.map((d) => d.specialty).filter(Boolean);
      const combinedSpecialties = Array.from(new Set([...standardSpecialties, ...dbSpecs])).sort();
      setAllSpecialties(combinedSpecialties);
    } catch (err) {
      console.error('Failed to load patient dashboard data:', err);
    }
  }, [currentUser, selectedCity, selectedSpecialty, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedDoctorId || !bookingDate || !bookingTime || !bookingReason) {
      setErrorMsg('Please fill out all booking fields.');
      return;
    }

    const doctor = allDoctorsPool.find((d) => d.id === selectedDoctorId) || doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor) {
      setErrorMsg('Selected doctor is not found. Please choose a doctor from the list.');
      return;
    }

    setLoading(true);
    try {
      await createAppointment({
        patientId: currentUser.id,
        patientName: currentUser.fullName,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        specialty: doctor.specialty || 'General Care',
        date: bookingDate,
        time: bookingTime,
        reason: bookingReason
      });

      setSuccessMsg(
        'Appointment request submitted! Status is Pending until reviewed and approved by the doctor.'
      );
      setBookingReason('');
      setBookingDate('');
      await loadData();
      setActiveTab('appointments');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Could not submit appointment booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateAppointmentStatus(id, 'Cancelled');
        await loadData();
      } catch (err) {
        alert(err.message || 'Error cancelling appointment.');
      }
    }
  };

  const handleViewDoctorProfile = async (doctorId) => {
    try {
      const doc = await getUserProfile(doctorId);
      setViewingUser(doc);
    } catch (err) {
      alert('Could not load practitioner profile.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (appointmentStatusFilter !== 'ALL' && apt.status.toUpperCase() !== appointmentStatusFilter) {
      return false;
    }
    if (appointmentSearch.trim()) {
      const q = appointmentSearch.toLowerCase().trim();
      const doctorName = (apt.doctorName || '').toLowerCase();
      if (!doctorName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header-bar">
            <div className="dashboard-welcome">
              <h1>Hello, {currentUser?.fullName}</h1>
              <p>Manage your medical appointments, find specialists, and view health details.</p>
            </div>

            <div className="nav-tabs">
              <button
                className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                My Appointments
              </button>
              <button
                className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
                onClick={() => setActiveTab('doctors')}
              >
                Find Doctors
              </button>
            </div>
          </div>

          {successMsg && <div className="success-banner">{successMsg}</div>}
          {errorMsg && <div className="auth-error-alert">{errorMsg}</div>}

          {/* Quick Metrics */}
          <div className="stat-cards-grid">
            <div className="stat-card">
              <span className="stat-title">Total Appointments</span>
              <span className="stat-value">{appointments.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Pending Approval</span>
              <span className="stat-value" style={{ color: '#d97706' }}>
                {appointments.filter((a) => a.status === 'Pending').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Confirmed Visits</span>
              <span className="stat-value" style={{ color: 'var(--primary)' }}>
                {appointments.filter((a) => a.status === 'Confirmed').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Registered Doctors</span>
              <span className="stat-value" style={{ color: 'var(--secondary)' }}>
                {doctors.length}
              </span>
            </div>
          </div>

          {/* Tab 1: Appointments List */}
          {activeTab === 'appointments' && (
            <div className="card-section">
              <div
                className="card-section-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <h3 className="card-section-title" style={{ margin: 0 }}>
                    Your Scheduled Consultations
                  </h3>
                  <button className="action-btn-sm" onClick={() => setActiveTab('book')}>
                    + New Booking
                  </button>
                </div>

                {/* Controls: Search Doctor by Name & Status Filter */}
                <div
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}
                >
                  {/* Search Doctor by Name */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <FaSearch
                      style={{
                        position: 'absolute',
                        left: '12px',
                        color: '#94a3b8',
                        fontSize: '0.85rem'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search doctor by name..."
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      className="input-field"
                      style={{
                        paddingLeft: '32px',
                        paddingRight: '12px',
                        fontSize: '0.85rem',
                        width: '210px',
                        height: '36px',
                        backgroundColor: '#f8fafc'
                      }}
                    />
                    {appointmentSearch && (
                      <button
                        type="button"
                        onClick={() => setAppointmentSearch('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Filter Status */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter:</span>
                    <select
                      className="input-field"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        width: 'auto',
                        height: '36px'
                      }}
                      value={appointmentStatusFilter}
                      onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  {appointments.length === 0 ? (
                    <>
                      <p>You have no scheduled appointments yet.</p>
                      <button
                        className="auth-submit-btn"
                        style={{ maxWidth: '220px', margin: '0 auto' }}
                        onClick={() => setActiveTab('book')}
                      >
                        Book Your First Appointment
                      </button>
                    </>
                  ) : (
                    <p>
                      {appointmentSearch.trim()
                        ? `No appointments found matching doctor "${appointmentSearch}".`
                        : 'No appointments match the selected filter.'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="appointment-grid">
                  {filteredAppointments.map((apt) => (
                    <div className="appointment-item" key={apt.id}>
                      <div className="apt-left">
                        <div className="apt-calendar-badge">
                          <div className="date-day">{apt.date.split('-')[2] || '📅'}</div>
                          <div className="date-sub">{apt.date}</div>
                        </div>
                        <div className="apt-details">
                          <h4>
                            <span
                              className="clickable-name"
                              title="Click to view doctor credentials"
                              onClick={() => handleViewDoctorProfile(apt.doctorId)}
                            >
                              {apt.doctorName}
                            </span>
                          </h4>
                          <p>
                            <strong>Specialty:</strong> {apt.specialty} | <strong>Time:</strong>{' '}
                            {apt.time}
                          </p>
                          <p style={{ marginTop: '4px' }}>
                            <strong>Reason:</strong> {apt.reason}
                          </p>
                        </div>
                      </div>

                      <div className="apt-right">
                        <button
                          className="action-btn-sm"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleViewDoctorProfile(apt.doctorId)}
                        >
                          View Dr Profile
                        </button>

                        <span className={`status-pill ${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                        {apt.status !== 'Cancelled' && (
                          <button
                            className="action-btn-sm cancel"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Find Doctors with Location & Specialty Filtered Search */}
          {activeTab === 'doctors' && (
            <div>
              {/* Filtered Search Form Box */}
              <div className="doctor-search-box">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadData();
                  }}
                  className="search-form-row"
                >
                  {/* Name or Keyword Search */}
                  <div className="search-input-wrapper">
                    <span className="search-input-icon">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Search doctor by name or clinical keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Location / City Filter */}
                  <div className="search-filter-select">
                    <select
                      className="input-field"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="ALL">All Cities / Locations</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                  </div>

                  {/* Specialty Filter */}
                  <div className="search-filter-select">
                    <select
                      className="input-field"
                      value={selectedSpecialty}
                      onChange={(e) => {
                        setSelectedSpecialty(e.target.value);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="ALL">All Medical Specialties</option>
                      {allSpecialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <button type="submit" className="search-btn">
                    Search Doctors
                  </button>

                  <button
                    type="button"
                    className="search-reset-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('ALL');
                      setSelectedSpecialty('ALL');
                    }}
                  >
                    Reset
                  </button>
                </form>
              </div>

              {/* Doctors Directory List */}
              <div className="card-section">
                <div className="card-section-header">
                  <div>
                    <h3 className="card-section-title">
                      Available Doctors & Specialists ({doctors.length})
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                      Filtered by City:{' '}
                      <strong>{selectedCity === 'ALL' ? 'All Cities' : selectedCity}</strong> |
                      Specialty:{' '}
                      <strong>
                        {selectedSpecialty === 'ALL' ? 'All Specialties' : selectedSpecialty}
                      </strong>
                    </p>
                  </div>

                  <button className="action-btn-sm" onClick={() => setActiveTab('book')}>
                    + Book Slot Directly
                  </button>
                </div>

                {doctors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                      No doctors found matching your search criteria.
                    </p>
                    <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                      Try choosing <strong>All Cities</strong> or resetting the filters to view all
                      registered physicians.
                    </p>
                    <button
                      className="auth-submit-btn"
                      style={{ marginTop: '16px', maxWidth: '200px' }}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCity('ALL');
                        setSelectedSpecialty('ALL');
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="directory-grid">
                    {doctors.map((doc) => (
                      <div className="directory-card" key={doc.id}>
                        <div>
                          <div className="directory-card-top">
                            <div className="directory-avatar">{doc.fullName.charAt(0) || 'D'}</div>
                            <div className="directory-head-info">
                              <h4>{doc.fullName}</h4>
                              <span className="directory-spec-badge">
                                {doc.specialty || 'General Practitioner'}
                              </span>
                              <div className="directory-exp">
                                <FaStar style={{ color: '#eab308', marginRight: '4px' }} />
                                {doc.yearsOfExperience
                                  ? `${doc.yearsOfExperience} Years Exp`
                                  : 'Licensed Doctor'}
                              </div>
                            </div>
                          </div>

                          {doc.experienceDomain && (
                            <div className="directory-domain">
                              <strong>Domain: </strong>
                              {doc.experienceDomain}
                            </div>
                          )}

                          <ul className="directory-meta">
                            <li>
                              <FaMapMarkerAlt style={{ color: '#0284c7' }} />
                              <span>
                                <strong>{doc.city || 'City N/A'}</strong>,{' '}
                                {doc.country || 'Pakistan'}
                                {doc.clinicAddress ? ` • ${doc.clinicAddress}` : ''}
                              </span>
                            </li>
                            <li>
                              <FaPhoneAlt style={{ color: '#94a3b8' }} />
                              <span>{doc.phone || 'Available upon booking'}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="directory-actions">
                          <button
                            className="directory-book-btn"
                            onClick={() => {
                              setSelectedDoctorId(doc.id);
                              if (doc.city) setBookingCity(doc.city);
                              if (doc.specialty) setBookingSpecialty(doc.specialty);
                              setActiveTab('book');
                            }}
                          >
                            Book Appointment
                          </button>
                          <button
                            className="directory-view-btn"
                            onClick={() => handleViewDoctorProfile(doc.id)}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Book Appointment Form */}
          {activeTab === 'book' && (() => {
            // Real-time dynamic doctor filtering based on Location, Specialty, and Doctor search inputs
            const matchingDoctors = allDoctorsPool.filter((doc) => {
              if (bookingCity && bookingCity !== 'ALL') {
                if ((doc.city || '').toLowerCase().trim() !== bookingCity.toLowerCase().trim()) {
                  return false;
                }
              }
              if (bookingSpecialty && bookingSpecialty !== 'ALL') {
                if ((doc.specialty || '').toLowerCase().trim() !== bookingSpecialty.toLowerCase().trim()) {
                  return false;
                }
              }
              return true;
            });

            // City dropdown options (standard cities + any in database)
            const availableCities = Array.from(
              new Set([...standardCities, ...allDoctorsPool.map((d) => d.city).filter(Boolean)])
            );
            const cityOptions = [
              { value: 'ALL', label: 'All Locations (Nationwide)', subLabel: 'Show doctors across all cities' },
              ...availableCities.map((c) => ({
                value: c,
                label: c,
                subLabel: 'Pakistan'
              }))
            ];

            // Specialty options
            const specialtyOptions = [
              { value: 'ALL', label: 'All Specialties', subLabel: 'Any medical field' },
              ...allSpecialties.map((s) => ({
                value: s,
                label: s,
                subLabel: 'Medical Specialty'
              }))
            ];

            // Matching doctors as combobox options
            const doctorOptions = matchingDoctors.map((doc) => ({
              value: doc.id,
              label: doc.fullName,
              subLabel: `${doc.specialty || 'General Care'} • ${doc.city || 'City N/A'} • ${doc.yearsOfExperience ? `${doc.yearsOfExperience} yrs exp` : 'Licensed'}`
            }));

            // Currently selected doctor object
            const currentSelectedDoctor = allDoctorsPool.find((d) => d.id === selectedDoctorId);

            return (
              <div className="booking-form-box">
                <div className="card-section-header">
                  <div>
                    <h3 className="card-section-title">Reserve a Medical Consultation Slot</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                      Filter by Location and Medical Specialty to view matching licensed physicians in real time.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: matchingDoctors.length > 0 ? '#0d9488' : '#e11d48',
                        background: matchingDoctors.length > 0 ? '#ccfbf1' : '#ffe4e6',
                        padding: '4px 12px',
                        borderRadius: '20px'
                      }}
                    >
                      {matchingDoctors.length} {matchingDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
                    </span>
                  </div>
                </div>

                <form onSubmit={handleBookSubmit}>
                  {/* Row 1: Separate Location, Specialty, and Doctor Name with Search + Dropdown */}
                  <div className="booking-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {/* 1. Location / City */}
                    <div className="form-group">
                      <label>1. Location / City</label>
                      <SearchableCombobox
                        icon={<FaMapMarkerAlt />}
                        placeholder="Search city e.g. Lahore..."
                        options={cityOptions}
                        value={bookingCity}
                        onChange={(newCity) => {
                          setBookingCity(newCity);
                          // If current selected doctor doesn't match new city, clear or auto-select
                          if (selectedDoctorId) {
                            const stillValid = allDoctorsPool.some(
                              (d) =>
                                d.id === selectedDoctorId &&
                                (!newCity || newCity === 'ALL' || (d.city || '').toLowerCase() === newCity.toLowerCase())
                            );
                            if (!stillValid) setSelectedDoctorId('');
                          }
                        }}
                      />
                    </div>

                    {/* 2. Medical Specialty */}
                    <div className="form-group">
                      <label>2. Medical Specialty</label>
                      <SearchableCombobox
                        icon={<FaStethoscope />}
                        placeholder="Search specialty e.g. Cardiology..."
                        options={specialtyOptions}
                        value={bookingSpecialty}
                        onChange={(newSpec) => {
                          setBookingSpecialty(newSpec);
                          // If current selected doctor doesn't match new specialty, clear
                          if (selectedDoctorId) {
                            const stillValid = allDoctorsPool.some(
                              (d) =>
                                d.id === selectedDoctorId &&
                                (!newSpec || newSpec === 'ALL' || (d.specialty || '').toLowerCase() === newSpec.toLowerCase())
                            );
                            if (!stillValid) setSelectedDoctorId('');
                          }
                        }}
                      />
                    </div>

                    {/* 3. Name of Doctor */}
                    <div className="form-group">
                      <label>3. Physician / Doctor Name</label>
                      <SearchableCombobox
                        icon={<FaUserMd />}
                        placeholder={
                          matchingDoctors.length > 0
                            ? 'Search doctor by name...'
                            : 'No doctors match current filters'
                        }
                        options={doctorOptions}
                        value={selectedDoctorId}
                        onChange={(newDocId) => {
                          setSelectedDoctorId(newDocId);
                          // Auto sync city and specialty if selected directly from doctor dropdown
                          const docObj = allDoctorsPool.find((d) => d.id === newDocId);
                          if (docObj) {
                            if (docObj.city) setBookingCity(docObj.city);
                            if (docObj.specialty) setBookingSpecialty(docObj.specialty);
                          }
                        }}
                        emptyText="No matching doctor for current filters"
                        required
                      />
                    </div>
                  </div>

                  {/* Real-time Matching Doctors Quick Selector Bar */}
                  <div className="booking-live-matches-card">
                    <div className="booking-live-matches-header">
                      <div className="booking-live-matches-title">
                        <FaSearch style={{ color: '#0284c7' }} />
                        <span>Matching Doctors ({matchingDoctors.length})</span>
                      </div>
                      {(bookingCity || bookingSpecialty) && (
                        <button
                          type="button"
                          className="search-reset-btn"
                          style={{ padding: '3px 10px', fontSize: '0.8rem' }}
                          onClick={() => {
                            setBookingCity('');
                            setBookingSpecialty('');
                            setSelectedDoctorId('');
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {matchingDoctors.length === 0 ? (
                      <div style={{ fontSize: '0.88rem', color: '#64748b', padding: '10px 0' }}>
                        No registered doctor matches <strong>{bookingCity ? (bookingCity === 'ALL' ? 'All Cities' : bookingCity) : 'selected city'}</strong> and{' '}
                        <strong>{bookingSpecialty ? (bookingSpecialty === 'ALL' ? 'All Specialties' : bookingSpecialty) : 'selected specialty'}</strong>.
                        Try clearing or changing the filters above.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          overflowX: 'auto',
                          padding: '6px 2px 8px'
                        }}
                      >
                        {matchingDoctors.map((doc) => {
                          const isSelected = doc.id === selectedDoctorId;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => setSelectedDoctorId(doc.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border: isSelected ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                                background: isSelected ? '#eff6ff' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                flexShrink: 0
                              }}
                            >
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: isSelected ? '#0284c7' : '#e2e8f0',
                                  color: isSelected ? '#ffffff' : '#334155',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.85rem'
                                }}
                              >
                                {doc.fullName.charAt(0) || 'D'}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span
                                  style={{
                                    fontSize: '0.88rem',
                                    fontWeight: isSelected ? 700 : 600,
                                    color: '#0f172a'
                                  }}
                                >
                                  {doc.fullName}
                                </span>
                                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                  {doc.specialty || 'General Care'} • {doc.city || 'City N/A'}
                                </span>
                              </div>
                              {isSelected && (
                                <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Highlight Selected Doctor Preview */}
                  {currentSelectedDoctor && (
                    <div className="booking-selected-doctor-summary">
                      <div className="booking-selected-doctor-info">
                        <div className="booking-selected-doctor-avatar">
                          {currentSelectedDoctor.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
                              {currentSelectedDoctor.fullName}
                            </strong>
                            <span className="directory-spec-badge" style={{ fontSize: '0.78rem' }}>
                              {currentSelectedDoctor.specialty || 'General Care'}
                            </span>
                          </div>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
                            <FaMapMarkerAlt style={{ color: '#0284c7', marginRight: '4px' }} />
                            {currentSelectedDoctor.city || 'City N/A'}, {currentSelectedDoctor.country || 'Pakistan'}
                            {currentSelectedDoctor.experienceDomain ? ` • ${currentSelectedDoctor.experienceDomain}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="directory-view-btn"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => handleViewDoctorProfile(currentSelectedDoctor.id)}
                      >
                        View Profile
                      </button>
                    </div>
                  )}

                  {/* Row 2: Date & Time Slot (Standard fields) */}
                  <div className="booking-grid" style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label>Preferred Date</label>
                      <input
                        type="date"
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Time Slot</label>
                      <select
                        className="input-field"
                        style={{ paddingLeft: '14px' }}
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        required
                      >
                        <option value="09:00 AM">09:00 AM - Morning</option>
                        <option value="10:00 AM">10:00 AM - Morning</option>
                        <option value="11:30 AM">11:30 AM - Morning</option>
                        <option value="02:00 PM">02:00 PM - Afternoon</option>
                        <option value="03:30 PM">03:30 PM - Afternoon</option>
                        <option value="04:30 PM">04:30 PM - Late Afternoon</option>
                      </select>
                    </div>
                  </div>

                  {/* Consultation Reason */}
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Symptoms / Consultation Reason</label>
                    <textarea
                      rows={3}
                      className="input-field"
                      style={{ paddingLeft: '14px', resize: 'vertical' }}
                      placeholder="Briefly describe the reason for your visit (e.g. routine checkup, persistent chest cough, fever)..."
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      className="auth-submit-btn"
                      style={{ maxWidth: '240px' }}
                      disabled={loading || !selectedDoctorId}
                    >
                      {loading ? 'Submitting...' : 'Confirm & Book Slot'}
                    </button>
                    <button
                      type="button"
                      className="action-btn-sm"
                      onClick={() => setActiveTab('appointments')}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Read-Only Modal when Patient views Doctor profile */}
      {viewingUser && <ProfileModal user={viewingUser} onClose={() => setViewingUser(null)} />}
    </>
  );
}
