import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import { roomTypeService } from '../../services/roomTypeService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, typesData] = await Promise.all([
        roomService.getPublicRooms(),
        roomTypeService.getAllRoomTypes()
      ]);
      setRooms(roomsData);
      setRoomTypes(typesData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (selectedType && r.roomTypeId !== Number(selectedType)) return false;
    if (capacityFilter && r.roomMaxCapacity < Number(capacityFilter)) return false;
    return true;
  });

  const handleBookClick = (roomId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/book?roomId=${roomId}`);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Hotel Rooms</h1>
          <p className="page-subtitle">
            Browse our comfortable accommodations, select preferred rooms, and make instant online reservations
          </p>
        </div>
        {isAuthenticated && !isStaff && (
          <Link to="/book" className="btn btn-primary">
            Create Booking
          </Link>
        )}
      </div>

      <AlertMessage message={error} onClose={() => setError('')} />

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <label className="form-label" style={{ margin: 0, marginRight: '8px' }}>Filter Rooms:</label>
          <select
            className="form-control"
            style={{ width: '200px' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Room Types</option>
            {roomTypes.map((t) => (
              <option key={t.roomTypeId} value={t.roomTypeId}>
                {t.roomTypeName}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: '180px' }}
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
          >
            <option value="">Any Capacity</option>
            <option value="2">2+ Guests</option>
            <option value="3">3+ Guests</option>
            <option value="4">4+ Guests</option>
          </select>

          {(selectedType || capacityFilter) && (
            <button
              onClick={() => {
                setSelectedType('');
                setCapacityFilter('');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading available rooms...
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="room-grid">
          {filteredRooms.map((room) => (
            <div key={room.roomId} className="room-card">
              <div>
                <div className="room-card-header">
                  <span className="room-number">Room {room.roomNumber}</span>
                  <span className="room-type">{room.roomTypeName}</span>
                </div>

                <div className="room-price">
                  ${Number(room.roomPricePerDay).toFixed(2)}
                  <span className="room-price-period"> / night</span>
                </div>

                <div className="room-meta">
                  Capacity: {room.roomMaxCapacity} Guests
                </div>

                <p className="room-desc">
                  {room.roomDetailDescription || 'Comfortable and fully equipped room with modern hotel amenities.'}
                </p>
              </div>

              <div className="btn-group" style={{ marginTop: '16px' }}>
                <Link to={`/rooms/${room.roomId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  View Details
                </Link>
                {!isStaff && (
                  <button
                    onClick={() => handleBookClick(room.roomId)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          No rooms match the selected filters.
        </div>
      )}
    </div>
  );
};

