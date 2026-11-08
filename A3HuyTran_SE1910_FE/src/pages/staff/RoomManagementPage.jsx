import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/roomService';
import { roomTypeService } from '../../services/roomTypeService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';
import { ConfirmModal } from '../../components/ConfirmModal';

export const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  // Confirm delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomDetailDescription: '',
    roomMaxCapacity: 2,
    roomTypeId: '',
    roomStatus: 1,
    roomPricePerDay: ''
  });

  useEffect(() => {
    loadRoomTypes();
    loadRooms();
  }, []);

  const loadRoomTypes = async () => {
    try {
      const types = await roomTypeService.getAllRoomTypes();
      setRoomTypes(types);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRooms = async (searchKw = keyword, typeId = selectedRoomTypeId, status = selectedStatus) => {
    setLoading(true);
    try {
      const params = {};
      if (searchKw) params.keyword = searchKw;
      if (typeId) params.roomTypeId = typeId;
      if (status !== '') params.status = status;

      const data = await roomService.getAllRooms(params);
      setRooms(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadRooms(keyword, selectedRoomTypeId, selectedStatus);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedRoomTypeId('');
    setSelectedStatus('');
    loadRooms('', '', '');
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      roomNumber: '',
      roomDetailDescription: '',
      roomMaxCapacity: 2,
      roomTypeId: roomTypes[0]?.roomTypeId || '',
      roomStatus: 1,
      roomPricePerDay: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r) => {
    setModalMode('edit');
    setSelectedRoom(r);
    setFormData({
      roomNumber: r.roomNumber || '',
      roomDetailDescription: r.roomDetailDescription || '',
      roomMaxCapacity: r.roomMaxCapacity || 2,
      roomTypeId: r.roomTypeId || '',
      roomStatus: r.roomStatus ?? 1,
      roomPricePerDay: r.roomPricePerDay || ''
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (r) => {
    setSelectedRoom(r);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        roomMaxCapacity: Number(formData.roomMaxCapacity),
        roomTypeId: Number(formData.roomTypeId),
        roomStatus: Number(formData.roomStatus),
        roomPricePerDay: parseFloat(formData.roomPricePerDay)
      };

      if (modalMode === 'create') {
        await roomService.createRoom(payload);
        setSuccess('Room created successfully.');
      } else {
        await roomService.updateRoom(selectedRoom.roomId, payload);
        setSuccess('Room updated successfully.');
      }
      setIsModalOpen(false);
      loadRooms();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setError('');
    setSuccess('');
    try {
      const res = await roomService.deleteRoom(confirmDeleteId);
      setSuccess(res.message);
      setConfirmDeleteId(null);
      loadRooms();
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Management</h1>
          <p className="page-subtitle">Configure rooms, room types, pricing, and availability status</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          Add New Room
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
            placeholder="Search by room number or description..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedRoomTypeId}
            onChange={(e) => setSelectedRoomTypeId(e.target.value)}
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
            style={{ width: '140px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Filter
          </button>
          <button type="button" onClick={handleResetFilters} className="btn btn-secondary btn-sm">
            Reset
          </button>
        </form>
      </div>

      {/* Room Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Max Capacity</th>
              <th>Price / Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading rooms...</td>
              </tr>
            ) : rooms.length > 0 ? (
              rooms.map((r) => (
                <tr key={r.roomId}>
                  <td>#{r.roomId}</td>
                  <td><strong>Room {r.roomNumber}</strong></td>
                  <td>{r.roomTypeName}</td>
                  <td>{r.roomMaxCapacity} Guests</td>
                  <td><strong>${Number(r.roomPricePerDay).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${r.roomStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                      {r.roomStatus === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => openDetailModal(r)} className="btn btn-secondary btn-sm">
                        View
                      </button>
                      <button onClick={() => openEditModal(r)} className="btn btn-primary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDeleteId(r.roomId)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Room Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'create' ? 'Add New Room' : 'Edit Room'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 101"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Room Type *</label>
                  <select
                    className="form-control"
                    value={formData.roomTypeId}
                    onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                    required
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map((t) => (
                      <option key={t.roomTypeId} value={t.roomTypeId}>
                        {t.roomTypeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Room Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detailed description of room features and layout..."
                  value={formData.roomDetailDescription}
                  onChange={(e) => setFormData({ ...formData, roomDetailDescription: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Capacity (Guests) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.roomMaxCapacity}
                    onChange={(e) => setFormData({ ...formData, roomMaxCapacity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price Per Day ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="e.g. 75.00"
                    value={formData.roomPricePerDay}
                    onChange={(e) => setFormData({ ...formData, roomPricePerDay: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.roomStatus}
                    onChange={(e) => setFormData({ ...formData, roomStatus: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Create Room' : 'Update Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {isDetailModalOpen && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Room Details - Room {selectedRoom.roomNumber}</h3>
              <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>X</button>
            </div>
            <div style={{ lineHeight: '1.8', fontSize: '14px' }}>
              <div><strong>Room ID:</strong> #{selectedRoom.roomId}</div>
              <div><strong>Room Number:</strong> {selectedRoom.roomNumber}</div>
              <div><strong>Room Type:</strong> {selectedRoom.roomTypeName}</div>
              <div><strong>Max Capacity:</strong> {selectedRoom.roomMaxCapacity} Guests</div>
              <div><strong>Price Per Day:</strong> ${Number(selectedRoom.roomPricePerDay).toFixed(2)}</div>
              <div><strong>Status:</strong> {selectedRoom.roomStatus === 1 ? 'Active' : 'Inactive'}</div>
              <div style={{ marginTop: '8px' }}>
                <strong>Description:</strong>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                  {selectedRoom.roomDetailDescription || 'No description provided.'}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Room Deletion"
        message="Are you sure you want to delete this room? If this room has ever been used in a booking transaction, it will be deactivated (status set to Inactive) instead of deleted, according to system rules."
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

