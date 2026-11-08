import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const StaffLayout = () => {
  return (
    <div className="staff-layout">
      <Sidebar />
      <main className="staff-body">
        <Outlet />
      </main>
    </div>
  );
};

