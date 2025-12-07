import apiResponse from '../utils/apiResponse.js';

/**
 * Global error handling middleware
 * This catches any errors that happen in our routes and sends nice error messages
 * 
 * Remark: use it as the last middleware to be called on the server
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error caught by middleware:', err);

  let statusCode = err.status || 500;
  let message = 'Something went wrong on our end';
  let details = process.env.NODE_ENV === 'development' ? err.message : undefined;

  // MySQL database errors
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    message = 'Database connection failed - check your credentials';
  } else if (err.code === 'ER_NO_SUCH_TABLE') {
    message = 'Database table missing - run the schema setup';
  } else if (err.code === 'ER_DUP_ENTRY') {
    message = 'Duplicate entry - this record already exists';
    statusCode = 409;
  } else if (err.code === 'ER_BAD_FIELD_ERROR') {
    message = 'Invalid field in request';
    statusCode = 400;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    message = 'Data validation failed';
    details = err.details || err.message;
    statusCode = 400;
  }

  // Send the error response using apiResponse
  res.status(statusCode).json(apiResponse.errorResponse(message, details));
};

export default errorHandler;