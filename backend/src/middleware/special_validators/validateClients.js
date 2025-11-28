import { validateEmail, validatePhone } from '../general_validators.js';

// Middleware to validate client data
const validateClients = (req, res, next) => {
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

  next(); // next controller/middleware
};

export { validateClients };