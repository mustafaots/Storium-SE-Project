// backend/src/controllers/sources.controller.js
import sourcesService from '../services/sources.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatPhone, formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';

const sourcesController = {
  // List sources with pagination + search
  getAllSources: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      const { sources, pagination } = await sourcesService.getAllPaginated(page, limit, search);

      // Format data for response
      const formattedSources = sources.map(source => ({
        ...source,
        contact_phone: formatPhone(source.contact_phone),
        created_at: formatDate(source.created_at)
      }));

      res.json(apiResponse.paginatedResponse(formattedSources, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // Get a single source by ID
  getSourceById: async (req, res) => {
    try {
      const source = await sourcesService.getById(req.params.id);

      if (!source) {
        return res.status(404).json(apiResponse.errorResponse('Source not found'));
      }

      const formattedSource = {
        ...source,
        contact_phone: formatPhone(source.contact_phone),
        created_at: formatDate(source.created_at)
      };

      res.json(apiResponse.successResponse(formattedSource, 'Source retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // Create source
  createSource: async (req, res) => {
    try {
      const sourceData = req.body;
      const newSource = await sourcesService.create(sourceData);

      res.status(201).json(apiResponse.successResponse(newSource, 'Source created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  // Update source
  updateSource: async (req, res) => {
    try {
      const sourceData = req.body;
      const result = await sourcesService.update(req.params.id, sourceData);

      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Source not found'));
      }

      res.json(apiResponse.successResponse(null, 'Source updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  // Delete source
  deleteSource: async (req, res) => {
    try {
      const result = await sourcesService.delete(req.params.id);

      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Source not found'));
      }

      res.json(apiResponse.successResponse(null, 'Source deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default sourcesController;
