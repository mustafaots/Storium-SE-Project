const db = require('../config/database');

class Client {
  // ULTRA SIMPLE VERSION - No search, just pagination
  static async findAll(filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;
      
      // Simple query without search for now
      const query = 'SELECT * FROM clients ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const countQuery = 'SELECT COUNT(*) as total FROM clients';
      
      console.log('Simple Query:', query);
      console.log('Params:', [parseInt(limit), parseInt(offset)]);
      
      const [rows] = await db.execute(query, [parseInt(limit), parseInt(offset)]);
      const [countRows] = await db.execute(countQuery);
      
      return {
        clients: rows,
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      };
    } catch (error) {
      console.error('Database error in findAll:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  // ... keep all other methods the same as above
  // GET client by ID
  static async findById(clientId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM clients WHERE client_id = ?',
        [clientId]
      );
      return rows[0];
    } catch (error) {
      console.error('Database error in findById:', error);
      throw error;
    }
  }

  // CREATE new client
  static async create(clientData) {
    try {
      const { client_name, contact_email, contact_phone, address, note } = clientData;
      
      const [result] = await db.execute(
        `INSERT INTO clients (client_name, contact_email, contact_phone, address, note) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          client_name, 
          contact_email || null, 
          contact_phone || null, 
          address || null, 
          note || null
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Database error in create:', error);
      throw error;
    }
  }

  // UPDATE client
  static async update(clientId, clientData) {
    try {
      const { client_name, contact_email, contact_phone, address, note } = clientData;
      
      const [result] = await db.execute(
        `UPDATE clients 
         SET client_name = ?, contact_email = ?, contact_phone = ?, address = ?, note = ?
         WHERE client_id = ?`,
        [
          client_name, 
          contact_email || null, 
          contact_phone || null, 
          address || null, 
          note || null, 
          clientId
        ]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Database error in update:', error);
      throw error;
    }
  }

  // DELETE client
  static async delete(clientId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM clients WHERE client_id = ?',
        [clientId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Database error in delete:', error);
      throw error;
    }
  }

  // Check if client exists
  static async exists(clientId) {
    try {
      const [rows] = await db.execute(
        'SELECT 1 FROM clients WHERE client_id = ?',
        [clientId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Database error in exists:', error);
      throw error;
    }
  }

  // Get clients for dropdown (simple list)
  static async getClientList() {
    try {
      const [rows] = await db.execute(
        'SELECT client_id, client_name FROM clients ORDER BY client_name'
      );
      return rows;
    } catch (error) {
      console.error('Database error in getClientList:', error);
      throw error;
    }
  }

  // Check if client with same name exists
  static async findByName(clientName) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM clients WHERE client_name = ?',
        [clientName]
      );
      return rows[0];
    } catch (error) {
      console.error('Database error in findByName:', error);
      throw error;
    }
  }
}

module.exports = Client;