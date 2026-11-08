import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { customerService } from '../../services/customerService';
import { roomService } from '../../services/roomService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';
import { ConfirmModal } from '../../components/ConfirmModal';

export const BookingManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Create form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [bookingItems, setBookingItems] = useState([
    { roomId: '', startDate: '', endDate: '' }
  ]);

  useEffect(() => {
    loadBookings();
    loadCustomersAndRooms();
  }, []);

  const loadCustomersAndRooms = async () => {
    try {
      const [custList, roomList] = await Promise.all([
        customerService.getAllCustomers(),
        roomService.getActiveRooms()
      ]);
      setCustomers(custList);
      setRooms(roomList);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBookings = async (searchKw = keyword, stat = statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (searchKw) params.keyword = searchKw;
      if (stat !== '') params.status = stat;

      const data = await bookingService.getAllBookings(params);
      setBookings(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadBookings(keyword, statusFilter);
  };

  const handleResetFilter = () => {
    setKeyword('');
    setStatusFilter('');
    loadBookings('', '');
  };

  const openDetailModal = (b) => {
    setSelectedBooking(b);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      setSuccess(`Booking #${bookingId} status updated successfully.`);
      loadBookings();
      if (selectedBooking && selectedBooking.bookingReservationId === bookingId) {
        setSelectedBooking({ ...selectedBooking, bookingStatus: newStatus });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setError('');
    setSuccess('');
    try {
      await bookingService.deleteBooking(confirmDeleteId);
      setSuccess(`Booking #${confirmDeleteId} deleted successfully.`);
      setConfirmDeleteId(null);
      loadBookings();
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirmDeleteId(null);
    }
  };

  const openCreateModal = () => {
    setSelectedCustomerId(customers[0]?.customerId || '');
    setBookingItems([{ roomId: rooms[0]?.roomId || '', startDate: '', endDate: '' }]);
    setIsCreateModalOpen(true);
  };

  const handleAddItem = () => {
    setBookingItems([...bookingItems, { roomId: rooms[0]?.roomId || '', startDate: '', endDate: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (bookingItems.length <= 1) return;
    setBookingItems(bookingItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...bookingItems];
    updated[index][field] = value;
    setBookingItems(updated);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        customerId: Number(selectedCustomerId),
        items: bookingItems.map((item) => ({
          roomId: Number(item.roomId),
          startDate: item.startDate,
          endDate: item.endDate
        }))
      };

      await bookingService.createBooking(payload);
      setSuccess('Booking reservation created successfully.');
      setIsCreateModalOpen(false);
      loadBookings();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Management</h1>
          <p className="page-subtitle">Track reservations, view room bookings, and process statuses</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          Create New Reservation
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px' }}>
        <form onSubmit={handleFilter} className="toolbar" style={{ margin: 0 }}>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by customer name or email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            className="form-control"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="1">Confirmed</option>
            <option value="0">Cancelled</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">Filter</button>
          <button type="button" onClick={handleResetFilter} className="btn btn-secondary btn-sm">Reset</button>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Rooms</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading bookings...</td>
              </tr>
            ) : bookings.length > 0 ? (
              bookings.map((b) => (
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
                        Room {d.roomNumber} ({d.startDate} ~ {d.endDate})
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
                    <div className="btn-group">
                      <button onClick={() => openDetailModal(b)} className="btn btn-secondary btn-sm">
                        Details
                      </button>
                      {b.bookingStatus === 1 ? (
                        <button
                          onClick={() => handleStatusChange(b.bookingReservationId, 0)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(b.bookingReservationId, 1)}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm
                        </button>
                      )}
                      <button onClick={() => setConfirmDeleteId(b.bookingReservationId)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No booking reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Booking Details - #{selectedBooking.bookingReservationId}</h3>
              <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>X</button>
            </div>
            <div style={{ lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              <div><strong>Booking ID:</strong> #{selectedBooking.bookingReservationId}</div>
              <div><strong>Booking Date:</strong> {selectedBooking.bookingDate}</div>
              <div><strong>Customer Name:</strong> {selectedBooking.customerFullName}</div>
              <div><strong>Customer Email:</strong> {selectedBooking.customerEmail}</div>
              <div><strong>Customer Telephone:</strong> {selectedBooking.customerTelephone || 'Not provided'}</div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`badge ${selectedBooking.bookingStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                  {selectedBooking.bookingStatus === 1 ? 'Confirmed' : 'Cancelled'}
                </span>
              </div>
              <div><strong>Total Price:</strong> ${Number(selectedBooking.totalPrice).toFixed(2)}</div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Booked Rooms & Schedule</h4>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Rate / Day</th>
                    <th>Stay Dates</th>
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
                      <td>{d.startDate} to {d.endDate}</td>
                      <td>{d.numberOfDays} days</td>
                      <td><strong>${Number(d.actualPrice).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Reservation Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Reservation on Behalf of Customer</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Select Customer *</label>
                <select
                  className="form-control"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      #{c.customerId} - {c.customerFullName} ({c.emailAddress})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0 }}>Room Selection & Dates *</label>
                <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
                  + Add Another Room
                </button>
              </div>

              {bookingItems.map((item, index) => (
                <div key={index} className="card" style={{ padding: '12px', marginBottom: '12px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Room Item #{index + 1}</span>
                    {bookingItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 8px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Room</label>
                      <select
                        className="form-control"
                        value={item.roomId}
                        onChange={(e) => handleItemChange(index, 'roomId', e.target.value)}
                        required
                      >
                        <option value="">-- Select Room --</option>
                        {rooms.map((r) => (
                          <option key={r.roomId} value={r.roomId}>
                            Room {r.roomNumber} ({r.roomTypeName} - ${r.roomPricePerDay}/day)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={item.startDate}
                        onChange={(e) => handleItemChange(index, 'startDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={item.endDate}
                        onChange={(e) => handleItemChange(index, 'endDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Booking Deletion"
        message="Are you sure you want to permanently delete this booking reservation and its booking details?"
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

