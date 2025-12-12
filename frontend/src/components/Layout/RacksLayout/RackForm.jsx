import { useState } from 'react';
import { useEffect } from 'react';
import { racksHelpers } from '../../../utils/racksHelpers';
import styles from '../../../pages/Schema/Subpages/Racks/RacksPage.module.css';

const RackForm = ({ isEditing, currentRack, loading, error, onSubmit, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    face_type: 'single',
    levels: 1,
    bays: 1,
    bins_per_bay: 1
  });

  useEffect(() => {
    if (currentRack?.rack_code) {
      const parsed = racksHelpers.parseRackCode(currentRack.rack_code);
      if (parsed) {
        setFormData(parsed);
      }
    }
  }, [currentRack]);

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = racksHelpers.validateRack(formData);
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

        <div className={styles.codePreview}>
          Generated code: <strong>{racksHelpers.buildRackCode(formData)}</strong>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <span className={styles.errorMessage}>{error}</span>
              <button onClick={() => onError('')} className={styles.closeBtn}>×</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.rackForm}>
          <SelectField
            field="face_type"
            label="Rack Face"
            value={formData.face_type}
            onChange={handleChange}
            error={formErrors.face_type}
            options={[
              { value: 'single', label: 'Single face (wall)' },
              { value: 'double', label: 'Double face' }
            ]}
          />

          <FormField
            type="number"
            field="levels"
            label="Levels"
            placeholder="Number of levels"
            min={1}
            value={formData.levels}
            onChange={handleChange}
            error={formErrors.levels}
            required
          />

          <FormField
            type="number"
            field="bays"
            label="Bays"
            placeholder="Number of bays"
            min={1}
            value={formData.bays}
            onChange={handleChange}
            error={formErrors.bays}
            required
          />

          <FormField
            type="number"
            field="bins_per_bay"
            label="Bins per bay"
            placeholder="Bins per bay"
            min={1}
            value={formData.bins_per_bay}
            onChange={handleChange}
            error={formErrors.bins_per_bay}
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

const FormField = ({ type, field, label, placeholder, value, onChange, error, required, min }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      {label}
      {required && <span className={styles.required}> *</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      min={min}
      onChange={(e) => onChange(field, e.target.value)}
      required={required}
      className={`${styles.formInput} ${error ? styles.inputError : ''}`}
    />
    {error && <span className={styles.errorText}>{error}</span>}
  </div>
);

const SelectField = ({ field, label, value, onChange, options, error }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={`${styles.formInput} ${error ? styles.inputError : ''}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <span className={styles.errorText}>{error}</span>}
  </div>
);

export default RackForm;
