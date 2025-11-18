import React, { useState, useEffect } from 'react';

const ClientForm = ({ client, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    note: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        client_name: client.client_name || '',
        contact_email: client.contact_email || '',
        contact_phone: client.contact_phone || '',
        address: client.address || '',
        note: client.note || '',
      });
    } else {
      setFormData({
        client_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        note: '',
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }
    
    if (formData.client_name.trim().length > 255) {
      newErrors.client_name = 'Client name is too long (max 255 characters)';
    }
    
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (formData.contact_phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data matching your backend expectations
      const submitData = {
        client_name: formData.client_name.trim(),
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        address: formData.address.trim() || null,
        note: formData.note.trim() || null,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-group">
        <label htmlFor="client_name">Client Name *</label>
        <input
          type="text"
          id="client_name"
          name="client_name"
          value={formData.client_name}
          onChange={handleChange}
          className={errors.client_name ? 'error' : ''}
          disabled={loading}
          placeholder="Enter client name"
          maxLength={255}
        />
        {errors.client_name && <span className="error-text">{errors.client_name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="contact_email">Contact Email</label>
        <input
          type="email"
          id="contact_email"
          name="contact_email"
          value={formData.contact_email}
          onChange={handleChange}
          className={errors.contact_email ? 'error' : ''}
          disabled={loading}
          placeholder="Enter email address"
        />
        {errors.contact_email && <span className="error-text">{errors.contact_email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="contact_phone">Contact Phone</label>
        <input
          type="tel"
          id="contact_phone"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
          className={errors.contact_phone ? 'error' : ''}
          disabled={loading}
          placeholder="Enter phone number"
        />
        {errors.contact_phone && <span className="error-text">{errors.contact_phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          disabled={loading}
          placeholder="Enter client address"
        />
      </div>

      <div className="form-group">
        <label htmlFor="note">Notes</label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows="3"
          disabled={loading}
          placeholder="Enter any additional notes"
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ClientForm;