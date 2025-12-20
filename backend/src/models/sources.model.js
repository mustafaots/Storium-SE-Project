// backend/src/models/sources.model.js
import connection from '../config/database.js';
import { buildPagination } from '../utils/database.js';

export const Source = {
  // Get all sources (paginated)
  getAllPaginated: (page = 1, limit = 10, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const params = [];

      let query = `
        SELECT *
        FROM sources
      `;

      if (search && String(search).trim()) {
        query += ' WHERE source_name LIKE ? OR contact_email LIKE ? OR address LIKE ?';
        const term = `%${search}%`;
        params.push(term, term, term);
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
      let query = 'SELECT COUNT(*) as total FROM sources';
      const params = [];

      if (search && String(search).trim()) {
        query += ' WHERE source_name LIKE ? OR contact_email LIKE ? OR address LIKE ?';
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      connection.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    });
  },

  // Get single source by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM sources WHERE source_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  // Create new source
  create: (sourceData) => {
    return new Promise((resolve, reject) => {
      const { source_name, contact_email, contact_phone, address, coordinates } = sourceData;

      connection.query(
        'INSERT INTO sources (source_name, contact_email, contact_phone, address, coordinates) VALUES (?, ?, ?, ?, ?)',
        [source_name, contact_email, contact_phone, address, coordinates],
        (err, results) => {
          if (err) reject(err);
          else resolve({ source_id: results.insertId, ...sourceData });
        }
      );
    });
  },

  // Update source
  update: (id, sourceData) => {
    return new Promise((resolve, reject) => {
      const { source_name, contact_email, contact_phone, address, coordinates } = sourceData;

      connection.query(
        'UPDATE sources SET source_name = ?, contact_email = ?, contact_phone = ?, address = ?, coordinates = ? WHERE source_id = ?',
        [source_name, contact_email, contact_phone, address, coordinates, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete source
  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM sources WHERE source_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
