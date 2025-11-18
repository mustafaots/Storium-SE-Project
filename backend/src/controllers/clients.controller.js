// Import the Client model - this is our bridge to the database
const Client = require('../models/clients.model');

// Our main controller object that handles all client-related operations
// Think of this as the "brain" that decides what happens when API calls come in
const clientController = {

  // GET ALL CLIENTS
  // When someone visits /api/clients, this function runs
  // It can handle search queries and pagination like a pro
  getAllClients: async (req, res) => {
    try {
      // Extract search parameters from the URL query string
      // If no page or limit is provided, we default to sensible values
      const { search, page = 1, limit = 10 } = req.query;
      
      // Ask our model to fetch clients from the database
      // The model does the heavy lifting, we just coordinate
      const result = await Client.findAll({
        search,
        page: parseInt(page),    // Convert string to number
        limit: parseInt(limit)   // Convert string to number
      });
      
      // If we get here, everything worked! Send back the data
      res.json({
        success: true,
        data: result.clients,           // The actual client records
        pagination: {                   // Helpful info for building pages
          page: result.page,
          limit: result.limit,
          total: result.total,          // Total clients in database
          totalPages: result.totalPages // How many pages we have
        }
      });
    } catch (error) {
      // Oops, something went wrong. Let's handle it gracefully
      console.error('Get clients error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch clients',
        details: error.message  // Helpful for debugging
      });
    }
  },

  // GET CLIENT LIST (SIMPLIFIED)
  // This is perfect for dropdown menus - just IDs and names
  getClientList: async (req, res) => {
    try {
      // Get a clean, simple list of clients
      const clients = await Client.getClientList();
      
      // Return the minimal data
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
  // When you need details about one specific client
  getClientById: async (req, res) => {
    try {
      // Extract the ID from the URL (like /api/clients/123)
      const { id } = req.params;
      
      // Find that specific client in the database
      const client = await Client.findById(id);
      
      // If client doesn't exist, let the user know
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }
      
      // Found them! Return the client data
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
  // When someone wants to add a new client to the system
  createClient: async (req, res) => {
    try {
      // Extract the client data from the request body
      const { client_name, contact_email, contact_phone, address } = req.body;
      
      // Validation: You can't have a client without a name!
      if (!client_name || client_name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Client name is required'
        });
      }
      
      // Check if a client with this name already exists
      // We don't want duplicates causing confusion
      const existingClient = await Client.findByName(client_name.trim());
      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: 'Client with this name already exists'
        });
      }
      
      // Everything looks good! Create the new client
      const clientId = await Client.create({
        client_name: client_name.trim(),
        contact_email: contact_email ? contact_email.trim() : null,  // Email is optional
        contact_phone: contact_phone ? contact_phone.trim() : null,  // Phone is optional  
        address: address ? address.trim() : null                     // Address is optional
      });
      
      // Success! Return the new client's ID
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
  // When client information needs to be changed
  updateClient: async (req, res) => {
    try {
      const { id } = req.params;  // Which client to update
      const { client_name, contact_email, contact_phone, address } = req.body;  // New data
      
      // First, make sure this client actually exists
      const clientExists = await Client.exists(id);
      if (!clientExists) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }
      
      // Validation: Still need a name, even for updates
      if (!client_name) {
        return res.status(400).json({
          success: false,
          error: 'Client name is required'
        });
      }
      
      // Perform the update in the database
      const updated = await Client.update(id, {
        client_name,
        contact_email,
        contact_phone,
        address
      });
      
      // Check if the update actually worked
      if (!updated) {
        return res.status(400).json({
          success: false,
          error: 'Failed to update client'
        });
      }
      
      // Success! Client has been updated
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
  // When it's time to remove a client from the system
  deleteClient: async (req, res) => {
    try {
      const { id } = req.params;  // Which client to delete
      
      // First, verify this client exists
      const clientExists = await Client.exists(id);
      if (!clientExists) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }
      
      // TODO: We should probably check if this client has any transactions
      // before deleting them. Don't want to break our data relationships!
      // const hasTransactions = await checkClientTransactions(id);
      // if (hasTransactions) {
      //   return res.status(400).json({
      //     success: false,
      //     error: 'Cannot delete client with existing transactions'
      //   });
      // }
      
      // Perform the actual deletion
      const deleted = await Client.delete(id);
      
      // Make sure the deletion worked
      if (!deleted) {
        return res.status(400).json({
          success: false,
          error: 'Failed to delete client'
        });
      }
      
      // Success! Client has been removed
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

// Export our controller so the routes can use it
// This is like saying "here are all the functions you can call"
module.exports = clientController;