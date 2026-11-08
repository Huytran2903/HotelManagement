import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { StaffLayout } from './layouts/StaffLayout';

// Public & Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { RoomDetailPage } from './pages/customer/RoomDetailPage';
import { CreateBookingPage } from './pages/customer/CreateBookingPage';
import { BookingHistoryPage } from './pages/customer/BookingHistoryPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { CustomerManagementPage } from './pages/staff/CustomerManagementPage';
import { RoomManagementPage } from './pages/staff/RoomManagementPage';
import { BookingManagementPage } from './pages/staff/BookingManagementPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Protected Routes */}
            <Route
              path="/book"
              element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <CreateBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <BookingHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Staff Protected Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredRole="STAFF">
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboardPage />} />
              <Route path="customers" element={<CustomerManagementPage />} />
              <Route path="rooms" element={<RoomManagementPage />} />
              <Route path="bookings" element={<BookingManagementPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

