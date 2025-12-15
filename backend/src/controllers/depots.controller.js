import depotsService from '../services/depots.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';

const depotsController = {
  getAll: async (req, res) => {
    try {
      const locationId = req.params.locationId;
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      const { depots, pagination } = await depotsService.getAllPaginated(locationId, page, limit, search);

      const formatted = depots.map((d) => ({
        ...d,
        created_at: formatDate(d.created_at)
      }));

      res.json(apiResponse.paginatedResponse(formatted, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const depot = await depotsService.getById(req.params.id);
      if (!depot) {
        return res.status(404).json(apiResponse.errorResponse('Depot not found'));
      }
      const formatted = { ...depot, created_at: formatDate(depot.created_at) };
      res.json(apiResponse.successResponse(formatted, 'Depot retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  create: async (req, res) => {
    try {
      const locationId = req.params.locationId;
      const data = req.body;
      const newDepot = await depotsService.create(locationId, data);
      res.status(201).json(apiResponse.successResponse(newDepot, 'Depot created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      const result = await depotsService.update(req.params.id, data);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Depot not found'));
      }
      res.json(apiResponse.successResponse(null, 'Depot updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const result = await depotsService.delete(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Depot not found'));
      }
      res.json(apiResponse.successResponse(null, 'Depot deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default depotsController;
