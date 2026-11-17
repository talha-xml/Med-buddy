import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import ProfileModal from '../components/layout/ProfileModal';
import { fetchDoctors } from '../services/apiService';
import { standardSpecialties } from '../services/clinicalData';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaFilter,
  FaUserMd
} from 'react-icons/fa';
import './FindDoctorsPage.css';

export default function FindDoctorsPage() {
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || 'ALL';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);

  // Sync if URL query param changes
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setSelectedCity(cityParam);
    }
  }, [searchParams]);

  const loadDoctors = useCallback(async (customSearch) => {
    setLoading(true);
    try {
      const searchToUse = customSearch !== undefined ? customSearch : searchQuery;
      const [docs, all] = await Promise.all([
        fetchDoctors({
          city: selectedCity === 'ALL' ? undefined : selectedCity,
          specialty: selectedSpecialty === 'ALL' ? undefined : selectedSpecialty,
          search: searchToUse
        }),
        fetchDoctors()
      ]);
      setDoctors(docs);
      const dbSpecs = all.map((d) => d.specialty).filter(Boolean);
      const combinedSpecialties = Array.from(new Set([...standardSpecialties, ...dbSpecs])).sort();
      setAllSpecialties(combinedSpecialties);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedSpecialty, searchQuery]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDoctors(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('ALL');
    setSelectedSpecialty('ALL');
    loadDoctors('');
  };

  return (
    <div className="find-doctors-page">
      <PublicNavbar />

      {/* Header Banner */}
      <section className="find-doctors-hero">
        <span className="section-tag">Clinical Directory</span>
        <h1 className="find-doctors-title">Find Trusted Doctors & Specialists</h1>
        <p className="find-doctors-subtitle">
          Browse licensed physicians by location, medical discipline, or keyword. Review credentials and book appointment slots in real-time.
        </p>

        {/* Search & Filter Bar */}
        <div className="public-doctor-search-card">
          <form onSubmit={handleSearchSubmit} className="public-search-form">
            <div className="public-search-input-box">
              <FaSearch className="public-search-icon" />
              <input
                type="text"
                className="input-field"
                placeholder="Search physician name, condition, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="public-filter-box">
              <FaMapMarkerAlt style={{ color: '#0284c7' }} />
              <select
                className="input-field"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="ALL">All Cities</option>
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

            <div className="public-filter-box">
              <FaFilter style={{ color: '#0d9488' }} />
              <select
                className="input-field"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="ALL">All Specialties</option>
                {allSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="public-search-btn">
              Search
            </button>

            <button type="button" className="public-reset-btn" onClick={handleReset}>
              Reset
            </button>
          </form>
        </div>
      </section>

      {/* Doctors Grid Section */}
      <section className="find-doctors-body">
        <div className="find-doctors-meta-row">
          <h3>
            Available Practitioners{' '}
            <span style={{ color: '#0284c7' }}>({doctors.length})</span>
          </h3>
          <span className="filter-pill-summary">
            City: <strong>{selectedCity === 'ALL' ? 'All Locations' : selectedCity}</strong> | Specialty:{' '}
            <strong>{selectedSpecialty === 'ALL' ? 'All Disciplines' : selectedSpecialty}</strong>
          </span>
        </div>

        {loading ? (
          <div className="doctors-loading-state">
            <FaUserMd className="loading-spin-icon" />
            <p>Loading practitioners from clinical database...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="doctors-empty-state">
            <h4>No physicians found matching your search.</h4>
            <p>
              Try changing the location filter or searching with general terms like <strong>Cardiology</strong> or <strong>General</strong>.
            </p>
            <button className="auth-submit-btn" style={{ maxWidth: '180px', marginTop: '16px' }} onClick={handleReset}>
              View All Doctors
            </button>
          </div>
        ) : (
          <div className="public-doctors-grid">
            {doctors.map((doc) => (
              <div className="public-doc-card" key={doc.id}>
                <div>
                  <div className="public-doc-top">
                    <div className="public-doc-avatar">
                      {doc.fullName.charAt(0) || 'D'}
                    </div>
                    <div className="public-doc-info">
                      <h4>{doc.fullName}</h4>
                      <span className="public-spec-tag">{doc.specialty || 'General Practitioner'}</span>
                      <div className="public-exp-badge">
                        <FaStar style={{ color: '#eab308', marginRight: '4px' }} />
                        {doc.yearsOfExperience ? `${doc.yearsOfExperience} Years Clinical Exp` : 'Licensed Physician'}
                      </div>
                    </div>
                  </div>

                  {doc.experienceDomain && (
                    <div className="public-domain-snippet">
                      <strong>Clinical Expertise: </strong>
                      {doc.experienceDomain}
                    </div>
                  )}

                  <ul className="public-doc-meta">
                    <li>
                      <FaMapMarkerAlt style={{ color: '#0284c7' }} />
                      <span>
                        <strong>{doc.city || 'Lahore'}</strong>, {doc.country || 'Pakistan'}
                        {doc.clinicAddress ? ` • ${doc.clinicAddress}` : ''}
                      </span>
                    </li>
                    <li>
                      <FaPhoneAlt style={{ color: '#94a3b8' }} />
                      <span>{doc.phone || 'Clinic line available upon booking'}</span>
                    </li>
                  </ul>
                </div>

                <div className="public-doc-actions">
                  <Link to="/login/patient" className="doc-primary-book-btn">
                    Book Slot
                  </Link>
                  <button
                    className="doc-secondary-view-btn"
                    onClick={() => setViewingUser(doc)}
                  >
                    View Credentials
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Read-Only Modal */}
      {viewingUser && (
        <ProfileModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      {/* Modern Clinical Footer */}
      <PublicFooter />
    </div>
  );
}
