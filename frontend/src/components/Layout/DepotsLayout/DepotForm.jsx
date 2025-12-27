import { useState } from 'react';
import { depotsHelpers } from '../../../utils/depotsHelpers';
import { depotsConfig } from '../../../config/depotsConfig';
import styles from '../../../pages/Schema/Subpages/Depots/DepotsPage.module.css';

const DepotForm = ({ isEditing, currentDepot, loading, error, onSubmit, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    name: currentDepot?.name || ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = depotsHelpers.validateDepot(formData, depotsConfig.validationSchema);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      onError(err.message || 'Failed to save depot');
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
          {isEditing ? 'EDIT DEPOT' : 'CREATE DEPOT'}
        </h1>
        <p className={styles.subtitle}>
          {isEditing ? 'Update depot details' : 'Add a new depot'}
        </p>

        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <span className={styles.errorMessage}>{error}</span>
              <button onClick={() => onError('')} className={styles.closeBtn}>×</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.depotForm}>
          <FormField
            type="text"
            field="name"
            label="Name"
            placeholder="Depot name *"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            required
          />

          <div className={styles.formActions}>
            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Saving...' : isEditing ? 'Update Depot' : 'Create Depot'}
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

export default DepotForm;
