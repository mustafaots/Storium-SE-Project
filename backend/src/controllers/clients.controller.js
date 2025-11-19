import { Client } from '../models/clients.model.js';

export const clientsController = {
  // Get all clients
  getAllClients: async (req, res) => {
    try {
      const clients = await Client.getAll();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get client by ID
  getClientById: async (req, res) => {
    try {
      const client = await Client.getById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new client
  createClient: async (req, res) => {
    try {
      const { client_name, contact_email, contact_phone, address } = req.body;
      
      if (!client_name) {
        return res.status(400).json({ message: 'Client name is required' });
      }

      const newClient = await Client.create({
        client_name,
        contact_email,
        contact_phone,
        address
      });
      
      res.status(201).json(newClient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update client
  updateClient: async (req, res) => {
    try {
      const { client_name, contact_email, contact_phone, address } = req.body;
      
      if (!client_name) {
        return res.status(400).json({ message: 'Client name is required' });
      }

      const result = await Client.update(req.params.id, {
        client_name,
        contact_email,
        contact_phone,
        address
      });
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      res.json({ message: 'Client updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete client
  deleteClient: async (req, res) => {
    try {
      const result = await Client.delete(req.params.id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};