import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { MedicalCrossIcon } from '../auth/AuthLayout';
import './PublicNavbar.css';

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="landing-nav">
      <Link to="/" className="landing-brand">
        <div className="brand-icon-box">
          <MedicalCrossIcon />
        </div>
        <span className="brand-name">MedBuddy</span>
      </Link>

      <ul className="landing-nav-links">
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

      <div className="landing-auth-actions">
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
    </nav>
  );
}
