/**
 * Common database operations used across multiple models
 * This prevents code duplication and makes models cleaner
 */

// Build WHERE clause for search queries
const buildSearchConditions = (searchFields, searchTerm) => {
  if (!searchTerm) return { conditions: '', params: [] };

  const conditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
  const params = searchFields.map(() => `%${searchTerm}%`);
  
  return { conditions, params };
};

// Build pagination parameters
const buildPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

// Handle database errors consistently
const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  
  // Return user-friendly error messages
  if (error.code === 'ER_DUP_ENTRY') {
    throw new Error('This record already exists');
  }
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    throw new Error('Referenced record does not exist');
  }
  if (error.code === 'ER_DATA_TOO_LONG') {
    throw new Error('Data too long for field');
  }
  
  throw new Error('Database operation failed');
};

module.exports = {
  buildSearchConditions,
  buildPagination,
  handleDatabaseError
};