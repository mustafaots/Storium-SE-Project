import apiResponse from '../utils/apiResponse.js';

/**
 * Handles requests to routes that don't exist
 * This is like a "404 Page Not Found" for your API
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    apiResponse.errorResponse(`Route not found: ${req.method} ${req.originalUrl}`)
  );
};

export default notFoundHandler;