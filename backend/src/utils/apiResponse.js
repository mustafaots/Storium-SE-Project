// API Response Utilities
// Path: backend/src/utils/apiResponse.js

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} error - Error details (optional)
 * @param {number} statusCode - HTTP status code (default: 400)
 */
export const errorResponse = (res, message, error = null, statusCode = 400) => {
  const response = {
    success: false,
    message
  };
  
  if (error !== null && process.env.NODE_ENV !== 'production') {
    response.error = error;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Array} data - Array of results
 * @param {Object} pagination - Pagination info
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const paginatedResponse = (res, message, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
};

// Default export for compatibility
export default {
  successResponse,
  errorResponse,
  paginatedResponse
};
