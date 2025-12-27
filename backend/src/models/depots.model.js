import connection from '../config/database.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

export const Depot = {
  getAllPaginated: (locationId, page = 1, limit = 5, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const { conditions, params } = buildSearchConditions(['name'], search);
      const whereClause = conditions ? `AND ${conditions}` : '';
      const queryParams = [locationId, ...params, queryLimit, offset];

      connection.query(
        `SELECT * FROM depots WHERE parent_location = ? ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        queryParams,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  getTotalCount: (locationId, search = '') => {
    return new Promise((resolve, reject) => {
      const { conditions, params } = buildSearchConditions(['name'], search);
      const whereClause = conditions ? `AND ${conditions}` : '';

      connection.query(
        `SELECT COUNT(*) as total FROM depots WHERE parent_location = ? ${whereClause}`,
        [locationId, ...params],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0].total);
        }
      );
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM depots WHERE depot_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  create: (locationId, depotData) => {
    return new Promise((resolve, reject) => {
      const { name } = depotData;
      connection.query(
        'INSERT INTO depots (parent_location, name) VALUES (?, ?)',
        [locationId, name],
        (err, results) => {
          if (err) reject(err);
          else resolve({ depot_id: results.insertId, parent_location: locationId, name });
        }
      );
    });
  },

  update: (id, depotData) => {
    return new Promise((resolve, reject) => {
      const { name } = depotData;
      connection.query(
        'UPDATE depots SET name = ? WHERE depot_id = ?',
        [name, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM depots WHERE depot_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
