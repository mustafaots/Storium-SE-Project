// src/components/Layout/ProductLayout/ProductForm.jsx
import { useState, useEffect } from 'react';
import { productsAPI } from '../../../utils/productsAPI';
import styles from '../../../pages/Products/ProductsPage.module.css';

const ProductForm = ({ isEditing, currentProduct, loading, error, onSuccess, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image_url: '',
    unit: '',
    min_stock_level: 0,
    max_stock_level: 0,
    source_id: ''
  });

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const response = await productsAPI.getAllSuppliers();
        if (response && response.success) {
          setSuppliers(response.data || []);
        } else {
          setSuppliers([]);
        }
      } catch (err) {
        console.error('Failed to fetch suppliers:', err);
        setSuppliers([]);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Update form when currentProduct changes
  useEffect(() => {
    if (isEditing && currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        category: currentProduct.category || '',
        description: currentProduct.description || '',
        image_url: currentProduct.image_url || '',
        unit: currentProduct.unit || '',
        min_stock_level: currentProduct.min_stock_level ?? 0,
        max_stock_level: currentProduct.max_stock_level ?? 0,
        source_id: currentProduct.source_id ?? ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        image_url: '',
        unit: '',
        min_stock_level: 0,
        max_stock_level: 0,
        source_id: ''
      });
    }
    setFormErrors({});
  }, [currentProduct, isEditing]);

  // Validators
  const required = (v) => (v ? '' : 'This field is required');
  const minLength = (v, len, field) => (v && v.length >= len ? '' : `${field} must be at least ${len} characters`);
  const positiveNumber = (v) => {
    if (v === '' || v === null || v === undefined) return '';
    return Number(v) >= 0 ? '' : 'Must be a positive number';
  };

  // Validation schema
  const productValidationSchema = {
    name: [required, (v) => minLength(v, 2, 'Product name')],
    category: [required],
    unit: [required],
    min_stock_level: [positiveNumber],
    max_stock_level: [positiveNumber],
    source_id: []
  };

  // Form validation (includes cross-field check)
  const validateForm = () => {
    const errors = {};

    // Run field-level validators first
    Object.keys(productValidationSchema).forEach((field) => {
      const rules = productValidationSchema[field];
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

    // --- Cross-field validation: min_stock_level < max_stock_level ---
    // Only perform this check if both values are present and numeric.
    const rawMin = formData.min_stock_level;
    const rawMax = formData.max_stock_level;

    const minNum = rawMin === '' || rawMin === null || rawMin === undefined ? null : Number(rawMin);
    const maxNum = rawMax === '' || rawMax === null || rawMax === undefined ? null : Number(rawMax);

    if (minNum !== null && maxNum !== null && !Number.isNaN(minNum) && !Number.isNaN(maxNum)) {
      if (minNum >= maxNum) {
        // Attach the error to min_stock_level (you may prefer max_stock_level or both)
        errors.min_stock_level = 'Minimum stock level must be less than maximum stock level';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Prepare data - convert to proper types
      const dataToSend = {
        name: String(formData.name).trim(),
        category: String(formData.category).trim(),
        description: String(formData.description || '').trim(),
        image_url: String(formData.image_url || '').trim(),
        unit: String(formData.unit).trim(),
        min_stock_level: formData.min_stock_level !== '' && formData.min_stock_level !== null && formData.min_stock_level !== undefined
          ? parseInt(formData.min_stock_level, 10)
          : 0,
        max_stock_level: formData.max_stock_level !== '' && formData.max_stock_level !== null && formData.max_stock_level !== undefined
          ? parseInt(formData.max_stock_level, 10)
          : 0,
        source_id: formData.source_id ? parseInt(formData.source_id, 10) : null
      };

      // Defensive check (double-check numeric relation)
      if (!Number.isNaN(dataToSend.min_stock_level) && !Number.isNaN(dataToSend.max_stock_level)) {
        if (dataToSend.min_stock_level >= dataToSend.max_stock_level) {
          setFormErrors(prev => ({ ...prev, min_stock_level: 'Minimum stock level must be less than maximum stock level' }));
          setSubmitting(false);
          return;
        }
      }

      if (isEditing && currentProduct?.product_id) {
        const resp = await productsAPI.update(currentProduct.product_id, dataToSend);
        if (!resp || !resp.success) throw new Error(resp?.error || 'Update failed');
      } else {
        const resp = await productsAPI.create(dataToSend);
        if (!resp || !resp.success) throw new Error(resp?.error || 'Create failed');
      }

      onSuccess();
    } catch (err) {
      onError('Failed to ' + (isEditing ? 'update' : 'create') + ' product: ' + (err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        <h1 className={styles.title}>{isEditing ? 'EDIT PRODUCT' : 'CREATE PRODUCT'}</h1>
        <p className={styles.subtitle}>{isEditing ? 'Update product details' : 'Add a new product'}</p>

        {error && (
          <div className={styles.errorAlert}>
            <span>{error}</span>
            <button onClick={() => onError('')}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.clientForm}>
          <FormField
            type="text"
            field="name"
            placeholder="Product Name *"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            required
          />

          <FormField
            type="text"
            field="category"
            placeholder="Category *"
            value={formData.category}
            onChange={handleChange}
            error={formErrors.category}
            required
          />

          <FormField
            type="text"
            field="unit"
            placeholder="Unit (e.g., kg, liters, pieces) *"
            value={formData.unit}
            onChange={handleChange}
            error={formErrors.unit}
            required
          />

          <FormField
            type="number"
            field="min_stock_level"
            placeholder="Minimum Stock Level"
            value={formData.min_stock_level}
            onChange={handleChange}
            error={formErrors.min_stock_level}
          />

          <FormField
            type="number"
            field="max_stock_level"
            placeholder="Maximum Stock Level"
            value={formData.max_stock_level}
            onChange={handleChange}
            error={formErrors.max_stock_level}
          />

          {/* Supplier Dropdown */}
          <div className={styles.formGroup}>
            <select
              value={formData.source_id}
              onChange={(e) => handleChange('source_id', e.target.value)}
              className={`${styles.formInput} ${formErrors.source_id ? styles.inputError : ''}`}
              disabled={loadingSuppliers}
            >
              <option value="">select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.source_id} value={supplier.source_id}>
                  {supplier.source_name}
                </option>
              ))}
            </select>
            {loadingSuppliers && <span className={styles.loadingText}>Loading suppliers...</span>}
            {formErrors.source_id && <span className={styles.errorText}>{formErrors.source_id}</span>}
          </div>

          <FormField
            type="textarea"
            field="description"
            placeholder="Description (Optional)"
            value={formData.description}
            onChange={handleChange}
            error={formErrors.description}
          />

          <FormField
            type="text"
            field="image_url"
            placeholder="Image URL (Optional)"
            value={formData.image_url}
            onChange={handleChange}
            error={formErrors.image_url}
          />

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={loading || submitting || loadingSuppliers}
              className={styles.primaryButton}
            >
              {(loading || submitting) ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
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

const FormField = ({ type, field, placeholder, value, onChange, error, required }) => (
  <div className={styles.formGroup}>
    {type === 'textarea' ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        rows={3}
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

export default ProductForm;
