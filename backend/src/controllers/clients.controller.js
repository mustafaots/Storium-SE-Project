import clientsService from '../services/clients.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatPhone, formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';

const clientsController = {
  // FIXED: Get all clients with pagination
  getAllClients: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      
      // FIX: Call the paginated service method
      const { clients, pagination } = await clientsService.getAllPaginated(page, limit);
      
      // Format data for response
      const formattedClients = clients.map(client => ({
        ...client,
        contact_phone: formatPhone(client.contact_phone),
        created_at: formatDate(client.created_at)
      }));
      
      // FIX: Use paginatedResponse instead of successResponse
      res.json(apiResponse.paginatedResponse(formattedClients, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // Keep existing methods unchanged
  getClientById: async (req, res) => {
    try {
      const client = await clientsService.getById(req.params.id);
      
      if (!client) {
        return res.status(404).json(apiResponse.errorResponse('Client not found'));
      }
      
      const formattedClient = {
        ...client,
        contact_phone: formatPhone(client.contact_phone),
        created_at: formatDate(client.created_at)
      };
      
      res.json(apiResponse.successResponse(formattedClient, 'Client retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  createClient: async (req, res) => {
    try {
      const clientData = req.body;
      const newClient = await clientsService.create(clientData);
      
      res.status(201).json(apiResponse.successResponse(newClient, 'Client created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  updateClient: async (req, res) => {
    try {
      const clientData = req.body;
      const result = await clientsService.update(req.params.id, clientData);
      
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Client not found'));
      }
      
      res.json(apiResponse.successResponse(null, 'Client updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  deleteClient: async (req, res) => {
    try {
      const result = await clientsService.delete(req.params.id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Client not found'));
      }
      
      res.json(apiResponse.successResponse(null, 'Client deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default clientsController;