// API Response Utilities
// Path: backend/src/utils/apiResponse.js

const isExpressResponse = (maybeRes) =>
  !!maybeRes && typeof maybeRes.status === 'function' && typeof maybeRes.json === 'function';

/**
 * Success response helper.
 * Supports both:
 *  - successResponse(res, message, data?, statusCode?)  -> sends response
 *  - successResponse(data?, message?)                   -> returns payload
 */
export const successResponse = (arg1, arg2, arg3 = null, arg4 = 200) => {
  if (isExpressResponse(arg1)) {
    const res = arg1;
    const message = arg2;
    const data = arg3;
    const statusCode = arg4;
    const payload = successResponse(data, message);
    return res.status(statusCode).json(payload);
  }

  const data = arg1;
  const message = arg2 || 'Request successful';

  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return response;
};

/**
 * Error response helper.
 * Supports both:
 *  - errorResponse(res, message, error?, statusCode?) -> sends response
 *  - errorResponse(message, error?)                  -> returns payload
 */
export const errorResponse = (arg1, arg2 = null, arg3 = null, arg4 = 400) => {
  if (isExpressResponse(arg1)) {
    const res = arg1;
    const message = arg2;
    const error = arg3;
    const statusCode = arg4;
    const payload = errorResponse(message, error);
    return res.status(statusCode).json(payload);
  }

  const message = arg1 || 'Request failed';
  const error = arg2;

  const response = {
    success: false,
    message
  };

  if (error !== null && error !== undefined && process.env.NODE_ENV !== 'production') {
    response.error = error;
  }

  return response;
};

/**
 * Paginated success helper.
 * Supports both:
 *  - paginatedResponse(res, message, data, pagination, statusCode?) -> sends response
 *  - paginatedResponse(data, pagination, message?)                 -> returns payload
 */
export const paginatedResponse = (arg1, arg2, arg3 = 'Request successful', arg4 = null, arg5 = 200) => {
  if (isExpressResponse(arg1)) {
    const res = arg1;
    const message = arg2;
    const data = arg3;
    const pagination = arg4;
    const statusCode = arg5;
    const payload = paginatedResponse(data, pagination, message);
    return res.status(statusCode).json(payload);
  }

  const data = arg1;
  const pagination = arg2;
  const message = arg3 || 'Request successful';

  return {
    success: true,
    message,
    data,
    pagination
  };
};

// Default export for compatibility
export default {
  successResponse,
  errorResponse,
  paginatedResponse
};
