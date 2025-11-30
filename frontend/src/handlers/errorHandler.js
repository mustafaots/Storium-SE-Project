/**
 * Frontend error handling utilities
 */

const errorHandler = {
  handleApiError: (error, customMessage = 'An error occurred') => {
    console.error('API Error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to server. Please try again later.';
    }
    
    return error.message || customMessage;
  },
};

export default errorHandler;

// Higher-order function for API error handling
export const withErrorHandling = (apiFunction) => {
  return async (...args) => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      throw new Error(errorHandler.handleApiError(error));
    }
  };
};