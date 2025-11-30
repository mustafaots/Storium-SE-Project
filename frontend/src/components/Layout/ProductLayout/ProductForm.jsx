// src/components/Layout/ProductLayout/ProductForm.js
import { useState, useEffect } from 'react';
import { productsAPI } from '../../../utils/productsAPI';
import { validators, validate } from '../../../utils/validators';
import styles from '../../../pages/Products/ProductsPage.module.css';

const ProductForm = ({ isEditing, currentProduct, loading, error, onSuccess, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    supplier: '',
    total_stock: '',
    min_stock_level: '',
    max_stock_level: '',
    description: '',
    image_url: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Update form when currentProduct changes
  useEffect(() => {
    if (isEditing && currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        category: currentProduct.category || '',
        unit: currentProduct.unit || '',
        supplier: currentProduct.supplier || '',
        total_stock: currentProduct.total_stock || currentProduct.total || '',
        min_stock_level: currentProduct.min_stock_level || '',
        max_stock_level: currentProduct.max_stock_level || '',
        description: currentProduct.description || '',
        image_url: currentProduct.image_url || ''
      });
      setImageError(false);
    } else {
      setFormData({
        name: '',
        category: '',
        unit: '',
        supplier: '',
        total_stock: '',
        min_stock_level: '',
        max_stock_level: '',
        description: '',
        image_url: ''
      });
      setImageError(false);
    }
    setFormErrors({});
  }, [currentProduct, isEditing]);

  // Validation schema
  const productValidationSchema = {
    name: [validators.required, (v) => validators.minLength(v, 2, 'Product name')],
    category: [validators.required],
    unit: [validators.required],
    supplier: [],
    total_stock: [validators.numeric],
    min_stock_level: [validators.numeric],
    max_stock_level: [validators.numeric],
    description: [],
    image_url: [validators.url]
  };

  const validateForm = () => {
    const sanitized = validate.sanitize(formData);
    const { isValid, errors } = validate.form(sanitized, productValidationSchema);
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
      
      if (isEditing && currentProduct?.product_id) {
        await productsAPI.update(currentProduct.product_id, sanitized);
      } else {
        await productsAPI.create(sanitized);
      }
      
      onSuccess();
    } catch (err) {
      onError('Failed to ' + (isEditing ? 'update' : 'create') + ' product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Reset image error when URL changes
    if (field === 'image_url') {
      setImageError(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        {/* Product Image at the top */}
        {formData.image_url && (
          <div className={styles.productImageContainer}>
            {!imageError ? (
              <img 
                src={formData.image_url} 
                alt={formData.name || 'Product'} 
                className={styles.productImage}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📦</span>
                <p>Image failed to load</p>
              </div>
            )}
          </div>
        )}

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
            field="supplier" 
            placeholder="Supplier Name (Optional)" 
            value={formData.supplier} 
            onChange={handleChange} 
            error={formErrors.supplier} 
          />
          
          <FormField 
            type="text" 
            field="unit" 
            placeholder="Unit (pcs, kg, liters, etc.) *" 
            value={formData.unit} 
            onChange={handleChange} 
            error={formErrors.unit} 
            required 
          />
          
          <FormField 
            type="number" 
            field="total_stock" 
            placeholder="Total Stock (e.g., 100)" 
            value={formData.total_stock} 
            onChange={handleChange} 
            error={formErrors.total_stock} 
          />
          
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
            placeholder="Maximum Stock Level (e.g., 500)" 
            value={formData.max_stock_level} 
            onChange={handleChange} 
            error={formErrors.max_stock_level} 
          />

          <FormField 
            type="textarea" 
            field="description" 
            placeholder="Product Description (Optional)" 
            value={formData.description} 
            onChange={handleChange} 
            error={formErrors.description} 
            rows={3} 
          />
          
          <FormField 
            type="text" 
            field="image_url" 
            placeholder="Image URL (https://...)" 
            value={formData.image_url} 
            onChange={handleChange} 
            error={formErrors.image_url} 
          />

          <div className={styles.formActions}>
            <button 
              type="submit" 
              disabled={loading || submitting} 
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

const FormField = ({ type, field, placeholder, value, onChange, error, required, rows }) => (
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
        className={`${styles.formInput} ${error ? styles.inputError : ''}`} 
      />
    )}
    {error && <span className={styles.errorText}>{error}</span>}
  </div>
);

export default ProductForm;