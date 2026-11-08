import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Booking History</h1>
          <p className="page-subtitle">View and review all your personal hotel room reservations</p>
        </div>
        <Link to="/book" className="btn btn-primary">
          Book Another Room
        </Link>
      </div>

      <AlertMessage message={error} onClose={() => setError('')} />

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Booking Date</th>
              <th>Rooms & Schedule</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                  Loading booking history...
                </td>
              </tr>
            ) : bookings.length > 0 ? (
              bookings.map((b) => (
                <tr key={b.bookingReservationId}>
                  <td><strong>#{b.bookingReservationId}</strong></td>
                  <td>{b.bookingDate}</td>
                  <td>
                    {b.bookingDetails?.map((d) => (
                      <div key={d.roomId} style={{ fontSize: '13px', marginBottom: '2px' }}>
                        Room {d.roomNumber} ({d.roomTypeName}) - {d.startDate} to {d.endDate} ({d.numberOfDays} nights)
                      </div>
                    ))}
                  </td>
                  <td><strong>${Number(b.totalPrice).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${b.bookingStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                      {b.bookingStatus === 1 ? 'Confirmed' : 'Cancelled'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  You have not placed any bookings yet. <Link to="/book">Book your first room now</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reservation Receipt #{selectedBooking.bookingReservationId}</h3>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>X</button>
            </div>

            <div style={{ lineHeight: 1.8, fontSize: '14px', marginBottom: '16px' }}>
              <div><strong>Booking ID:</strong> #{selectedBooking.bookingReservationId}</div>
              <div><strong>Booking Date:</strong> {selectedBooking.bookingDate}</div>
              <div><strong>Guest Name:</strong> {selectedBooking.customerFullName}</div>
              <div><strong>Guest Email:</strong> {selectedBooking.customerEmail}</div>
              <div>
                <strong>Reservation Status:</strong>{' '}
                <span className={`badge ${selectedBooking.bookingStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                  {selectedBooking.bookingStatus === 1 ? 'Confirmed' : 'Cancelled'}
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Room Breakdown</h4>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Rate / Day</th>
                    <th>Period</th>
                    <th>Days</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBooking.bookingDetails?.map((d) => (
                    <tr key={d.roomId}>
                      <td>Room {d.roomNumber}</td>
                      <td>{d.roomTypeName}</td>
                      <td>${Number(d.roomPricePerDay).toFixed(2)}</td>
                      <td>{d.startDate} ~ {d.endDate}</td>
                      <td>{d.numberOfDays}</td>
                      <td><strong>${Number(d.actualPrice).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '16px' }}>
              Total Paid: <strong style={{ color: 'var(--primary-color)', fontSize: '20px' }}>${Number(selectedBooking.totalPrice).toFixed(2)}</strong>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

