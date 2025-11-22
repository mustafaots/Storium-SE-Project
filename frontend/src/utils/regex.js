// universal regex patterns for the entire application

export const regexPatterns = {
  // Names: 2-100 chars, letters, spaces, hyphens, apostrophes
  name: /^[a-zA-ZÀ-ÿ\s'.-]{2,100}$/,
  
  // Email: standard email format
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  
  // Phone: international format
  phone: /^[\+]?[0-9\s\-\(\)]{10,20}$/,
  
  // Text: general text with reasonable length
  text: /^[\s\S]{0,500}$/,
  
  // Address: alphanumeric with common address characters
  address: /^[a-zA-Z0-9\s\.,'\-/#]{0,255}$/,
  
  // Numbers only
  numeric: /^\d+$/,
  
  // Decimal numbers
  decimal: /^\d+(\.\d{1,2})?$/,
  
  // URL
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  
  // Password: min 8 chars, 1 upper, 1 lower, 1 number
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  
  // Date: YYYY-MM-DD
  date: /^\d{4}-\d{2}-\d{2}$/,
  
  // Time: HH:MM (24-hour)
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // No HTML tags (basic prevention)
  noHtml: /^[^<>]*$/
};

// Universal regex test functions
export const regex = {
  // Test if value matches pattern
  test: (pattern, value) => {
    if (value === null || value === undefined) return false;
    const strValue = String(value).trim();
    if (strValue === '') return false;
    return regexPatterns[pattern].test(strValue);
  },
  
  // Test if value is empty (null, undefined, or empty string)
  isEmpty: (value) => {
    return value === null || value === undefined || String(value).trim() === '';
  },
  
  // Sanitize input - trim and remove extra spaces
  sanitize: (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().replace(/\s+/g, ' ');
  },
  
  // Extract numbers only from string
  extractNumbers: (value) => {
    if (!value) return '';
    return String(value).replace(/\D/g, '');
  },
  
  // Format phone number
  formatPhone: (phone) => {
    const numbers = regex.extractNumbers(phone);
    if (numbers.length === 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }
};

export default regex;