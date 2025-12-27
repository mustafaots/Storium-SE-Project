import connection from '../config/database.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

export const Rack = {
  getAllPaginated: (aisleId, page = 1, limit = 5, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const { conditions, params } = buildSearchConditions(['rack_code'], search);
      const whereClause = conditions ? `AND ${conditions}` : '';
      const queryParams = [aisleId, ...params, queryLimit, offset];

      connection.query(
        `SELECT * FROM racks WHERE parent_aisle = ? ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        queryParams,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  getTotalCount: (aisleId, search = '') => {
    return new Promise((resolve, reject) => {
      const { conditions, params } = buildSearchConditions(['rack_code'], search);
      const whereClause = conditions ? `AND ${conditions}` : '';

      connection.query(
        `SELECT COUNT(*) as total FROM racks WHERE parent_aisle = ? ${whereClause}`,
        [aisleId, ...params],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0].total);
        }
      );
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM racks WHERE rack_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  create: (aisleId, rackData) => {
    return new Promise((resolve, reject) => {
      const { rack_code } = rackData;
      connection.query(
        'INSERT INTO racks (parent_aisle, rack_code) VALUES (?, ?)',
        [aisleId, rack_code],
        (err, results) => {
          if (err) reject(err);
          else resolve({ rack_id: results.insertId, parent_aisle: aisleId, rack_code });
        }
      );
    });
  },

  update: (id, rackData) => {
    return new Promise((resolve, reject) => {
      const { rack_code } = rackData;
      connection.query(
        'UPDATE racks SET rack_code = ? WHERE rack_id = ?',
        [rack_code, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM racks WHERE rack_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
