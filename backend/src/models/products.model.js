// backend/src/models/products.model.js
import connection from '../config/database.js';
import { buildPagination } from '../utils/database.js';

export const Product = {
  // Get all products with pagination
  getAllPaginated: (page = 1, limit = 10, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const params = [];

      let query = `
        SELECT p.product_id, p.name, p.category, p.unit,
               p.min_stock_level, p.max_stock_level, p.description, p.image_url,
               COALESCE(SUM(s.quantity), 0) AS total_stock
        FROM products p
        LEFT JOIN stocks s ON s.product_id = p.product_id AND s.is_active = TRUE
      `;

      if (search) {
        query += ' WHERE p.name LIKE ? OR p.category LIKE ?';
        const term = `%${search}%`;
        params.push(term, term);
      }

      query += ' GROUP BY p.product_id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(queryLimit, offset);

      connection.query(query, params, (err, results) => {
        if (err) {
          console.error('PRODUCT QUERY ERROR:', err);
          reject(err);
        } else resolve(results);
      });
    });
  },

  // Get total count
  getTotalCount: (search = '') => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as total FROM products';
      const params = [];

      if (search) {
        query += ' WHERE name LIKE ? OR category LIKE ?';
        const term = `%${search}%`;
        params.push(term, term);
      }

      connection.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    });
  },

  // Get by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.product_id, p.name, p.category, p.unit,
               p.min_stock_level, p.max_stock_level, p.description, p.image_url,
               COALESCE(SUM(s.quantity), 0) AS total_stock
        FROM products p
        LEFT JOIN stocks s ON s.product_id = p.product_id AND s.is_active = TRUE
        WHERE p.product_id = ?
        GROUP BY p.product_id
      `;
      connection.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  // Create
  create: (productData) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level } = productData;
      connection.query(
        'INSERT INTO products (name, category, description, image_url, unit, min_stock_level, max_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, category, description, image_url, unit, min_stock_level, max_stock_level],
        (err, results) => {
          if (err) reject(err);
          else resolve({ product_id: results.insertId, ...productData });
        }
      );
    });
  },

  // Update
  update: (id, productData) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level } = productData;
      connection.query(
        'UPDATE products SET name = ?, category = ?, description = ?, image_url = ?, unit = ?, min_stock_level = ?, max_stock_level = ? WHERE product_id = ?',
        [name, category, description, image_url, unit, min_stock_level, max_stock_level, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete
  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM products WHERE product_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};
