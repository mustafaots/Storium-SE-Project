import { useState } from 'react';
import { locationsHelpers } from '../../../utils/locationsHelpers';
import { locationsConfig } from '../../../config/locationsConfig';
import styles from '../../../pages/Schema/Subpages/Locations/LocationsPage.module.css';

// Simple create/update form for locations
const LocationForm = ({
  isEditing,
  currentLocation,
  loading,
  error,
  onSubmit,
  onCancel,
  onError
}) => {
  const [formData, setFormData] = useState({
    name: currentLocation?.name || '',
    address: currentLocation?.address || '',
    coordinates: currentLocation?.coordinates || ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = locationsHelpers.validateLocation(formData, locationsConfig.validationSchema);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      onError(err.message || 'Failed to save location');
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        <h1 className={styles.title}>
          {isEditing ? 'EDIT LOCATION' : 'CREATE LOCATION'}
        </h1>
        <p className={styles.subtitle}>
          {isEditing ? 'Update location details' : 'Add a new location'}
        </p>

        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <span className={styles.errorMessage}>{error}</span>
              <button onClick={() => onError('')} className={styles.closeBtn}>×</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.locationForm}>
          <FormField
            type="text"
            field="name"
            label="Name"
            placeholder="Location name *"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            required
          />

          <FormField
            type="text"
            field="address"
            label="Address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            error={formErrors.address}
          />

          <FormField
            type="text"
            field="coordinates"
            label="Coordinates"
            placeholder="Coordinates (e.g., lat,long)"
            value={formData.coordinates}
            onChange={handleChange}
            error={formErrors.coordinates}
          />

          <div className={styles.formActions}>
            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Saving...' : isEditing ? 'Update Location' : 'Create Location'}
            </button>
            <button type="button" onClick={onCancel} disabled={loading} className={styles.secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ type, field, label, placeholder, value, onChange, error, required }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      {label}
      {required && <span className={styles.required}> *</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`${styles.formTextarea} ${error ? styles.inputError : ''}`}
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        required={required}
        className={`${styles.formInput} ${error ? styles.inputError : ''}`}
      />
    )}
    {error && <span className={styles.errorText}>{error}</span>}
  </div>
);

export default LocationForm;
