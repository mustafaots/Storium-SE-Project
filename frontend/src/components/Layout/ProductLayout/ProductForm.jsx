// src/components/Layout/ProductLayout/ProductForm.jsx
import { useState, useEffect, useRef } from 'react';
import { productsAPI } from '../../../utils/productsAPI';
import styles from '../../../pages/Products/ProductsPage.module.css';

// Measurement units for product unit selection
const MEASUREMENT_UNITS = ['pcs', 'kg', 'g', 'lb', 'oz', 'liters', 'ml', 'boxes', 'pallets'];

// Rate temporal units
const RATE_UNITS = ['/min', '/hour', '/day', '/week', '/month'];

// Product categories
const PRODUCT_CATEGORIES = [
  'Electronics',
  'Food',
  'Clothing',
  'Medicine',
  'Furniture',
  'Automotive',
  'Chemicals',
  'Raw Materials',
  'Office Supplies',
  'Tools & Equipment',
  'Packaging',
  'Textiles',
  'Cosmetics',
  'Beverages',
  'Hardware',
  'Other'
];

const ProductForm = ({ isEditing, currentProduct, loading, error, onSuccess, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    unit: '',
    min_stock_level: '',
    max_stock_level: '',
    rate: '',
    rate_unit: '',
    source_id: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
        console.log('Suppliers response:', response);
        if (response && response.success) {
          setSuppliers(response.data || []);
        } else {
          console.error('Failed to load suppliers:', response);
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
        unit: currentProduct.unit || '',
        min_stock_level: currentProduct.min_stock_level ?? 0,
        max_stock_level: currentProduct.max_stock_level ?? 0,
        rate: currentProduct.rate != null ? String(currentProduct.rate) : '',
        rate_unit: currentProduct.rate_unit || '',
        source_id: currentProduct.source_id ?? ''
      });
      // Set image preview if product has an image
      if (currentProduct.image_data) {
        setImagePreview(`data:${currentProduct.image_mime_type || 'image/png'};base64,${currentProduct.image_data}`);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        unit: '',
        min_stock_level: '',
        max_stock_level: '',
        rate: '',
        rate_unit: '',
        source_id: ''
      });
      setImageFile(null);
      setImagePreview(null);
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

  // Rate validators (optional fields)
  const positiveNumberIfProvided = (v) => {
    if (v === '' || v === null || v === undefined) return '';
    const num = Number(v);
    if (Number.isNaN(num)) return 'Rate must be a number';
    return num > 0 ? '' : 'Rate must be a positive number';
  };

  // Validation schema
  const productValidationSchema = {
    name: [required, (v) => minLength(v, 2, 'Product name')],
    category: [required],
    unit: [required],
    min_stock_level: [positiveNumber],
    max_stock_level: [positiveNumber],
    rate: [positiveNumberIfProvided],
    rate_unit: [],
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
      // Prepare FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', String(formData.name).trim());
      formDataToSend.append('category', String(formData.category).trim());
      formDataToSend.append('description', String(formData.description || '').trim());
      formDataToSend.append('unit', String(formData.unit).trim());
      formDataToSend.append('min_stock_level', formData.min_stock_level !== '' && formData.min_stock_level !== null && formData.min_stock_level !== undefined
        ? parseInt(formData.min_stock_level, 10)
        : 0);
      formDataToSend.append('max_stock_level', formData.max_stock_level !== '' && formData.max_stock_level !== null && formData.max_stock_level !== undefined
        ? parseInt(formData.max_stock_level, 10)
        : 0);
      formDataToSend.append('rate', formData.rate !== '' ? Number(formData.rate) : '');
      formDataToSend.append('rate_unit', formData.rate_unit ? String(formData.rate_unit).trim() : '');
      formDataToSend.append('source_id', formData.source_id ? parseInt(formData.source_id, 10) : '');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Defensive check (double-check numeric relation)
      const minVal = parseInt(formData.min_stock_level, 10) || 0;
      const maxVal = parseInt(formData.max_stock_level, 10) || 0;
      if (minVal >= maxVal) {
        setFormErrors(prev => ({ ...prev, min_stock_level: 'Minimum stock level must be less than maximum stock level' }));
        setSubmitting(false);
        return;
      }

      if (isEditing && currentProduct?.product_id) {
        const resp = await productsAPI.update(currentProduct.product_id, formDataToSend);
        if (!resp || !resp.success) throw new Error(resp?.error || 'Update failed');
      } else {
        const resp = await productsAPI.create(formDataToSend);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

          {/* Category Dropdown */}
          <div className={styles.formGroup}>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`${styles.formInput} ${formErrors.category ? styles.inputError : ''}`}
              required
            >
              <option value="">Select Category *</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {formErrors.category && <span className={styles.errorText}>{formErrors.category}</span>}
          </div>

          {/* Unit Dropdown */}
          <div className={styles.formGroup}>
            <select
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className={`${styles.formInput} ${formErrors.unit ? styles.inputError : ''}`}
              required
            >
              <option value="">Select Unit *</option>
              {MEASUREMENT_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {formErrors.unit && <span className={styles.errorText}>{formErrors.unit}</span>}
          </div>

          <FormField
            type="number"
            field="min_stock_level"
            placeholder="Minimum Stock Level (e.g., 10)"
            value={formData.min_stock_level}
            onChange={handleChange}
            error={formErrors.min_stock_level}
          />

          <FormField
            type="number"
            field="max_stock_level"
            placeholder="Maximum Stock Level (e.g., 100)"
            value={formData.max_stock_level}
            onChange={handleChange}
            error={formErrors.max_stock_level}
          />

          {/* Rate fields */}
          <FormField
            type="number"
            field="rate"
            placeholder="Rate (positive number, optional)"
            value={formData.rate}
            onChange={handleChange}
            error={formErrors.rate}
          />

          {/* Rate Unit Dropdown */}
          <div className={styles.formGroup}>
            <select
              value={formData.rate_unit}
              onChange={(e) => handleChange('rate_unit', e.target.value)}
              className={`${styles.formInput} ${formErrors.rate_unit ? styles.inputError : ''}`}
            >
              <option value="">Select Rate Unit (Optional)</option>
              {RATE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {formErrors.rate_unit && <span className={styles.errorText}>{formErrors.rate_unit}</span>}
          </div>

          {/* Supplier Dropdown */}
          <div className={styles.formGroup}>
            <select
              value={formData.source_id}
              onChange={(e) => handleChange('source_id', e.target.value)}
              className={`${styles.formInput} ${formErrors.source_id ? styles.inputError : ''}`}
              disabled={loadingSuppliers}
            >
              <option value="">{loadingSuppliers ? 'Loading suppliers...' : 'Select Supplier (Optional)'}</option>
              {suppliers.map((supplier) => (
                <option key={supplier.source_id} value={supplier.source_id}>
                  {supplier.source_name}
                </option>
              ))}
            </select>
            {!loadingSuppliers && suppliers.length === 0 && (
              <span className={styles.hintText}>No suppliers available. Add suppliers in the Sources page.</span>
            )}
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

          {/* Image Upload */}
          <div className={styles.formGroup}>
            <label className={styles.imageUploadLabel}>Product Image</label>
            <div className={styles.imageUploadContainer}>
              {imagePreview ? (
                <div className={styles.imagePreviewWrapper}>
                  <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                  <button type="button" onClick={handleRemoveImage} className={styles.removeImageBtn}>×</button>
                </div>
              ) : (
                <div 
                  className={styles.imageUploadPlaceholder}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>Click to upload image</span>
                  <span className={styles.imageHint}>JPEG, PNG, GIF, WebP (max 5MB)</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className={styles.hiddenFileInput}
              />
            </div>
            {formErrors.image && <span className={styles.errorText}>{formErrors.image}</span>}
          </div>

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
