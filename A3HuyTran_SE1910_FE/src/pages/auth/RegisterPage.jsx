import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertMessage } from '../../components/AlertMessage';
import { extractErrorMessage } from '../../services/api';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    customerFullName: '',
    emailAddress: '',
    telephone: '',
    customerBirthday: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Maximum birthday allowed is 18 years ago today
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // 2. Vietnamese phone number format check
    const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    const trimmedPhone = (formData.telephone || '').trim();
    if (!trimmedPhone) {
      setError('Telephone number is required.');
      return;
    }
    if (!vnPhoneRegex.test(trimmedPhone)) {
      setError('Telephone must be a valid Vietnamese phone number (10 digits starting with 03, 05, 07, 08, 09 or +84).');
      return;
    }

    // 3. Date of birth check (at least 18 years old)
    if (!formData.customerBirthday) {
      setError('Date of birth is required.');
      return;
    }

    const birthDate = new Date(formData.customerBirthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('You must be at least 18 years old to register.');
      return;
    }

    setLoading(true);
    try {
      await register({
        customerFullName: formData.customerFullName.trim(),
        emailAddress: formData.emailAddress.trim(),
        telephone: trimmedPhone,
        customerBirthday: formData.customerBirthday,
        password: formData.password
      });

      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2 className="auth-title">Customer Registration</h2>
        <p className="auth-subtitle">Create a new customer account to book hotel rooms</p>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />
        <AlertMessage type="success" message={success} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="customerFullName"
              className="form-control"
              placeholder="e.g. Nguyen Van An"
              value={formData.customerFullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="emailAddress"
              className="form-control"
              placeholder="e.g. an.nguyen@example.com"
              value={formData.emailAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telephone *</label>
              <input
                type="tel"
                name="telephone"
                className="form-control"
                placeholder="e.g. 0901234567"
                value={formData.telephone}
                onChange={handleChange}
                required
              />
              <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                10-digit VN format (03x, 05x, 07x, 08x, 09x or +84...)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="customerBirthday"
                className="form-control"
                max={maxDate}
                value={formData.customerBirthday}
                onChange={handleChange}
                required
              />
              <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                Must be at least 18 years old
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

