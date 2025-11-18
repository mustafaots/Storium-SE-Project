/**
 * Logs all incoming requests to help with debugging
 * This is like having a security camera for your API
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Log request body for POST/PUT requests (but not passwords)
  if (['POST', 'PUT'].includes(req.method) && req.body) {
    const logBody = { ...req.body };
    // Don't log sensitive fields (when you add them later)
    if (logBody.password) logBody.password = '***';
    if (logBody.token) logBody.token = '***';
    
    console.log('   Body:', logBody);
  }
  
  next(); // Move to the next middleware
};

module.exports = requestLogger;