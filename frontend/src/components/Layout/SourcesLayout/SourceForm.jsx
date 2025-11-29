// src/components/Layout/SourceLayout/SourceForm.js
import { useState, useEffect } from 'react';
import { sourcesAPI } from '../../../utils/sourcesAPI';
import { validators, validate } from '../../../utils/validators';
import styles from '../../../pages/Sources/SourcesPage.module.css';

const SourceForm = ({ isEditing, currentSource, loading, error, onSuccess, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    source_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    coordinates: '',
    rating: '',
    is_active: true
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
        rating: currentSource.rating || '',
        is_active: currentSource.is_active ?? true
      });
    } else {
      setFormData({
        source_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        coordinates: '',
        rating: '',
        is_active: true
      });
    }
    setFormErrors({});
  }, [currentSource, isEditing]);

  // Validation schema
  const sourceValidationSchema = {
    source_name: [validators.required, (v) => validators.minLength(v, 2, 'Source name')],
    contact_email: [validators.email],
    contact_phone: [(v) => validators.phone(v, 'Contact phone')],
    address: [(v) => validators.maxLength(v, 500, 'Address')],
    coordinates: [],
    rating: [(v) => {
      if (!v) return { isValid: true };
      const num = parseFloat(v);
      if (isNaN(num)) return { isValid: false, error: 'Rating must be a number' };
      if (num < 0 || num > 5) return { isValid: false, error: 'Rating must be between 0 and 5' };
      return { isValid: true };
    }],
    is_active: []
  };

  const validateForm = () => {
    const sanitized = validate.sanitize(formData);
    const { isValid, errors } = validate.form(sanitized, sourceValidationSchema);
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const sanitized = validate.sanitize(formData);
      
      if (isEditing && currentSource?.source_id) {
        await sourcesAPI.update(currentSource.source_id, sanitized);
      } else {
        await sourcesAPI.create(sanitized);
      }
      
      onSuccess();
    } catch (err) {
      onError('Failed to ' + (isEditing ? 'update' : 'create') + ' source: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        <h1 className={styles.title}>{isEditing ? 'EDIT SOURCE' : 'CREATE SOURCE'}</h1>
        <p className={styles.subtitle}>{isEditing ? 'Update source details' : 'Add a new supplier/source'}</p>

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
            type="email" 
            field="contact_email" 
            placeholder="Contact Email" 
            value={formData.contact_email} 
            onChange={handleChange} 
            error={formErrors.contact_email} 
          />

          <FormField 
            type="tel" 
            field="contact_phone" 
            placeholder="Contact Phone" 
            value={formData.contact_phone} 
            onChange={handleChange} 
            error={formErrors.contact_phone} 
          />
          
          <FormField 
            type="textarea" 
            field="address" 
            placeholder="Address" 
            value={formData.address} 
            onChange={handleChange} 
            error={formErrors.address} 
            rows={3}
          />
          
          <FormField 
            type="text" 
            field="coordinates" 
            placeholder="Coordinates (e.g., 36.7538° N, 3.0588° E)" 
            value={formData.coordinates} 
            onChange={handleChange} 
            error={formErrors.coordinates} 
          />
          
          <FormField 
            type="number" 
            field="rating" 
            placeholder="Rating (0-5, e.g., 4.5)" 
            value={formData.rating} 
            onChange={handleChange} 
            error={formErrors.rating} 
            step="0.1"
            min="0"
            max="5"
          />

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={formData.is_active}
                onChange={(e) => handleCheckboxChange('is_active', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Active Source</span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              disabled={loading || submitting} 
              className={styles.primaryButton}
            >
              {(loading || submitting) ? 'Saving...' : (isEditing ? 'Update Source' : 'Create Source')}
            </button>
            
            <button 
              type="button" 
              onClick={onCancel} 
              disabled={loading || submitting} 
              className={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ type, field, placeholder, value, onChange, error, required, rows, step, min, max }) => (
  <div className={styles.formGroup}>
    {type === 'textarea' ? (
      <textarea 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(field, e.target.value)} 
        rows={rows} 
        className={`${styles.formTextarea} ${error ? styles.inputError : ''}`} 
      />
    ) : (
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(field, e.target.value)} 
        required={required} 
        step={step}
        min={min}
        max={max}
        className={`${styles.formInput} ${error ? styles.inputError : ''}`} 
      />
    )}
    {error && <span className={styles.errorText}>{error}</span>}
  </div>
);

export default SourceForm;