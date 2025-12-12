import connection from '../config/database.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

export const Aisle = {
  getAllPaginated: (depotId, page = 1, limit = 5, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const { conditions, params } = buildSearchConditions(['name'], search);
      const whereClause = conditions ? `AND ${conditions}` : '';
      const queryParams = [depotId, ...params, queryLimit, offset];

      connection.query(
        `SELECT * FROM aisles WHERE parent_depot = ? ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        queryParams,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  getTotalCount: (depotId, search = '') => {
    return new Promise((resolve, reject) => {
      const { conditions, params } = buildSearchConditions(['name'], search);
      const whereClause = conditions ? `AND ${conditions}` : '';

      connection.query(
        `SELECT COUNT(*) as total FROM aisles WHERE parent_depot = ? ${whereClause}`,
        [depotId, ...params],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0].total);
        }
      );
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM aisles WHERE aisle_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  create: (depotId, aisleData) => {
    return new Promise((resolve, reject) => {
      const { name } = aisleData;
      connection.query(
        'INSERT INTO aisles (parent_depot, name) VALUES (?, ?)',
        [depotId, name],
        (err, results) => {
          if (err) reject(err);
          else resolve({ aisle_id: results.insertId, parent_depot: depotId, name });
        }
      );
    });
  },

  update: (id, aisleData) => {
    return new Promise((resolve, reject) => {
      const { name } = aisleData;
      connection.query(
        'UPDATE aisles SET name = ? WHERE aisle_id = ?',
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
      connection.query('DELETE FROM aisles WHERE aisle_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
