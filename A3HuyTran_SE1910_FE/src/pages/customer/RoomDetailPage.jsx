import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomById(id);
      setRoom(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/book?roomId=${id}`);
    }
  };

  if (loading) {
    return <div className="main-content" style={{ padding: '40px', textAlign: 'center' }}>Loading room information...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room {room?.roomNumber} Details</h1>
          <p className="page-subtitle">{room?.roomTypeName} specifications and rate</p>
        </div>
        <Link to="/" className="btn btn-secondary">
          Back to Rooms
        </Link>
      </div>

      <AlertMessage message={error} onClose={() => setError('')} />

      {room && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-color)' }}>
                Room {room.roomNumber}
              </h2>
              <span className="badge badge-info" style={{ marginTop: '6px' }}>
                {room.roomTypeName}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
                ${Number(room.roomPricePerDay).toFixed(2)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>per day / night</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0', margin: '16px 0', lineHeight: 1.8 }}>
            <div><strong>Maximum Capacity:</strong> {room.roomMaxCapacity} Guests</div>
            <div>
              <strong>Availability Status:</strong>{' '}
              <span className={`badge ${room.roomStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                {room.roomStatus === 1 ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: '6px', color: 'var(--text-muted)' }}>
                {room.roomDetailDescription || 'This room provides spacious accommodation with essential hotel features, standard toiletries, high-speed WiFi, air conditioning, and daily housekeeping services.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Link to="/" className="btn btn-secondary">
              Browse More Rooms
            </Link>
            {!isStaff && room.roomStatus === 1 && (
              <button onClick={handleBookClick} className="btn btn-primary">
                Book This Room
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

