import React from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import '../styles/LocationsPage.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

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
    image: lahoreImg
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    image: islamabadImg
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    image: rawalpindiImg
  },
  {
    id: 'faisalabad',
    name: 'Faisalabad',
    image: faisalabadImg
  },
  {
    id: 'multan',
    name: 'Multan',
    image: multanImg
  },
  {
    id: 'peshawar',
    name: 'Peshawar',
    image: peshawarImg
  },
  {
    id: 'quetta',
    name: 'Quetta',
    image: quettaImg
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
            MedBuddy connects patients with licensed physicians, specialized clinics, and top hospital networks across major metropolitan areas in Pakistan.
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

      {/* Main Cities Cards Grid (Images and City Names Only) */}
      <main className="locations-content">
        <div className="locations-section-intro">
          <h2>Active Medical Coverage Hubs</h2>
          <p>
            Explore our operating metropolitan centers across Pakistan.
          </p>
        </div>

        <div className="cities-grid">
          {availableCitiesData.map((city) => (
            <div className="city-card city-card-simple" key={city.id}>
              {/* City Photo Box */}
              <div className="city-image-container">
                <img
                  src={city.image}
                  alt={city.name}
                  className="city-image"
                  loading="lazy"
                />
              </div>

              {/* City Name Header Only */}
              <div className="city-card-simple-body">
                <h3 className="city-name">{city.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
