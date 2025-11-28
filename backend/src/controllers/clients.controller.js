import clientsService from '../services/clients.service.js';
import apiResponse from '../utils/apiResponse.js'; // Import default
import { formatPhone, formatDate } from '../utils/formatters.js'; // Fixed formatters import

const clientsController = {
  // Get all clients
  getAllClients: async (req, res) => {
    try {
      const clients = await clientsService.getAll();
      
      // Format data for response
      const formattedClients = clients.map(client => ({
        ...client,
        contact_phone: formatPhone(client.contact_phone),
        created_at: formatDate(client.created_at)
      }));
      
      res.json(apiResponse.successResponse(formattedClients, 'Clients retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // Get client by ID
  getClientById: async (req, res) => {
    try {
      const client = await clientsService.getById(req.params.id);
      
      if (!client) {
        return res.status(404).json(apiResponse.errorResponse('Client not found'));
      }
      
      // Format data for response
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

  // Create client
  createClient: async (req, res) => {
    try {
      const clientData = req.body;
      const newClient = await clientsService.create(clientData);
      
      res.status(201).json(apiResponse.successResponse(newClient, 'Client created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  // Update client
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

  // Delete client
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