// backend/src/middleware/special_validators/validateSources.js

import apiResponse from '../../utils/apiResponse.js';
import { validateEmail, validatePhone } from '../general_validators.js';

const validateSources = (req, res, next) => {
  const { 
    source_name, 
    contact_email, 
    contact_phone, 
    address, 
    coordinates, 
    rating, 
    is_active 
  } = req.body;

  const errors = [];

  // source_name: required, string, 2-255 chars
  if (!source_name || typeof source_name !== 'string' || source_name.trim().length < 2 || source_name.trim().length > 255) {
    errors.push('Source name is required and must be between 2 and 255 characters.');
  }

  // contact_email: optional, validate format
  if (contact_email !== undefined && contact_email !== null && contact_email !== '') {
    if (!validateEmail(contact_email)) {
      errors.push('Invalid email format.');
    }
  }

  // contact_phone: optional, max 50 chars, allowed characters
  if (contact_phone !== undefined && contact_phone !== null && contact_phone !== '') {
    if (!validatePhone(contact_phone)) {
      errors.push('Invalid phone number format.');
    }
  }

  // address: optional, max 500 chars
  if (address !== undefined && address !== null && String(address).trim().length > 500) {
    errors.push('Address must not exceed 500 characters.');
  }

  // coordinates: optional, max 255 chars
  if (coordinates !== undefined && coordinates !== null && String(coordinates).trim().length > 255) {
    errors.push('Coordinates must not exceed 255 characters.');
  }

  // rating: optional, numeric 0-5
  if (rating !== undefined && rating !== null && rating !== '') {
    const num = Number(rating);
    if (isNaN(num)) {
      errors.push('Rating must be a number.');
    } else if (num < 0 || num > 5) {
      errors.push('Rating must be between 0 and 5.');
    }
  }

  // is_active: optional, boolean-like
  if (is_active !== undefined && is_active !== null && is_active !== '') {
    const validBooleans = [true, false, 'true', 'false', 1, 0, '1', '0'];
    if (!validBooleans.includes(is_active)) {
      errors.push('is_active must be a boolean value.');
    }
  }

  // If there are validation errors, return
  if (errors.length > 0) {
    return res.status(400).json(apiResponse.errorResponse('Validation failed', errors));
  }

  next();
};

export default validateSources;
