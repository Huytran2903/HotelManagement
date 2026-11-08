import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';

export const CreateBookingPage = () => {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('roomId');

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    {
      roomId: initialRoomId || '',
      startDate: '',
      endDate: ''
    }
  ]);

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const rooms = await roomService.getActiveRooms();
      setAvailableRooms(rooms);
      if (initialRoomId && !selectedItems[0].roomId) {
        setSelectedItems([{ roomId: initialRoomId, startDate: '', endDate: '' }]);
      } else if (!selectedItems[0].roomId && rooms.length > 0) {
        setSelectedItems([{ roomId: rooms[0].roomId, startDate: '', endDate: '' }]);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleAddItem = () => {
    const unselectedRoom = availableRooms.find(
      (r) => !selectedItems.some((item) => Number(item.roomId) === r.roomId)
    );
    setSelectedItems([
      ...selectedItems,
      {
        roomId: unselectedRoom ? unselectedRoom.roomId : (availableRooms[0]?.roomId || ''),
        startDate: selectedItems[0]?.startDate || '',
        endDate: selectedItems[0]?.endDate || ''
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (selectedItems.length <= 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  // Calculate pricing breakdown
  const calculateItemSummary = (item) => {
    if (!item.roomId || !item.startDate || !item.endDate) {
      return { days: 0, pricePerDay: 0, total: 0, valid: false };
    }

    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { days: 0, pricePerDay: 0, total: 0, valid: false, error: 'End date must be after start date' };
    }

    const room = availableRooms.find((r) => r.roomId === Number(item.roomId));
    const pricePerDay = room ? Number(room.roomPricePerDay) : 0;
    const total = diffDays * pricePerDay;

    return { days: diffDays, pricePerDay, total, valid: true, room };
  };

  const itemSummaries = selectedItems.map(calculateItemSummary);
  const totalReservationPrice = itemSummaries.reduce((sum, s) => sum + (s.valid ? s.total : 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    const roomIds = new Set();
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      if (!item.roomId) {
        setError(`Please select a room for item #${i + 1}`);
        return;
      }
      if (roomIds.has(Number(item.roomId))) {
        setError(`Room appears multiple times. Please select different rooms.`);
        return;
      }
      roomIds.add(Number(item.roomId));

      if (!item.startDate || !item.endDate) {
        setError(`Please specify start date and end date for all selected rooms.`);
        return;
      }

      if (new Date(item.endDate) <= new Date(item.startDate)) {
        setError(`End date must be strictly after start date for room item #${i + 1}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        items: selectedItems.map((item) => ({
          roomId: Number(item.roomId),
          startDate: item.startDate,
          endDate: item.endDate
        }))
      };

      const result = await bookingService.createBooking(payload);
      setSuccess(`Booking #${result.bookingReservationId} reserved successfully! Redirecting to booking history...`);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Online Room Reservation</h1>
          <p className="page-subtitle">Select one or multiple rooms and reserve your stay</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Selected Rooms & Stay Dates</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-secondary btn-sm"
                  disabled={selectedItems.length >= availableRooms.length}
                >
                  + Add Another Room
                </button>
              </div>

              {loadingRooms ? (
                <div>Loading rooms...</div>
              ) : (
                selectedItems.map((item, index) => {
                  const summary = itemSummaries[index];
                  return (
                    <div
                      key={index}
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '16px',
                        marginBottom: '16px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '13px' }}>Room Selection #{index + 1}</strong>
                        {selectedItems.length > 1 && (
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

                      <div className="form-group">
                        <label className="form-label">Room</label>
                        <select
                          className="form-control"
                          value={item.roomId}
                          onChange={(e) => handleItemChange(index, 'roomId', e.target.value)}
                          required
                        >
                          <option value="">-- Choose Room --</option>
                          {availableRooms.map((r) => (
                            <option key={r.roomId} value={r.roomId}>
                              Room {r.roomNumber} - {r.roomTypeName} (${r.roomPricePerDay}/day, Max {r.roomMaxCapacity} Guests)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Check-in Date (Start Date)</label>
                          <input
                            type="date"
                            className="form-control"
                            value={item.startDate}
                            onChange={(e) => handleItemChange(index, 'startDate', e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Check-out Date (End Date)</label>
                          <input
                            type="date"
                            className="form-control"
                            value={item.endDate}
                            onChange={(e) => handleItemChange(index, 'endDate', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {summary.valid && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                          Duration: {summary.days} night(s) x ${summary.pricePerDay.toFixed(2)} = <strong>${summary.total.toFixed(2)}</strong>
                        </div>
                      )}
                      {summary.error && (
                        <div style={{ fontSize: '12px', color: 'var(--danger-color)', textAlign: 'right' }}>
                          {summary.error}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pricing & Booking Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '24px' }}>
              <h3 className="card-title">Reservation Summary</h3>

              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Total Rooms:</span>
                  <strong>{selectedItems.length}</strong>
                </div>
                {itemSummaries.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Room {s.room?.roomNumber || `#${idx + 1}`}:</span>
                    <span>{s.valid ? `$${s.total.toFixed(2)} (${s.days} nights)` : '-'}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Total Price:</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-color)' }}>
                  ${totalReservationPrice.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={submitting || totalReservationPrice <= 0}
              >
                {submitting ? 'Confirming Reservation...' : 'Confirm & Complete Booking'}
              </button>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                Availability and rates are validated upon submission.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

