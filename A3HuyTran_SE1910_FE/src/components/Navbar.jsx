import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isStaff, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        FU MINI HOTEL SYSTEM
      </Link>

      <ul className="navbar-nav">
        <li>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Rooms
          </NavLink>
        </li>

        {isCustomer && (
          <>
            <li>
              <NavLink to="/book" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Book Room
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Booking History
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Profile
              </NavLink>
            </li>
          </>
        )}

        {isStaff && (
          <li>
            <NavLink to="/staff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Staff Dashboard
            </NavLink>
          </li>
        )}

        {isAuthenticated ? (
          <li className="nav-user">
            <span>{user?.fullName || user?.email}</span>
            <span className="user-badge">{user?.role}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </li>
        ) : (
          <li className="nav-user">
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary btn-sm">
              Register
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

