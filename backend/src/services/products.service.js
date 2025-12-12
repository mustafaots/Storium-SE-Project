// src/services/products.service.js
import connection from '../config/database.js';
import { constants } from '../utils/constants.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

const TABLE = 'products';
const PRIMARY_KEY = 'product_id';

const productsService = {
  // Get all products (non-paginated)
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Get paginated products with total count and search
  getAllPaginated: async (page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, search = '') => {
    const validatedPage = Math.max(1, parseInt(page, 10));
    const validatedLimit = Math.min(Math.max(1, parseInt(limit, 10)), constants.PAGINATION.MAX_LIMIT);

    const { limit: queryLimit, offset } = buildPagination(validatedPage, validatedLimit);

    // Build search conditions only if search is non-empty
    const { conditions, params } = search
      ? buildSearchConditions(['name', 'category', 'description', 'unit'], search)
      : { conditions: '', params: [] };

    const whereClause = conditions ? `WHERE ${conditions}` : '';
    const queryParams = [...params, queryLimit, offset];

    // Fetch products + total rows in parallel
    const [products, totalRows] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(
          `SELECT * FROM ${TABLE} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          queryParams,
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      }),
      new Promise((resolve, reject) => {
        connection.query(
          `SELECT COUNT(*) as total FROM ${TABLE} ${whereClause}`,
          params,
          (err, results) => {
            if (err) return reject(err);
            resolve(results[0]?.total || 0);
          }
        );
      })
    ]);

    return {
      products,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: totalRows,
        pages: Math.ceil(totalRows / validatedLimit),
      }
    };
  },

  // Get single product by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${TABLE} WHERE ${PRIMARY_KEY} = ?`, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  // Create new product
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level } = data;

      connection.query(
        `INSERT INTO ${TABLE} (name, category, description, image_url, unit, min_stock_level, max_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, image_url, unit, min_stock_level, max_stock_level],
        (err, results) => {
          if (err) return reject(err);
          resolve({ product_id: results.insertId, ...data });
        }
      );
    });
  },

  // Update existing product
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level } = data;

      connection.query(
        `UPDATE ${TABLE} SET name = ?, category = ?, description = ?, image_url = ?, unit = ?, min_stock_level = ?, max_stock_level = ? WHERE ${PRIMARY_KEY} = ?`,
        [name, category, description, image_url, unit, min_stock_level, max_stock_level, id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  // Delete product
  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM ${TABLE} WHERE ${PRIMARY_KEY} = ?`, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};

export default productsService;
