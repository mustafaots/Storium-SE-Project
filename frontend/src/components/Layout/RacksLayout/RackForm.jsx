import { useState } from 'react';
import { racksHelpers } from '../../../utils/racksHelpers';
import { racksConfig } from '../../../config/racksConfig';
import styles from '../../../pages/Schema/Subpages/Racks/RacksPage.module.css';

const RackForm = ({ isEditing, currentRack, loading, error, onSubmit, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    rack_code: currentRack?.rack_code || ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = racksHelpers.validateRack(formData, racksConfig.validationSchema);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      onError(err.message || 'Failed to save rack');
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
          {isEditing ? 'EDIT RACK' : 'CREATE RACK'}
        </h1>
        <p className={styles.subtitle}>
          {isEditing ? 'Update rack details' : 'Add a new rack'}
        </p>

        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <span className={styles.errorMessage}>{error}</span>
              <button onClick={() => onError('')} className={styles.closeBtn}>×</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.rackForm}>
          <FormField
            type="text"
            field="rack_code"
            label="Rack Code"
            placeholder="Rack code *"
            value={formData.rack_code}
            onChange={handleChange}
            error={formErrors.rack_code}
            required
          />

          <div className={styles.formActions}>
            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Saving...' : isEditing ? 'Update Rack' : 'Create Rack'}
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

export default RackForm;
