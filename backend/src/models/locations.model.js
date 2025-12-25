import connection from '../config/database.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

export const Location = {
  getAllPaginated: (page = 1, limit = 5, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const { conditions, params } = buildSearchConditions(
        ['name', 'address', 'coordinates'],
        search
      );

      const whereClause = conditions ? `WHERE ${conditions}` : '';
      const queryParams = [...params, queryLimit, offset];

      connection.query(
        `SELECT * FROM locations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        queryParams,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  getTotalCount: (search = '') => {
    return new Promise((resolve, reject) => {
      const { conditions, params } = buildSearchConditions(
        ['name', 'address', 'coordinates'],
        search
      );

      const whereClause = conditions ? `WHERE ${conditions}` : '';

      connection.query(
        `SELECT COUNT(*) as total FROM locations ${whereClause}`,
        params,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0].total);
        }
      );
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM locations WHERE location_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  create: (locationData) => {
    return new Promise((resolve, reject) => {
      const { name, address, coordinates } = locationData;
      connection.query(
        'INSERT INTO locations (name, address, coordinates) VALUES (?, ?, ?)',
        [name, address, coordinates],
        (err, results) => {
          if (err) reject(err);
          else resolve({ location_id: results.insertId, ...locationData });
        }
      );
    });
  },

  update: (id, locationData) => {
    return new Promise((resolve, reject) => {
      const { name, address, coordinates } = locationData;
      connection.query(
        'UPDATE locations SET name = ?, address = ?, coordinates = ? WHERE location_id = ?',
        [name, address, coordinates, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM locations WHERE location_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
