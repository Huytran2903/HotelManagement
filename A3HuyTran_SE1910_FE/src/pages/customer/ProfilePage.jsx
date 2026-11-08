import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { extractErrorMessage } from '../../services/api';
import { AlertMessage } from '../../components/AlertMessage';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    customerFullName: '',
    telephone: '',
    customerBirthday: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await customerService.getProfile();
      setProfile(data);
      setFormData({
        customerFullName: data.customerFullName || '',
        telephone: data.telephone || '',
        customerBirthday: data.customerBirthday || '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

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
        setError('You must be at least 18 years old.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        customerFullName: formData.customerFullName,
        telephone: formData.telephone,
        customerBirthday: formData.customerBirthday || null,
        newPassword: formData.newPassword || null
      };

      const updated = await customerService.updateProfile(payload);
      setProfile(updated);
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="main-content" style={{ padding: '40px', textAlign: 'center' }}>Loading your profile...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Profile</h1>
          <p className="page-subtitle">View and update your personal information and password</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input
              type="text"
              className="form-control"
              value={profile?.emailAddress || ''}
              disabled
              style={{ backgroundColor: '#f1f5f9' }}
            />
          </div>

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

          <div style={{ margin: '20px 0 16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Change Password (Optional)</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Leave blank if you do not want to change your existing password.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

