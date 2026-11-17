import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import './LocationsPage.css';
import {
  FaMapMarkerAlt,
  FaHospital,
  FaUserMd,
  FaArrowRight,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa';

// Images of cities
import lahoreImg from '../assets/locations/lahore.jpg';
import islamabadImg from '../assets/locations/islamabad.jpg';
import rawalpindiImg from '../assets/locations/rawalpindi.jpg';
import faisalabadImg from '../assets/locations/faisalabad.jpg';
import multanImg from '../assets/locations/multan.jpg';
import peshawarImg from '../assets/locations/peshawar.jpg';
import quettaImg from '../assets/locations/quetta.jpg';

const availableCitiesData = [
  {
    id: 'lahore',
    name: 'Lahore',
    landmark: 'Minar-e-Pakistan & Greater Iqbal Park',
    province: 'Punjab',
    status: 'Active Coverage',
    image: lahoreImg,
    description:
      'As Pakistan’s cultural and healthcare hub, MedBuddy connects patients across Lahore with top clinical specialists, teaching hospitals, and polyclinics in Gulberg, DHA, Johar Town, and Model Town.',
    hospitals: 'King Edward / Mayo, Services Hospital, Doctors Hospital, Shaukat Khanum',
    coverage: '24/7 Booking & Specialist Consultation',
    availableSpecialties: '21 Standard Specialties'
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    landmark: 'Faisal Mosque & Margalla Foothills',
    province: 'Federal Capital',
    status: 'Active Coverage',
    image: islamabadImg,
    description:
      'Serving the federal capital with state-of-the-art diagnostic and clinical appointment bookings. Find certified consultants and specialists across Blue Area, F-8, G-8, and DHA Islamabad.',
    hospitals: 'PIMS Hospital, Shifa International, Maroof International, Kulsum International',
    coverage: 'Routine, Preventive & Specialized Appointments',
    availableSpecialties: 'All Medical Specialties'
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    landmark: 'Heritage Architecture & Markazi Mosque',
    province: 'Punjab',
    status: 'Active Coverage',
    image: rawalpindiImg,
    description:
      'Access experienced physicians and surgeons throughout the historic twin city. Easily schedule in-person clinical consultations in Saddar, Bahria Town, Westridge, and Satellite Town.',
    hospitals: 'Benazir Bhutto Hospital, Holy Family Hospital, Rawalpindi General, CMH',
    coverage: 'Prompt In-Person Slot Allocation',
    availableSpecialties: 'General Care, Cardiology, Pediatrics'
  },
  {
    id: 'faisalabad',
    name: 'Faisalabad',
    landmark: 'Faisalabad Clock Tower (Ghanta Ghar)',
    province: 'Punjab',
    status: 'Active Coverage',
    image: faisalabadImg,
    description:
      'Bringing digitized healthcare scheduling to the industrial heart of Pakistan. Patients across Civil Lines, Madina Town, and D Ground can effortlessly reserve clinical consults without waiting in queues.',
    hospitals: 'Allied Hospital, DHQ Hospital Faisalabad, Faisal Hospital',
    coverage: 'Direct Slot Confirmation & Doctor Discovery',
    availableSpecialties: 'Internal Medicine, Dermatology, Orthopedics'
  },
  {
    id: 'multan',
    name: 'Multan',
    landmark: 'Tomb of Shah Rukn-e-Alam & Fort Kohna',
    province: 'Punjab',
    status: 'Active Coverage',
    image: multanImg,
    description:
      'Serving South Punjab with reliable medical scheduling. Connect with leading clinical practitioners and pediatricians across Bosan Road, Gulgasht Colony, and Cantt areas.',
    hospitals: 'Nishtar Hospital, Multan Medical Complex, Medicare Hospital',
    coverage: 'Primary and Specialty Clinical Care',
    availableSpecialties: 'Cardiology, Pediatrics, General Surgery'
  },
  {
    id: 'peshawar',
    name: 'Peshawar',
    landmark: 'Historic Bala Hissar Fortress',
    province: 'Khyber Pakhtunkhwa',
    status: 'Active Coverage',
    image: peshawarImg,
    description:
      'Connecting residents of Khyber Pakhtunkhwa with premier medical practitioners and diagnostic specialists across Hayatabad, University Town, and Dabgari Gardens medical centers.',
    hospitals: 'Lady Reading Hospital (LRH), Khyber Teaching Hospital, Hayatabad Medical Complex',
    coverage: 'Consultant & Clinical Slots',
    availableSpecialties: 'ENT, Neurology, Pulmonology, Gynecology'
  },
  {
    id: 'quetta',
    name: 'Quetta',
    landmark: 'Hanna Lake & Valley Panorama',
    province: 'Balochistan',
    status: 'Active Coverage',
    image: quettaImg,
    description:
      'Expanding healthcare accessibility across Balochistan. Patients in Quetta can discover verified doctors and schedule appointments with top regional clinics and medical centers.',
    hospitals: 'Civil Hospital Quetta, Bolan Medical Complex, CMH Quetta',
    coverage: 'Verified Practitioner Network',
    availableSpecialties: 'General Medicine, Ophthalmology, Pediatrics'
  }
];

export default function LocationsPage() {
  return (
    <div className="locations-page">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="locations-hero">
        <div className="locations-hero-inner">
          <span className="locations-tag">
            <FaMapMarkerAlt /> Nationwide Healthcare Network
          </span>
          <h1 className="locations-title">Cities Where MedBuddy is Available</h1>
          <p className="locations-subtitle">
            MedBuddy connects patients with licensed physicians, specialized clinics, and top hospital networks across Pakistan. Discover verified doctors in your city and book verified appointment slots in real time.
          </p>

          <div className="locations-stats-bar">
            <div className="stat-item">
              <span className="stat-number">7+</span>
              <span className="stat-label">Major Cities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">21</span>
              <span className="stat-label">Specialties Covered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Verified Practitioners</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Online Slot Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cities Cards Grid */}
      <main className="locations-content">
        <div className="locations-section-intro">
          <h2>Active Medical Coverage Hubs</h2>
          <p>
            Explore our operating metropolitan centers. Select any city to find nearby certified specialists, view clinic locations, and book your consultation slot.
          </p>
        </div>

        <div className="cities-grid">
          {availableCitiesData.map((city) => (
            <div className="city-card" key={city.id}>
              {/* City Photo Box */}
              <div className="city-image-container">
                <img
                  src={city.image}
                  alt={`${city.name} - ${city.landmark}`}
                  className="city-image"
                  loading="lazy"
                />
                <span className="city-province-badge">{city.province}</span>
                <span className="city-status-badge">
                  <span className="status-dot"></span>
                  {city.status}
                </span>
              </div>

              {/* City Info Card Body */}
              <div className="city-card-body">
                <div className="city-title-row">
                  <h3 className="city-name">{city.name}</h3>
                </div>

                <div className="city-landmark">
                  <FaMapMarkerAlt style={{ color: '#0284c7' }} />
                  <span>{city.landmark}</span>
                </div>

                <p className="city-description">{city.description}</p>

                <ul className="city-meta-list">
                  <li className="city-meta-item">
                    <FaHospital style={{ color: '#0d9488', flexShrink: 0 }} />
                    <span>
                      <strong>Partner Networks:</strong> {city.hospitals}
                    </span>
                  </li>
                  <li className="city-meta-item">
                    <FaClock style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span>
                      <strong>Availability:</strong> {city.coverage}
                    </span>
                  </li>
                  <li className="city-meta-item">
                    <FaShieldAlt style={{ color: '#16a34a', flexShrink: 0 }} />
                    <span>
                      <strong>Clinical Disciplines:</strong> {city.availableSpecialties}
                    </span>
                  </li>
                </ul>

                <Link
                  to={`/find-doctors?city=${encodeURIComponent(city.name)}`}
                  className="city-action-btn"
                >
                  <FaUserMd /> Find Doctors in {city.name} <FaArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Expansion Banner */}
        <section className="locations-expansion-banner">
          <div className="expansion-content">
            <h3>Are You a Clinical Practitioner or Hospital?</h3>
            <p>
              MedBuddy is continuously onboarding certified specialists, polyclinics, and diagnostic centers across Pakistan. Join our verified healthcare provider directory today to manage patient appointments smoothly.
            </p>
          </div>
          <Link to="/register/doctor" className="expansion-btn">
            Register as Doctor in Your City
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
