// represents the form modal that appears when creating or editing a client in the clients page

import { useState } from 'react';
import { clientsAPI } from '../../../utils/clientsAPI';
import { validators, validate } from '../../../utils/validators';
import styles from '../../../pages/Clients/ClientsPage.module.css';

// ClientForm component for creating/editing clients
const ClientForm = ({ isEditing, currentClient, loading, error, onSuccess, onCancel, onError }) => {

  // Form state
  const [formData, setFormData] = useState({
    client_name: currentClient?.client_name || '',
    contact_email: currentClient?.contact_email || '',
    contact_phone: currentClient?.contact_phone || '',
    address: currentClient?.address || ''
  });
  
  // Form errors state
  const [formErrors, setFormErrors] = useState({});

  // Validation schema for client form fields using validators utility
  const clientValidationSchema = {
    client_name: [
      validators.required,
      (value) => validators.minLength(value, 2, 'Client name'),
      (value) => validators.maxLength(value, 100, 'Client name'),
      (value) => validators.name(value, 'Client name')
    ],
    contact_email: [validators.email],
    contact_phone: [(value) => validators.phone(value, 'Contact phone')],
    address: [
      (value) => validators.maxLength(value, 500, 'Address'),
      validators.address
    ]
  };

  // Function to validate the entire form
  const validateForm = () => {
    const sanitizedData = validate.sanitize(formData);
    const validationResult = validate.form(sanitizedData, clientValidationSchema);
    setFormErrors(validationResult.errors);
    return validationResult.isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {

    // Prevent default form submission behavior
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) return;


    // Submit form data to API
    try {

      // Sanitize data before sending, then call create or update based on isEditing
      const sanitizedData = validate.sanitize(formData);
      if (isEditing) {
        await clientsAPI.update(currentClient.client_id, sanitizedData);
      } else {
        await clientsAPI.create(sanitizedData);
      }

      // Call onSuccess callback to refresh client list and close form
      onSuccess();
    } catch (err) {

      // Handle API errors
      onError('Failed to ' + (isEditing ? 'update' : 'create') + ' client: ' + err.message);
    }
  };

  // Handle input changes and update form state
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Render the client form UI
  return (
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        <h1 className={styles.title}>
          {isEditing ? 'EDIT CLIENT' : 'CREATE CLIENT'}
        </h1>
        <p className={styles.subtitle}>
          {isEditing ? 'Update client information' : 'Add a new client to your system'}
        </p>

        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <span className={styles.errorMessage}>{error}</span>
              <button onClick={() => onError('')} className={styles.closeBtn}>×</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.clientForm}>
          <FormField
            type="text"
            field="client_name"
            placeholder="Client Name *"
            value={formData.client_name}
            onChange={handleInputChange}
            error={formErrors.client_name}
            required
          />
          
          <FormField
            type="email"
            field="contact_email"
            placeholder="Contact Email"
            value={formData.contact_email}
            onChange={handleInputChange}
            error={formErrors.contact_email}
          />
          
          <FormField
            type="tel"
            field="contact_phone"
            placeholder="Contact Phone"
            value={formData.contact_phone}
            onChange={handleInputChange}
            error={formErrors.contact_phone}
          />
          
          <FormField
            type="textarea"
            field="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            error={formErrors.address}
            rows="3"
          />
          
          <div className={styles.formActions}>
            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Saving...' : (isEditing ? 'Update Client' : 'Create Client')}
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

// Sub-component for individual form fields
const FormField = ({ type, field, placeholder, value, onChange, error, required, rows }) => (
  <div className={styles.formGroup}>
    {type === 'textarea' ? (
      <textarea
        id={field}
        name={field}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        rows={rows}
        className={`${styles.formTextarea} ${error ? styles.inputError : ''}`}
      />
    ) : (
      <input
        id={field}
        name={field}
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

export default ClientForm;