// src/models/clients.model.js
const db = require('../config/database');

class Client {
  // GET all clients with optional search and pagination
  static async findAll(filters = {}) {
    const { search = '', page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM clients 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total FROM clients 
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];
    
    if (search) {
      const searchTerm = `%${search}%`;
      query += ` AND (client_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ?)`;
      countQuery += ` AND (client_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [rows] = await db.execute(query, params);
    const [countRows] = await db.execute(countQuery, countParams);
    
    return {
      clients: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }

  // GET client by ID
  static async findById(clientId) {
    const [rows] = await db.execute(
      'SELECT * FROM clients WHERE client_id = ?',
      [clientId]
    );
    return rows[0];
  }

  // CREATE new client
  static async create(clientData) {
    const { client_name, contact_email, contact_phone, address } = clientData;
    
    const [result] = await db.execute(
      `INSERT INTO clients (client_name, contact_email, contact_phone, address) 
       VALUES (?, ?, ?, ?)`,
      [client_name, contact_email || null, contact_phone || null, address || null]
    );
    
    return result.insertId;
  }

  // UPDATE client
  static async update(clientId, clientData) {
    const { client_name, contact_email, contact_phone, address } = clientData;
    
    const [result] = await db.execute(
      `UPDATE clients 
       SET client_name = ?, contact_email = ?, contact_phone = ?, address = ?
       WHERE client_id = ?`,
      [client_name, contact_email || null, contact_phone || null, address || null, clientId]
    );
    
    return result.affectedRows > 0;
  }

  // DELETE client
  static async delete(clientId) {
    const [result] = await db.execute(
      'DELETE FROM clients WHERE client_id = ?',
      [clientId]
    );
    
    return result.affectedRows > 0;
  }

  // Check if client exists
  static async exists(clientId) {
    const [rows] = await db.execute(
      'SELECT 1 FROM clients WHERE client_id = ?',
      [clientId]
    );
    return rows.length > 0;
  }

  // Get clients for dropdown (simple list)
  static async getClientList() {
    const [rows] = await db.execute(
      'SELECT client_id, client_name FROM clients ORDER BY client_name'
    );
    return rows;
  }

  // Check if client with same name exists
  static async findByName(clientName) {
    const [rows] = await db.execute(
      'SELECT * FROM clients WHERE client_name = ?',
      [clientName]
    );
    return rows[0];
  }
}

module.exports = Client;