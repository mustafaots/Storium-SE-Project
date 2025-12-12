import racksService from '../services/racks.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';

const racksController = {
  getAll: async (req, res) => {
    try {
      const aisleId = req.params.aisleId;
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      const { racks, pagination } = await racksService.getAllPaginated(aisleId, page, limit, search);

      const formatted = racks.map((rack) => ({
        ...rack,
        created_at: formatDate(rack.created_at)
      }));

      res.json(apiResponse.paginatedResponse(formatted, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const rack = await racksService.getById(req.params.id);
      if (!rack) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }
      const formatted = { ...rack, created_at: formatDate(rack.created_at) };
      res.json(apiResponse.successResponse(formatted, 'Rack retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  create: async (req, res) => {
    try {
      const aisleId = req.params.aisleId;
      const data = req.body;
      const newRack = await racksService.create(aisleId, data);
      res.status(201).json(apiResponse.successResponse(newRack, 'Rack created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      const result = await racksService.update(req.params.id, data);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }
      res.json(apiResponse.successResponse(null, 'Rack updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const result = await racksService.delete(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }
      res.json(apiResponse.successResponse(null, 'Rack deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default racksController;
