import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';
import { ConfirmModal } from '../../components/ConfirmModal';

export const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

  // Confirm delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  // Form fields
  const [formData, setFormData] = useState({
    customerFullName: '',
    emailAddress: '',
    telephone: '',
    customerBirthday: '',
    customerStatus: 1,
    password: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (searchKeyword = keyword) => {
    setLoading(true);
    try {
      const data = await customerService.getAllCustomers(searchKeyword);
      setCustomers(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers(keyword);
  };

  const handleClearSearch = () => {
    setKeyword('');
    loadCustomers('');
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      customerFullName: '',
      emailAddress: '',
      telephone: '',
      customerBirthday: '',
      customerStatus: 1,
      password: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setModalMode('edit');
    setSelectedCustomer(c);
    setFormData({
      customerFullName: c.customerFullName || '',
      emailAddress: c.emailAddress || '',
      telephone: c.telephone || '',
      customerBirthday: c.customerBirthday || '',
      customerStatus: c.customerStatus ?? 1,
      password: '' // empty means don't change
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (c) => {
    setSelectedCustomer(c);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.telephone && formData.telephone.trim()) {
      const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
      if (!vnPhoneRegex.test(formData.telephone.trim())) {
        setError('Telephone must be a valid Vietnamese phone number (10 digits starting with 03, 05, 07, 08, 09 or +84).');
        return;
      }
    }

    if (formData.customerBirthday) {
      const birthDate = new Date(formData.customerBirthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setError('Customer must be at least 18 years old.');
        return;
      }
    }

    try {
      if (modalMode === 'create') {
        if (!formData.password) {
          setError('Password is required when creating a new customer.');
          return;
        }
        await customerService.createCustomer(formData);
        setSuccess('Customer created successfully.');
      } else {
        await customerService.updateCustomer(selectedCustomer.customerId, formData);
        setSuccess('Customer updated successfully.');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setError('');
    setSuccess('');
    try {
      const res = await customerService.deleteCustomer(confirmDeleteId);
      setSuccess(res.message || 'Customer deleted or status deactivated successfully.');
      setConfirmDeleteId(null);
      loadCustomers();
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">Manage registered customers, view profiles, and update status</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          Add New Customer
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Search Toolbar */}
      <div className="card" style={{ padding: '16px' }}>
        <form onSubmit={handleSearch} className="toolbar" style={{ margin: 0 }}>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name, email, or telephone..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          {keyword && (
            <button type="button" onClick={handleClearSearch} className="btn btn-secondary btn-sm">
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Customer Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Birthday</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading customers...</td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.customerId}>
                  <td>#{c.customerId}</td>
                  <td><strong>{c.customerFullName}</strong></td>
                  <td>{c.emailAddress}</td>
                  <td>{c.telephone || '-'}</td>
                  <td>{c.customerBirthday || '-'}</td>
                  <td>
                    <span className={`badge ${c.customerStatus === 1 ? 'badge-success' : 'badge-danger'}`}>
                      {c.customerStatus === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => openDetailModal(c)} className="btn btn-secondary btn-sm">
                        View
                      </button>
                      <button onClick={() => openEditModal(c)} className="btn btn-primary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDeleteId(c.customerId)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'create' ? 'Add New Customer' : 'Edit Customer Information'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.customerFullName}
                  onChange={(e) => setFormData({ ...formData, customerFullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telephone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Birthday</label>
                  <input
                    type="date"
                    className="form-control"
                    max={maxDate}
                    value={formData.customerBirthday}
                    onChange={(e) => setFormData({ ...formData, customerBirthday: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.customerStatus}
                    onChange={(e) => setFormData({ ...formData, customerStatus: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {modalMode === 'create' ? 'Password *' : 'New Password (Optional)'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={modalMode === 'create' ? 'Min 6 characters' : 'Leave empty to keep current'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Save Customer' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Customer Details</h3>
              <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>X</button>
            </div>
            <div style={{ lineHeight: '1.8', fontSize: '14px' }}>
              <div><strong>Customer ID:</strong> #{selectedCustomer.customerId}</div>
              <div><strong>Full Name:</strong> {selectedCustomer.customerFullName}</div>
              <div><strong>Email Address:</strong> {selectedCustomer.emailAddress}</div>
              <div><strong>Telephone:</strong> {selectedCustomer.telephone || 'Not provided'}</div>
              <div><strong>Birthday:</strong> {selectedCustomer.customerBirthday || 'Not provided'}</div>
              <div><strong>Account Status:</strong> {selectedCustomer.customerStatus === 1 ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Customer Deletion"
        message="Are you sure you want to delete this customer? If the customer has booking transactions, their account will be deactivated instead of removed."
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

