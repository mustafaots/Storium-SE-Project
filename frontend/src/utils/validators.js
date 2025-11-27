// validators for form inputs and data validation using regex patterns

import { regex, regexPatterns } from './regex.js';

// Universal validation functions
export const validators = {
  // Required field
  required: (value, fieldName = 'This field') => {
    if (regex.isEmpty(value)) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Minimum length
  minLength: (value, min, fieldName = 'This field') => {
    if (!regex.isEmpty(value) && String(value).length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  // Maximum length
  maxLength: (value, max, fieldName = 'This field') => {
    if (!regex.isEmpty(value) && String(value).length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },

  // Email format
  email: (value, fieldName = 'Email') => {
    if (!regex.isEmpty(value) && !regex.test('email', value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  // Phone format
  phone: (value, fieldName = 'Phone') => {
    if (!regex.isEmpty(value) && !regex.test('phone', value)) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },

  // Name format
  name: (value, fieldName = 'Name') => {
    if (!regex.isEmpty(value) && !regex.test('name', value)) {
      return `${fieldName} must be between 2-100 characters and contain only letters, spaces, hyphens, and apostrophes`;
    }
    return null;
  },

  // Address format
  address: (value, fieldName = 'Address') => {
    if (!regex.isEmpty(value) && !regex.test('address', value)) {
      return `${fieldName} contains invalid characters or is too long`;
    }
    return null;
  },

  // Numeric only
  numeric: (value, fieldName = 'This field') => {
    if (!regex.isEmpty(value) && !regex.test('numeric', value)) {
      return `${fieldName} must contain only numbers`;
    }
    return null;
  },

  // Decimal number
  decimal: (value, fieldName = 'This field') => {
    if (!regex.isEmpty(value) && !regex.test('decimal', value)) {
      return `${fieldName} must be a valid decimal number`;
    }
    return null;
  },

  // URL format
  url: (value, fieldName = 'URL') => {
    if (!regex.isEmpty(value) && !regex.test('url', value)) {
      return `${fieldName} must be a valid web address`;
    }
    return null;
  },

  // No HTML tags
  noHtml: (value, fieldName = 'This field') => {
    if (!regex.isEmpty(value) && !regex.test('noHtml', value)) {
      return `${fieldName} contains invalid characters`;
    }
    return null;
  }
};

// Validation helper functions
export const validate = {
  // Validate a single field with multiple rules
  field: (value, rules, fieldName = '') => {
    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) return error;
    }
    return null;
  },

  // Validate multiple fields at once
  form: (formData, validationSchema) => {
    const errors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const value = formData[fieldName];
      const rules = validationSchema[fieldName];
      
      const error = validate.field(value, rules, fieldName);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
  },

  // Sanitize form data
  sanitize: (formData) => {
    const sanitized = {};
    Object.keys(formData).forEach(key => {
      sanitized[key] = regex.sanitize(formData[key]);
    });
    return sanitized;
  }
};

export default {
  validators,
  validate,
  regex
};