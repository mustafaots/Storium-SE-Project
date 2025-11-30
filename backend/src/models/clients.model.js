import connection from '../config/database.js';
import { buildPagination } from '../utils/database.js';

export const Client = {
  // Get all clients (keep existing for backward compatibility)
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM clients ORDER BY created_at DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // NEW: Get paginated clients
  getAllPaginated: (page = 1, limit = 10) => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      
      connection.query(
        'SELECT * FROM clients ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [queryLimit, offset],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // NEW: Get total count of clients
  getTotalCount: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) as total FROM clients', (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    });
  },

  // Keep existing methods unchanged
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM clients WHERE client_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

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

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM clients WHERE client_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};