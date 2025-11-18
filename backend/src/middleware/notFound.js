/**
 * Handles requests to routes that don't exist
 * This is like a "404 Page Not Found" for your API
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    message: 'Check the API documentation for available endpoints'
  });
};

module.exports = notFoundHandler;