import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';

export const StaffDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading dashboard data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Dashboard</h1>
          <p className="page-subtitle">Overview of hotel operations, bookings, and metrics</p>
        </div>
        <div className="btn-group">
          <Link to="/staff/bookings" className="btn btn-primary btn-sm">Manage Bookings</Link>
          <Link to="/staff/rooms" className="btn btn-secondary btn-sm">Manage Rooms</Link>
        </div>
      </div>

      <AlertMessage message={error} onClose={() => setError('')} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats?.totalCustomers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Rooms</div>
          <div className="stat-value">{stats?.totalRooms || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Rooms</div>
          <div className="stat-value">{stats?.activeRooms || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{stats?.totalBookings || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${Number(stats?.totalRevenue || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Recent Booking Reservations</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Booking Date</th>
                <th>Customer</th>
                <th>Rooms Booked</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b) => (
                  <tr key={b.bookingReservationId}>
                    <td>#{b.bookingReservationId}</td>
                    <td>{b.bookingDate}</td>
                    <td>
                      <div><strong>{b.customerFullName}</strong></div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.customerEmail}</div>
                    </td>
                    <td>
                      {b.bookingDetails?.map((d) => (
                        <div key={d.roomId} style={{ fontSize: '12px' }}>
                          Room {d.roomNumber} ({d.startDate} to {d.endDate})
                        </div>
                      ))}
                    </td>
                    <td><strong>${Number(b.totalPrice).toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge ${b.bookingStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                        {b.bookingStatus === 1 ? 'Confirmed' : 'Cancelled'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

