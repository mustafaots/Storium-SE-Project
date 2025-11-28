// src/utils/productValidators.js
import { validators, validate } from './validators'; // assumes you already have src/utils/validators.js

export const productValidationSchema = {
  name: [
    validators.required,
    (v) => validators.minLength(v, 2, 'Product name'),
    (v) => validators.maxLength(v, 255, 'Product name')
  ],
  sku: [
    // optional
    (v) => validators.maxLength(v, 64, 'SKU')
  ],
  category: [
    (v) => validators.maxLength(v, 100, 'Category')
  ],
  unit: [
    (v) => validators.maxLength(v, 50, 'Unit')
  ],
  min_stock_level: [
    validators.required,
    validators.numeric
  ],
  max_stock_level: [
    validators.required,
    validators.numeric
  ],
  description: [
    (v) => validators.maxLength(v, 2000, 'Description'),
    validators.noHtml
  ],
  image_url: [
    (v) => validators.maxLength(v, 500, 'Image URL'),
    validators.url
  ]
};

export const validateProduct = (formData) => {
  const sanitized = validate && typeof validate.sanitize === 'function' ? validate.sanitize(formData) : formData;
  return validate.form(sanitized, productValidationSchema);
};

export default {
  productValidationSchema,
  validateProduct
};
