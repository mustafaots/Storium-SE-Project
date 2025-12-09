import apiResponse from '../../utils/apiResponse.js';

const validateProducts = (req, res, next) => {
  const { name, unit, min_stock_level, max_stock_level } = req.body;
  const errors = [];

  // Required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Product name is required and must be a non-empty string.');
  }

  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.push('Unit is required and must be a non-empty string.');
  }

  // Optional numeric fields
  if (min_stock_level !== undefined && isNaN(Number(min_stock_level))) {
    errors.push('min_stock_level must be a number if provided.');
  }

  if (max_stock_level !== undefined && isNaN(Number(max_stock_level))) {
    errors.push('max_stock_level must be a number if provided.');
  }

  if (errors.length > 0) {
    return res.status(400).json(apiResponse.errorResponse('Validation failed', errors));
  }

  next();
};

export default validateProducts;
