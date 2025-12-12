// backend/src/models/products.model.js
import connection from '../config/database.js';
import { buildPagination } from '../utils/database.js';

export const Product = {
  // Get all products with pagination and supplier info
  getAllPaginated: (page = 1, limit = 10, search = '') => {
    return new Promise((resolve, reject) => {
      const { limit: queryLimit, offset } = buildPagination(page, limit);
      const params = [];

      let query = `
        SELECT 
          p.product_id, 
          p.name, 
          p.category, 
          p.unit,
          p.min_stock_level, 
          p.max_stock_level, 
          p.description, 
          p.image_url,
          COALESCE(SUM(st.quantity), 0) AS total_stock,
          ps.source_id, 
          s.source_name AS supplier
        FROM products p
        LEFT JOIN stocks st ON st.product_id = p.product_id AND st.is_active = TRUE
        LEFT JOIN product_sources ps ON ps.product_id = p.product_id AND ps.is_active = TRUE AND ps.is_preferred_supplier = TRUE
        LEFT JOIN sources s ON s.source_id = ps.source_id
      `;

      if (search) {
        query += ' WHERE p.name LIKE ? OR p.category LIKE ?';
        const term = `%${search}%`;
        params.push(term, term);
      }

      query += ' GROUP BY p.product_id, ps.source_id, s.source_name ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(queryLimit, offset);

      connection.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
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
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  // Get by ID with supplier info
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.product_id, 
          p.name, 
          p.category, 
          p.unit,
          p.min_stock_level, 
          p.max_stock_level, 
          p.description, 
          p.image_url,
          COALESCE(SUM(st.quantity), 0) AS total_stock,
          ps.source_id, 
          s.source_name AS supplier
        FROM products p
        LEFT JOIN stocks st ON st.product_id = p.product_id AND st.is_active = TRUE
        LEFT JOIN product_sources ps ON ps.product_id = p.product_id AND ps.is_active = TRUE AND ps.is_preferred_supplier = TRUE
        LEFT JOIN sources s ON s.source_id = ps.source_id
        WHERE p.product_id = ?
        GROUP BY p.product_id, ps.source_id, s.source_name
      `;
      
      connection.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  // Create product with supplier
  create: (productData) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level, source_id } = productData;
      
      connection.query(
        'INSERT INTO products (name, category, description, image_url, unit, min_stock_level, max_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, category, description, image_url, unit, min_stock_level, max_stock_level],
        (err, results) => {
          if (err) return reject(err);
          
          const productId = results.insertId;
          
          if (source_id !== null && source_id !== undefined && source_id !== '') {
            connection.query(
              'INSERT INTO product_sources (product_id, source_id, is_preferred_supplier, is_active) VALUES (?, ?, TRUE, TRUE)',
              [productId, source_id],
              (err2) => {
                if (err2) return reject(err2);
                resolve({ product_id: productId, ...productData });
              }
            );
          } else {
            resolve({ product_id: productId, ...productData });
          }
        }
      );
    });
  },

  // Update product with supplier
  update: (id, productData) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level, source_id } = productData;
      
      connection.query(
        'UPDATE products SET name = ?, category = ?, description = ?, image_url = ?, unit = ?, min_stock_level = ?, max_stock_level = ? WHERE product_id = ?',
        [name, category, description, image_url, unit, min_stock_level, max_stock_level, id],
        (err, results) => {
          if (err) return reject(err);
          
          connection.query(
            'UPDATE product_sources SET is_preferred_supplier = FALSE, is_active = FALSE WHERE product_id = ?',
            [id],
            (err2) => {
              if (err2) return reject(err2);
              
              if (source_id !== null && source_id !== undefined && source_id !== '') {
                connection.query(
                  'SELECT id FROM product_sources WHERE product_id = ? AND source_id = ?',
                  [id, source_id],
                  (err3, existing) => {
                    if (err3) return reject(err3);
                    
                    if (existing.length > 0) {
                      connection.query(
                        'UPDATE product_sources SET is_preferred_supplier = TRUE, is_active = TRUE WHERE id = ?',
                        [existing[0].id],
                        (err4) => {
                          if (err4) return reject(err4);
                          resolve(results);
                        }
                      );
                    } else {
                      connection.query(
                        'INSERT INTO product_sources (product_id, source_id, is_preferred_supplier, is_active) VALUES (?, ?, TRUE, TRUE)',
                        [id, source_id],
                        (err4) => {
                          if (err4) return reject(err4);
                          resolve(results);
                        }
                      );
                    }
                  }
                );
              } else {
                resolve(results);
              }
            }
          );
        }
      );
    });
  },

  // Delete product (cascade will handle product_sources deletion)
  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM products WHERE product_id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};