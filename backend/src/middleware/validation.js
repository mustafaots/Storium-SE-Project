/**
 * Basic validation for common data types
 * Prevents garbage data from getting into our database
 */

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic international format)
const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Middleware to validate client data
const validateClient = (req, res, next) => {
  const { client_name, contact_email, contact_phone } = req.body;

  const errors = [];

  // Check required fields
  if (!client_name || client_name.trim().length === 0) {
    errors.push('Client name is required');
  }

  if (client_name && client_name.trim().length > 255) {
    errors.push('Client name is too long (max 255 characters)');
  }

  // Validate email if provided
  if (contact_email && !validateEmail(contact_email)) {
    errors.push('Invalid email format');
  }

  // Validate phone if provided
  if (contact_phone && !validatePhone(contact_phone)) {
    errors.push('Invalid phone number format');
  }

  // If there are errors, stop here
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next(); // All good, move along
};

// Middleware to validate product data
const validateProduct = (req, res, next) => {
  const { name, unit, min_stock_level, max_stock_level } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!unit || unit.trim().length === 0) {
    errors.push('Unit type is required (pcs, kg, liters, etc.)');
  }

  if (min_stock_level !== undefined && min_stock_level < 0) {
    errors.push('Minimum stock level cannot be negative');
  }

  if (max_stock_level !== undefined && max_stock_level < 0) {
    errors.push('Maximum stock level cannot be negative');
  }

  if (min_stock_level !== undefined && max_stock_level !== undefined && min_stock_level > max_stock_level) {
    errors.push('Minimum stock level cannot be greater than maximum stock level');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateClient,
  validateProduct,
  validateEmail,
  validatePhone
};