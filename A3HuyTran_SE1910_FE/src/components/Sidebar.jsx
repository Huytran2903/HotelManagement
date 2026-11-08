import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
  return (
    <aside className="staff-sidebar">
      <div className="sidebar-title">Staff Administration</div>
      <NavLink
        to="/staff"
        end
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/staff/customers"
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        Customer Management
      </NavLink>
      <NavLink
        to="/staff/rooms"
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        Room Management
      </NavLink>
      <NavLink
        to="/staff/bookings"
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        Booking Management
      </NavLink>
    </aside>
  );
};

