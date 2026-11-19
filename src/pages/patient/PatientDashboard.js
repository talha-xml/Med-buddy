import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ProfileModal from '../../components/layout/ProfileModal';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';
import '../../styles/DangerZone.css';
import {
  fetchAppointments,
  fetchDoctors,
  createAppointment,
  updateAppointmentStatus,
  getUserProfile
} from '../../services/apiService';
import { standardSpecialties, standardCities } from '../../services/clinicalData';
import { getDoctorStatus } from '../../services/verificationService';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaPhoneAlt,
  FaUserMd,
  FaStethoscope,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import SearchableCombobox from '../../components/common/SearchableCombobox';
import { addNotification } from '../../services/notificationService';

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'appointments');
  const [highlightAptId, setHighlightAptId] = useState(
    location.state?.highlightAppointmentId || null
  );
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

  // Styled Cancellation Confirmation Modal state
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // All registered doctors pool across system (for real-time booking filtering)
  const [allDoctorsPool, setAllDoctorsPool] = useState([]);

  // Booking Form State: Default to empty fields as requested
  const [bookingCity, setBookingCity] = useState('');
  const [bookingSpecialty, setBookingSpecialty] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingHour, setBookingHour] = useState('09');
  const [bookingPeriod, setBookingPeriod] = useState('AM');
  const [bookingReason, setBookingReason] = useState('');

  // Helper functions for flexible 12-hour
  const getPeriodOfDay = (hourStr, period) => {
    const h = parseInt(hourStr, 10);
    let h24 = h % 12;
    if (period === 'PM') h24 += 12;

    if (h24 >= 0 && h24 < 5) return 'Midnight / Late Night';
    if (h24 >= 5 && h24 < 12) return 'Morning';
    if (h24 >= 12 && h24 < 17) return 'Afternoon';
    if (h24 >= 17 && h24 < 21) return 'Evening';
    return 'Night';
  };

  const calculateEndTime = (hourStr, period) => {
    const h = parseInt(hourStr, 10);
    let h24 = h % 12;
    if (period === 'PM') h24 += 12;

    // Add 1 hour session
    const endH24 = (h24 + 1) % 24;
    const endPeriod = endH24 >= 12 ? 'PM' : 'AM';
    let endH12 = endH24 % 12;
    if (endH12 === 0) endH12 = 12;

    const formattedEndH = String(endH12).padStart(2, '0');
    return `${formattedEndH}:00 ${endPeriod}`;
  };

  const getFullTimeSlotString = (hourStr, period) => {
    const formattedH = String(parseInt(hourStr, 10) || 12).padStart(2, '0');
    const startStr = `${formattedH}:00 ${period}`;
    const endStr = calculateEndTime(hourStr, period);
    const partOfDay = getPeriodOfDay(hourStr, period);
    return `${startStr} - ${endStr} (${partOfDay})`;
  };

  // Sync state whenever currentUser updates or re-loads
  useEffect(() => {
    if (currentUser) {
      if (currentUser.city) {
        setSelectedCity(currentUser.city);
      }
    }
  }, [currentUser]);

  // Sync if navigated from notification with state
  useEffect(() => {
    if (location.state?.highlightAppointmentId) {
      setHighlightAptId(location.state.highlightAppointmentId);
      setActiveTab('appointments');
      setTimeout(() => {
        const el = document.getElementById(location.state.highlightAppointmentId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }, [location.state]);

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
      // Filter out any disabled doctors so patients cannot view or book appointments with them
      const activeDocList = docList.filter(
        (d) => d.isEnabled !== 0 && getDoctorStatus(d.id).isEnabled !== false
      );
      const activeAllDocs = allDocs.filter(
        (d) => d.isEnabled !== 0 && getDoctorStatus(d.id).isEnabled !== false
      );

      setAppointments(apts);
      setDoctors(activeDocList);
      setAllDoctorsPool(activeAllDocs);

      const dbSpecs = activeAllDocs.map((d) => d.specialty).filter(Boolean);
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
    const computedTimeSlot = getFullTimeSlotString(bookingHour, bookingPeriod);

    if (!selectedDoctorId || !bookingDate || !bookingReason) {
      setErrorMsg('Please fill out all booking fields.');
      return;
    }

    const doctor =
      allDoctorsPool.find((d) => d.id === selectedDoctorId) ||
      doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor) {
      setErrorMsg('Selected doctor is not found. Please choose a doctor from the list.');
      return;
    }

    // Validation: Check if time slot falls within doctor's consultation hours
    if (doctor.availableFrom && doctor.availableTo) {
      const parseTimeToMinutes = (tStr) => {
        if (!tStr) return null;
        const [timePart, period] = tStr.trim().split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
      };

      const startMinutes = parseTimeToMinutes(`${bookingHour}:00 ${bookingPeriod}`);
      const docFromMin = parseTimeToMinutes(doctor.availableFrom);
      const docToMin = parseTimeToMinutes(doctor.availableTo);

      if (startMinutes !== null && docFromMin !== null && docToMin !== null) {
        if (startMinutes < docFromMin || startMinutes >= docToMin) {
          setErrorMsg(
            `Dr. ${doctor.fullName} is only available between ${doctor.availableFrom} and ${doctor.availableTo}. Please select a time slot within their available hours.`
          );
          return;
        }
      }
    }

    // Validation: Check if slot is already taken by an active appointment
    const isSlotAlreadyTaken = appointments.some(
      (apt) =>
        apt.doctorId === doctor.id &&
        apt.date === bookingDate &&
        apt.time === computedTimeSlot &&
        (apt.status === 'Pending' || apt.status === 'Confirmed')
    );

    if (isSlotAlreadyTaken) {
      setErrorMsg(
        `This time slot (${computedTimeSlot}) is already booked for Dr. ${doctor.fullName} on ${bookingDate}. Please choose another time slot or date.`
      );
      return;
    }

    setLoading(true);
    try {
      const createdApt = await createAppointment({
        patientId: currentUser.id,
        patientName: currentUser.fullName,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        specialty: doctor.specialty || 'General Care',
        date: bookingDate,
        time: computedTimeSlot,
        reason: bookingReason
      });

      // Send local notification backup to the respective doctor
      addNotification({
        userId: doctor.id,
        title: 'New Appointment Request',
        message: `You have a new appointment request by ${currentUser.fullName} at ${computedTimeSlot}. Please confirm the request`,
        appointmentId: createdApt?.id || `apt-${Date.now()}`,
        type: 'appointment_request'
      });

      setSuccessMsg(
        'Appointment request submitted! Status is Pending until reviewed and approved by the doctor.'
      );
      setBookingReason('');
      setBookingDate('');
      await loadData();
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('appointments');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Could not submit appointment booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    setCancelLoading(true);
    try {
      await updateAppointmentStatus(cancellingAppointment.id, 'Cancelled');
      setSuccessMsg('Appointment cancelled successfully.');
      setCancellingAppointment(null);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error cancelling appointment.');
    } finally {
      setCancelLoading(false);
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

          {activeTab !== 'book' && successMsg && <div className="success-banner">{successMsg}</div>}
          {activeTab !== 'book' && errorMsg && <div className="auth-error-alert">{errorMsg}</div>}

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
                        onClick={() => setActiveTab('doctors')}
                      >
                        Find Doctors
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
                  {filteredAppointments.map((apt) => {
                    const isHighlighted = highlightAptId === apt.id;
                    return (
                      <div
                        id={apt.id}
                        className={`appointment-item ${isHighlighted ? 'highlighted-item' : ''}`}
                        key={apt.id}
                        style={
                          isHighlighted
                            ? {
                                border: '2px solid #0284c7',
                                backgroundColor: '#f0f9ff',
                                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.15)'
                              }
                            : {}
                        }
                      >
                        <div className="apt-left">
                          <div className="apt-calendar-badge">
                            <div className="date-day">
                              {apt.date.split('-')[2] || (
                                <FaCalendarAlt style={{ fontSize: '1rem', marginTop: '4px' }} />
                              )}
                            </div>
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
                              onClick={() => setCancellingAppointment(apt)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                            <li
                              style={{
                                color: '#0d9488',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <FaClock style={{ color: '#0d9488', flexShrink: 0 }} />
                              <span>
                                Hours:{' '}
                                {doc.availableFrom && doc.availableTo
                                  ? `${doc.availableFrom} - ${doc.availableTo}`
                                  : '09:00 AM - 05:00 PM'}
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
          {activeTab === 'book' &&
            (() => {
              // Real-time dynamic doctor filtering based on Location, Specialty, and Doctor search inputs
              const matchingDoctors = allDoctorsPool.filter((doc) => {
                if (bookingCity && bookingCity !== 'ALL') {
                  if ((doc.city || '').toLowerCase().trim() !== bookingCity.toLowerCase().trim()) {
                    return false;
                  }
                }
                if (bookingSpecialty && bookingSpecialty !== 'ALL') {
                  if (
                    (doc.specialty || '').toLowerCase().trim() !==
                    bookingSpecialty.toLowerCase().trim()
                  ) {
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
                {
                  value: 'ALL',
                  label: 'All Locations (Nationwide)',
                  subLabel: 'Show doctors across all cities'
                },
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
                subLabel: `${doc.specialty || 'General Care'} • ${
                  doc.city || 'City N/A'
                } • Hours: ${
                  doc.availableFrom && doc.availableTo
                    ? `${doc.availableFrom} - ${doc.availableTo}`
                    : '09:00 AM - 05:00 PM'
                }`
              }));

              // Currently selected doctor object
              const currentSelectedDoctor = allDoctorsPool.find((d) => d.id === selectedDoctorId);

              return (
                <div className="booking-form-box">
                  <div className="card-section-header">
                    <div>
                      <h3 className="card-section-title">Reserve a Medical Consultation Slot</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                        Filter by Location and Medical Specialty to view matching licensed
                        physicians in real time.
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
                        {matchingDoctors.length}{' '}
                        {matchingDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleBookSubmit}>
                    {/* Row 1: Separate Location, Specialty, and Doctor Name with Search + Dropdown */}
                    <div
                      className="booking-grid"
                      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                    >
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
                                  (!newCity ||
                                    newCity === 'ALL' ||
                                    (d.city || '').toLowerCase() === newCity.toLowerCase())
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
                                  (!newSpec ||
                                    newSpec === 'ALL' ||
                                    (d.specialty || '').toLowerCase() === newSpec.toLowerCase())
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
                              <span
                                className="directory-spec-badge"
                                style={{ fontSize: '0.78rem' }}
                              >
                                {currentSelectedDoctor.specialty || 'General Care'}
                              </span>
                            </div>
                            <p
                              style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#475569' }}
                            >
                              <FaMapMarkerAlt style={{ color: '#0284c7', marginRight: '4px' }} />
                              {currentSelectedDoctor.city || 'City N/A'},{' '}
                              {currentSelectedDoctor.country || 'Pakistan'}
                              {currentSelectedDoctor.experienceDomain
                                ? ` • ${currentSelectedDoctor.experienceDomain}`
                                : ''}
                            </p>
                            <p
                              style={{
                                margin: '4px 0 0 0',
                                fontSize: '0.84rem',
                                color: '#0d9488',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <FaClock style={{ color: '#0d9488', flexShrink: 0 }} />
                              <span>
                                Daily Consultation Hours:{' '}
                                {currentSelectedDoctor.availableFrom &&
                                currentSelectedDoctor.availableTo
                                  ? `${currentSelectedDoctor.availableFrom} - ${currentSelectedDoctor.availableTo}`
                                  : '09:00 AM - 05:00 PM'}
                              </span>
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

                    {/* Row 2: Date & Flexible Time Slot with 1-Hour Auto Duration & Day Part Indicator */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        alignItems: 'flex-start',
                        marginTop: '20px'
                      }}
                    >
                      {/* Preferred Date with reduced, neat width */}
                      <div className="form-group" style={{ width: '220px', flexShrink: 0 }}>
                        <label>Preferred Date</label>
                        <input
                          type="date"
                          className="input-field"
                          style={{ paddingLeft: '14px', width: '100%' }}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      {/* Appointment Start Time (Hour + AM/PM dropdowns) */}
                      <div className="form-group" style={{ width: '260px', flexShrink: 0 }}>
                        <label>Appointment Start Time</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {/* Hour Dropdown (1 to 12) */}
                          <div style={{ flex: 1 }}>
                            <select
                              className="input-field"
                              style={{ paddingLeft: '12px' }}
                              value={bookingHour}
                              onChange={(e) => setBookingHour(e.target.value)}
                              required
                            >
                              {Array.from({ length: 12 }, (_, i) => {
                                const val = String(i + 1).padStart(2, '0');
                                return (
                                  <option key={val} value={val}>
                                    {val}:00
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* AM/PM Dropdown */}
                          <div style={{ width: '90px' }}>
                            <select
                              className="input-field"
                              style={{
                                paddingLeft: '12px',
                                fontWeight: 600,
                                color: 'var(--primary)'
                              }}
                              value={bookingPeriod}
                              onChange={(e) => setBookingPeriod(e.target.value)}
                              required
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Session Duration & Day-Part Indicator Badge */}
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        backgroundColor: '#f0fdfa',
                        border: '1.5px solid #ccfbf1',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.9rem',
                          color: '#0f766e'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Scheduled Slot:</span>
                        <strong style={{ color: '#0d9488' }}>
                          {bookingHour}:00 {bookingPeriod} →{' '}
                          {calculateEndTime(bookingHour, bookingPeriod)}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            color: '#0284c7',
                            background: '#e0f2fe',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600
                          }}
                        >
                          1-Hour Consultation
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Detected Period:
                        </span>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor:
                              getPeriodOfDay(bookingHour, bookingPeriod) === 'Morning'
                                ? '#fef3c7'
                                : getPeriodOfDay(bookingHour, bookingPeriod) === 'Afternoon'
                                ? '#ffedd5'
                                : getPeriodOfDay(bookingHour, bookingPeriod) === 'Evening'
                                ? '#e0e7ff'
                                : '#f1f5f9',
                            color:
                              getPeriodOfDay(bookingHour, bookingPeriod) === 'Morning'
                                ? '#b45309'
                                : getPeriodOfDay(bookingHour, bookingPeriod) === 'Afternoon'
                                ? '#c2410c'
                                : getPeriodOfDay(bookingHour, bookingPeriod) === 'Evening'
                                ? '#4338ca'
                                : '#334155'
                          }}
                        >
                          {getPeriodOfDay(bookingHour, bookingPeriod)}
                        </span>
                      </div>
                    </div>

                    {/* Real-time Conflict or Availability Warning Alert Banner */}
                    {(() => {
                      if (!currentSelectedDoctor) return null;
                      const computedSlot = getFullTimeSlotString(bookingHour, bookingPeriod);

                      // Check if slot already taken
                      const conflictApt = appointments.find(
                        (apt) =>
                          apt.doctorId === currentSelectedDoctor.id &&
                          apt.date === bookingDate &&
                          apt.time === computedSlot &&
                          (apt.status === 'Pending' || apt.status === 'Confirmed')
                      );

                      if (conflictApt) {
                        return (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '10px 14px',
                              background: '#fef2f2',
                              border: '1.5px solid #fecaca',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: '#b91c1c',
                              fontSize: '0.88rem',
                              fontWeight: 600
                            }}
                          >
                            <FaExclamationTriangle
                              style={{ flexShrink: 0, fontSize: '1rem', color: '#dc2626' }}
                            />
                            <span>
                              <strong>Slot Already Filled:</strong> Dr.{' '}
                              {currentSelectedDoctor.fullName} is already booked for this exact slot
                              ({computedSlot}) on {bookingDate}. Please pick another hour or date.
                            </span>
                          </div>
                        );
                      }

                      // Check if outside doctor available consultation hours
                      if (
                        currentSelectedDoctor.availableFrom &&
                        currentSelectedDoctor.availableTo
                      ) {
                        const parseTimeToMinutes = (tStr) => {
                          if (!tStr) return null;
                          const [timePart, period] = tStr.trim().split(' ');
                          let [h, m] = timePart.split(':').map(Number);
                          if (period === 'PM' && h !== 12) h += 12;
                          if (period === 'AM' && h === 12) h = 0;
                          return h * 60 + (m || 0);
                        };

                        const startMin = parseTimeToMinutes(`${bookingHour}:00 ${bookingPeriod}`);
                        const fromMin = parseTimeToMinutes(currentSelectedDoctor.availableFrom);
                        const toMin = parseTimeToMinutes(currentSelectedDoctor.availableTo);

                        if (startMin !== null && fromMin !== null && toMin !== null) {
                          if (startMin < fromMin || startMin >= toMin) {
                            return (
                              <div
                                style={{
                                  marginTop: '12px',
                                  padding: '10px 14px',
                                  background: '#fffbeb',
                                  border: '1.5px solid #fde68a',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  color: '#92400e',
                                  fontSize: '0.88rem',
                                  fontWeight: 600
                                }}
                              >
                                <FaExclamationTriangle
                                  style={{ flexShrink: 0, fontSize: '1rem', color: '#d97706' }}
                                />
                                <span>
                                  <strong>Outside Consultation Hours:</strong> Dr.{' '}
                                  {currentSelectedDoctor.fullName} is available between{' '}
                                  {currentSelectedDoctor.availableFrom} and{' '}
                                  {currentSelectedDoctor.availableTo}. Please select a time slot
                                  within their clinic schedule.
                                </span>
                              </div>
                            );
                          }
                        }
                      }

                      return null;
                    })()}

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

                    {/* In-Form Booking Error or Success Alert (Right above action buttons for optimal UX) */}
                    {errorMsg && (
                      <div
                        className="auth-error-alert"
                        style={{
                          marginTop: '16px',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <FaExclamationTriangle style={{ flexShrink: 0, fontSize: '1rem' }} />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    {successMsg && (
                      <div
                        className="success-banner"
                        style={{ marginTop: '16px', marginBottom: '4px' }}
                      >
                        {successMsg}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
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

      {/* Styled Cancel Appointment Confirmation Modal */}
      {cancellingAppointment && (
        <div
          className="cancel-modal-overlay"
          onClick={() => !cancelLoading && setCancellingAppointment(null)}
        >
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <div className="cancel-modal-icon-badge">
                <FaExclamationTriangle />
              </div>
              <div className="cancel-modal-title-group">
                <h3>Cancel Consultation</h3>
                <p>Are you sure you want to cancel this booking?</p>
              </div>
            </div>

            <div className="cancel-modal-body">
              <div className="cancel-appointment-summary">
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Doctor</span>
                  <span className="cancel-summary-value">{cancellingAppointment.doctorName}</span>
                </div>
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Specialty</span>
                  <span className="cancel-summary-value">{cancellingAppointment.specialty}</span>
                </div>
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Date</span>
                  <span className="cancel-summary-value">{cancellingAppointment.date}</span>
                </div>
                <div className="cancel-summary-row">
                  <span className="cancel-summary-label">Scheduled Slot</span>
                  <span className="cancel-summary-value">{cancellingAppointment.time}</span>
                </div>
              </div>

              <p className="cancel-modal-warning-text">
                Cancelling this appointment will release your consultation slot and notify the
                practitioner's office. You can book another slot anytime.
              </p>
            </div>

            <div className="cancel-modal-actions">
              <button
                type="button"
                className="cancel-dismiss-btn"
                onClick={() => setCancellingAppointment(null)}
                disabled={cancelLoading}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="cancel-confirm-btn"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
