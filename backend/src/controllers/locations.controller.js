import locationsService from '../services/locations.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';

const locationsController = {
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      const { locations, pagination } = await locationsService.getAllPaginated(page, limit, search);

      const formatted = locations.map((loc) => ({
        ...loc,
        created_at: formatDate(loc.created_at)
      }));

      res.json(apiResponse.paginatedResponse(formatted, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const location = await locationsService.getById(req.params.id);
      if (!location) {
        return res.status(404).json(apiResponse.errorResponse('Location not found'));
      }
      const formatted = { ...location, created_at: formatDate(location.created_at) };
      res.json(apiResponse.successResponse(formatted, 'Location retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const newLocation = await locationsService.create(data);
      res.status(201).json(apiResponse.successResponse(newLocation, 'Location created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      const result = await locationsService.update(req.params.id, data);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Location not found'));
      }
      res.json(apiResponse.successResponse(null, 'Location updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const result = await locationsService.delete(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Location not found'));
      }
      res.json(apiResponse.successResponse(null, 'Location deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default locationsController;
