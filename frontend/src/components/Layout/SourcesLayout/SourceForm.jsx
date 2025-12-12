// src/components/Layout/SourceLayout/SourceForm.js
import { useState, useEffect } from 'react';
import { sourcesAPI } from '../../../utils/sourcesAPI';
import styles from '../../../pages/Sources/SourcesPage.module.css';

const SourceForm = ({ isEditing, currentSource, loading, error, onSuccess, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    source_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    coordinates: '',
    rate: '',
    rate_unit: '',
    is_active: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Update form when currentSource changes
  useEffect(() => {
    if (isEditing && currentSource) {
      setFormData({
        source_name: currentSource.source_name || '',
        contact_email: currentSource.contact_email || '',
        contact_phone: currentSource.contact_phone || '',
        address: currentSource.address || '',
        coordinates: currentSource.coordinates || '',
        rate: currentSource.rate || '',
        rate_unit: currentSource.rate_unit || '',
        is_active: !!currentSource.is_active
      });
    } else {
      setFormData({
        source_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        coordinates: '',
        rate: '',
        rate_unit: '',
        is_active: false
      });
    }
    setFormErrors({});
  }, [currentSource, isEditing]);

  // ----------------------------
  // Validators
  // ----------------------------
  const required = (v) => (v ? '' : 'This field is required');
  const minLength = (v, len, field) => (v && v.length >= len ? '' : `${field} must be at least ${len} characters`);
  const optionalEmail = (v) => {
    if (!v) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v) ? '' : 'Invalid email';
  };
  const optionalPhone = (v) => {
    if (!v) return '';
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(v) ? '' : 'Invalid phone';
  };
  const positiveNumber = (v) => {
    if (v === '' || v === null || v === undefined) return 'Rate is required';
    return Number(v) > 0 ? '' : 'Rate must be a positive number';
  };
  const rateUnitFormat = (v) => {
    if (!v) return '';
    return /.+\s*\/\s*.+/.test(v) ? '' : 'Unit must be in format "product / time unit"';
  };

  // Validation schema
  const sourceValidationSchema = {
    source_name: [required, (v) => minLength(v, 2, 'Source name')],
    contact_email: [optionalEmail],
    contact_phone: [optionalPhone],
    address: [],
    coordinates: [],
    rate: [positiveNumber],
    rate_unit: [rateUnitFormat],
    is_active: []
  };

  // ----------------------------
  // Form validation
  // ----------------------------
  const validateForm = () => {
    const errors = {};
    Object.keys(sourceValidationSchema).forEach((field) => {
      const rules = sourceValidationSchema[field];
      if (rules && rules.length > 0) {
        for (let rule of rules) {
          const errorMsg = rule(formData[field]);
          if (errorMsg) {
            errors[field] = errorMsg;
            break;
          }
        }
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditing && currentSource?.source_id) {
        await sourcesAPI.update(currentSource.source_id, formData);
      } else {
        await sourcesAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      onError('Failed to ' + (isEditing ? 'update' : 'create') + ' source: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  // ----------------------------
  // JSX
  // ----------------------------
  return (
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        <h1 className={styles.title}>{isEditing ? 'EDIT SOURCE' : 'CREATE SOURCE'}</h1>
        <p className={styles.subtitle}>{isEditing ? 'Update source details' : 'Add a new source'}</p>

        {error && (
          <div className={styles.errorAlert}>
            <span>{error}</span>
            <button onClick={() => onError('')}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.clientForm}>
          <FormField
            type="text"
            field="source_name"
            placeholder="Source Name *"
            value={formData.source_name}
            onChange={handleChange}
            error={formErrors.source_name}
            required
          />

          <FormField
            type="text"
            field="contact_email"
            placeholder="Contact Email (Optional)"
            value={formData.contact_email}
            onChange={handleChange}
            error={formErrors.contact_email}
          />

          <FormField
            type="text"
            field="contact_phone"
            placeholder="Contact Phone (Optional)"
            value={formData.contact_phone}
            onChange={handleChange}
            error={formErrors.contact_phone}
          />

          <FormField
            type="text"
            field="address"
            placeholder="Address (Optional)"
            value={formData.address}
            onChange={handleChange}
            error={formErrors.address}
          />

          <FormField
            type="text"
            field="coordinates"
            placeholder="Coordinates (Optional)"
            value={formData.coordinates}
            onChange={handleChange}
            error={formErrors.coordinates}
          />

          {/* Rate fields */}
          <FormField
            type="number"
            field="rate"
            placeholder="Rate (positive number)"
            value={formData.rate}
            onChange={handleChange}
            error={formErrors.rate}
            required
          />

          <FormField
            type="text"
            field="rate_unit"
            placeholder='Rate Unit e.g. "product / day"'
            value={formData.rate_unit}
            onChange={handleChange}
            error={formErrors.rate_unit}
          />

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleCheckboxChange('is_active', e.target.checked)}
              />{' '}
              Active
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={loading || submitting} className={styles.primaryButton}>
              {(loading || submitting) ? 'Saving...' : (isEditing ? 'Update Source' : 'Create Source')}
            </button>

            <button type="button" onClick={onCancel} disabled={loading || submitting} className={styles.secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ type, field, placeholder, value, onChange, error, required }) => (
  <div className={styles.formGroup}>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      required={required}
      className={`${styles.formInput} ${error ? styles.inputError : ''}`}
    />
    {error && <span className={styles.errorText}>{error}</span>}
  </div>
);

export default SourceForm;
