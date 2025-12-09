import connection from '../config/database.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

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

  // Get paginated clients with optional search filter
  getAllPaginated: (page = 1, limit = 10, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const { conditions, params } = buildSearchConditions(
        ['client_name', 'contact_email', 'contact_phone', 'address'],
        search
      );

      const whereClause = conditions ? `WHERE ${conditions}` : '';
      const queryParams = [...params, queryLimit, offset];
      
      connection.query(
        `SELECT * FROM clients ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        queryParams,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Count clients matching search filter (keeps pagination in sync)
  getTotalCount: (search = '') => {
    return new Promise((resolve, reject) => {
      const { conditions, params } = buildSearchConditions(
        ['client_name', 'contact_email', 'contact_phone', 'address'],
        search
      );

      const whereClause = conditions ? `WHERE ${conditions}` : '';

      connection.query(
        `SELECT COUNT(*) as total FROM clients ${whereClause}`,
        params,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0].total);
        }
      );
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