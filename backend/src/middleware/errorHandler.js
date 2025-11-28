/**
 * Global error handling middleware
 * This catches any errors that happen in our routes and sends nice error messages
 * 
 * Remark: use it as the last middleware to be called on the server
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error caught by middleware:', err);

  // Default error response
  let error = {
    success: false,
    error: 'Something went wrong on our end',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  };

  // MySQL database errors
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    error.error = 'Database connection failed - check your credentials';
  } else if (err.code === 'ER_NO_SUCH_TABLE') {
    error.error = 'Database table missing - run the schema setup';
  } else if (err.code === 'ER_DUP_ENTRY') {
    error.error = 'Duplicate entry - this record already exists';
  } else if (err.code === 'ER_BAD_FIELD_ERROR') {
    error.error = 'Invalid field in request';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.error = 'Data validation failed';
    error.details = err.details || err.message;
  }

  // Send the error response
  res.status(err.status || 500).json(error);
};

export { errorHandler };