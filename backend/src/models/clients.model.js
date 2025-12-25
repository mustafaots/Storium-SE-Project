// backend/src/models/clients.model.js
import connection from '../config/database.js';
import { buildPagination } from '../utils/database.js';

export const Client = {
  // Get all clients (paginated)
  getAllPaginated: (page = 1, limit = 10, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const params = [];

      let query = `
        SELECT *
        FROM clients
      `;

      if (search && String(search).trim()) {
        query += ' WHERE client_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ? OR address LIKE ?';
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(queryLimit, offset);

      connection.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Get total count (for pagination)
  getTotalCount: (search = '') => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as total FROM clients';
      const params = [];

      if (search && String(search).trim()) {
        query += ' WHERE client_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ? OR address LIKE ?';
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }

      connection.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    });
  },

  // Get single client by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM clients WHERE client_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  // Create new client
  create: (clientData) => {
    return new Promise((resolve, reject) => {
      const { client_name, contact_email, contact_phone, address } = clientData;

      connection.query(
        'INSERT INTO clients (client_name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)',
        [client_name, contact_email, contact_phone, address],
        (err, results) => {
          if (err) reject(err);
          else resolve({ client_id: results.insertId, ...clientData });
        }
      );
    });
  },

  // Update client
  update: (id, clientData) => {
    return new Promise((resolve, reject) => {
      const { client_name, contact_email, contact_phone, address } = clientData;

      connection.query(
        'UPDATE clients SET client_name = ?, contact_email = ?, contact_phone = ?, address = ? WHERE client_id = ?',
        [client_name, contact_email, contact_phone, address, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete client
  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM clients WHERE client_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
