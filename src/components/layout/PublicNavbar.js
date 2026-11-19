import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { MedicalCrossIcon } from '../auth/AuthLayout';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/PublicNavbar.css';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="landing-nav">
      <Link to="/" className="landing-brand">
        <div className="brand-icon-box">
          <MedicalCrossIcon />
        </div>
        <span className="brand-name">MedBuddy</span>
      </Link>

      {/* Desktop Navigation Links */}
      <ul className="landing-nav-links desktop-only">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/services"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Services
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/find-doctors"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Find Doctors
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/locations"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Locations
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            About
          </NavLink>
        </li>
      </ul>

      {/* Desktop Auth Buttons */}
      <div className="landing-auth-actions desktop-only">
        <Link to="/login" className="nav-login-btn">
          Sign In
        </Link>
        <button
          onClick={() => navigate('/register')}
          className="nav-register-btn"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          Get Started
        </button>
      </div>

      {/* Hamburger Toggle Button (Mobile/Tablet) */}
      <button
        type="button"
        className="mobile-hamburger-btn"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Dropdown Menu (compact, fits content, ends where options finish) */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <MedicalCrossIcon />
            </div>
            <span className="brand-name" style={{ fontSize: '1.15rem' }}>Menu</span>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <ul className="mobile-nav-links">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/services"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/find-doctors"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              Find Doctors
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/locations"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              Locations
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              About
            </NavLink>
          </li>
        </ul>

        {/* Separator line & Auth actions directly below nav links */}
        <div className="mobile-auth-separator" />

        <div className="mobile-auth-actions">
          <Link to="/login" className="mobile-login-btn">
            Sign In
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/register');
            }}
            className="mobile-register-btn"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
