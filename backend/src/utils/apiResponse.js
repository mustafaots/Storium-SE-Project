/**
 * Standardized response format for all API endpoints
 * This keeps our responses consistent across the entire application
 */

// Success response template
const successResponse = (data, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Error response template
const errorResponse = (error, details = null) => {
  return {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  };
};

// Pagination response template
const paginatedResponse = (data, pagination) => {
  return {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString()
  };
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse
};