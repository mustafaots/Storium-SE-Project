import aislesService from '../services/aisles.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';

const aislesController = {
  getAll: async (req, res) => {
    try {
      const depotId = req.params.depotId;
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      const { aisles, pagination } = await aislesService.getAllPaginated(depotId, page, limit, search);

      const formatted = aisles.map((a) => ({
        ...a,
        created_at: formatDate(a.created_at)
      }));

      res.json(apiResponse.paginatedResponse(formatted, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const aisle = await aislesService.getById(req.params.id);
      if (!aisle) {
        return res.status(404).json(apiResponse.errorResponse('Aisle not found'));
      }
      const formatted = { ...aisle, created_at: formatDate(aisle.created_at) };
      res.json(apiResponse.successResponse(formatted, 'Aisle retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  create: async (req, res) => {
    try {
      const depotId = req.params.depotId;
      const data = req.body;
      const newAisle = await aislesService.create(depotId, data);
      res.status(201).json(apiResponse.successResponse(newAisle, 'Aisle created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      const result = await aislesService.update(req.params.id, data);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Aisle not found'));
      }
      res.json(apiResponse.successResponse(null, 'Aisle updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const result = await aislesService.delete(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Aisle not found'));
      }
      res.json(apiResponse.successResponse(null, 'Aisle deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default aislesController;
