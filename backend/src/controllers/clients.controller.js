// Import the Client model
const Client = require('../models/clients.model');

const clientController = {
  // GET ALL CLIENTS
  getAllClients: async (req, res) => {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      
      const result = await Client.findAll({
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: result.clients,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch clients',
        details: error.message
      });
    }
  },

  // GET CLIENT LIST (SIMPLIFIED)
  getClientList: async (req, res) => {
    try {
      const clients = await Client.getClientList();
      
      res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      console.error('Get client list error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch client list'
      });
    }
  },

  // GET SINGLE CLIENT BY ID
  getClientById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const client = await Client.findById(id);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }
      
      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      console.error('Get client by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch client'
      });
    }
  },

  // CREATE NEW CLIENT
  createClient: async (req, res) => {
    try {
      const { client_name, contact_email, contact_phone, address, note } = req.body;
      
      if (!client_name || client_name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Client name is required'
        });
      }
      
      const existingClient = await Client.findByName(client_name.trim());
      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: 'Client with this name already exists'
        });
      }
      
      const clientId = await Client.create({
        client_name: client_name.trim(),
        contact_email: contact_email ? contact_email.trim() : null,
        contact_phone: contact_phone ? contact_phone.trim() : null,
        address: address ? address.trim() : null,
        note: note ? note.trim() : null
      });
      
      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: { client_id: clientId }
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to create client',
        details: error.message
      });
    }
  },

  // UPDATE EXISTING CLIENT
  updateClient: async (req, res) => {
    try {
      const { id } = req.params;
      const { client_name, contact_email, contact_phone, address, note } = req.body;
      
      const clientExists = await Client.exists(id);
      if (!clientExists) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }
      
      if (!client_name) {
        return res.status(400).json({
          success: false,
          error: 'Client name is required'
        });
      }
      
      const updated = await Client.update(id, {
        client_name,
        contact_email,
        contact_phone,
        address,
        note
      });
      
      if (!updated) {
        return res.status(400).json({
          success: false,
          error: 'Failed to update client'
        });
      }
      
      res.json({
        success: true,
        message: 'Client updated successfully'
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to update client',
        details: error.message
      });
    }
  },

  // DELETE CLIENT
  deleteClient: async (req, res) => {
    try {
      const { id } = req.params;
      
      const clientExists = await Client.exists(id);
      if (!clientExists) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }
      
      const deleted = await Client.delete(id);
      
      if (!deleted) {
        return res.status(400).json({
          success: false,
          error: 'Failed to delete client'
        });
      }
      
      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to delete client',
        details: error.message
      });
    }
  }
};

module.exports = clientController;