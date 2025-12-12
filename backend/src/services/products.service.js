// backend/src/services/products.service.js
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
    
    // Query product rows; use subquery for total_stock to avoid GROUP BY issues
    const query = `
      SELECT 
        p.${PRIMARY_KEY}, 
        p.name, 
        p.category, 
        p.description, 
        p.image_url, 
        p.unit,
        p.min_stock_level, 
        p.max_stock_level,
        COALESCE(st.total_stock, 0) AS total_stock,
        ps.source_id,
        src.source_name AS supplier,
        p.created_at
      FROM ${TABLE} p
      LEFT JOIN (
        SELECT product_id, SUM(quantity) AS total_stock
        FROM stocks
        WHERE is_active = TRUE
        GROUP BY product_id
      ) st ON st.product_id = p.${PRIMARY_KEY}
      LEFT JOIN product_sources ps ON ps.product_id = p.${PRIMARY_KEY} AND ps.is_active = TRUE AND ps.is_preferred_supplier = TRUE
      LEFT JOIN sources src ON src.source_id = ps.source_id
      ${whereClause}
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const queryParams = [...params, queryLimit, offset];

    // Fetch products + total rows in parallel
    const [products, totalRows] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(query, queryParams, (err, results) => {
          if (err) {
            console.error('❌ Service query error:', err);
            return reject(err);
          }
          resolve(results);
        });
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
      const query = `
        SELECT 
          p.${PRIMARY_KEY}, 
          p.name, 
          p.category, 
          p.description, 
          p.image_url, 
          p.unit,
          p.min_stock_level, 
          p.max_stock_level,
          COALESCE(st.total_stock, 0) AS total_stock,
          ps.source_id,
          src.source_name AS supplier,
          p.created_at
        FROM ${TABLE} p
        LEFT JOIN (
          SELECT product_id, SUM(quantity) AS total_stock
          FROM stocks
          WHERE is_active = TRUE
          GROUP BY product_id
        ) st ON st.product_id = p.${PRIMARY_KEY}
        LEFT JOIN product_sources ps ON ps.product_id = p.${PRIMARY_KEY} AND ps.is_active = TRUE AND ps.is_preferred_supplier = TRUE
        LEFT JOIN sources src ON src.source_id = ps.source_id
        WHERE p.${PRIMARY_KEY} = ?
        LIMIT 1
      `;
      
      connection.query(query, [id], (err, results) => {
        if (err) {
          console.error('❌ Service getById error:', err);
          return reject(err);
        }
        
        resolve(results[0] || null);
      });
    });
  },

  // Create new product and return the inserted product row (including created_at and joined supplier/total_stock)
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level, source_id } = data;

      // 1) Insert product
      connection.query(
        `INSERT INTO ${TABLE} (name, category, description, image_url, unit, min_stock_level, max_stock_level)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, image_url, unit, min_stock_level, max_stock_level],
        (err, insertRes) => {
          if (err) {
            console.error('❌ Service create error (insert):', err);
            return reject(err);
          }

          const productId = insertRes.insertId;

          // helper to fetch the inserted product row (no grouping) so created_at is accurate
          const fetchProductRow = (cb) => {
            connection.query(
              `SELECT * FROM ${TABLE} WHERE ${PRIMARY_KEY} = ? LIMIT 1`,
              [productId],
              (errRow, rows) => {
                if (errRow) return cb(errRow);
                if (!rows || rows.length === 0) return cb(new Error('Inserted product not found'));
                const productRow = rows[0];
                // now fetch total_stock
                connection.query(
                  `SELECT COALESCE(SUM(quantity), 0) AS total_stock FROM stocks WHERE product_id = ? AND is_active = TRUE`,
                  [productId],
                  (errStock, stockRows) => {
                    if (errStock) return cb(errStock);
                    const total_stock = stockRows && stockRows[0] ? (stockRows[0].total_stock || 0) : 0;
                    // fetch preferred supplier if any
                    connection.query(
                      `SELECT ps.source_id, s.source_name FROM product_sources ps JOIN sources s ON s.source_id = ps.source_id WHERE ps.product_id = ? AND ps.is_preferred_supplier = TRUE AND ps.is_active = TRUE LIMIT 1`,
                      [productId],
                      (errSup, supRows) => {
                        if (errSup) return cb(errSup);
                        const supplier = supRows && supRows[0] ? supRows[0].source_name : null;
                        const source_id_found = supRows && supRows[0] ? supRows[0].source_id : null;
                        // merge and return
                        const merged = {
                          ...productRow,
                          total_stock,
                          supplier,
                          source_id: source_id_found
                        };
                        return cb(null, merged);
                      }
                    );
                  }
                );
              }
            );
          };

          // 2) If supplier provided, insert mapping then fetch product row; otherwise just fetch product row
          if (source_id !== null && source_id !== undefined && source_id !== '') {
            connection.query(
              'INSERT INTO product_sources (product_id, source_id, is_preferred_supplier, is_active, created_at) VALUES (?, ?, TRUE, TRUE, NOW())',
              [productId, source_id],
              (psErr) => {
                if (psErr) {
                  console.error('❌ Service - Failed to link supplier:', psErr);
                  return reject(psErr);
                }
                // After creating mapping, fetch canonical product row
                fetchProductRow((fetchErr, productData) => {
                  if (fetchErr) return reject(fetchErr);
                  resolve(productData);
                });
              }
            );
          } else {
            // No supplier to link — just fetch the product row
            fetchProductRow((fetchErr, productData) => {
              if (fetchErr) return reject(fetchErr);
              resolve(productData);
            });
          }
        }
      );
    });
  },

  // Update existing product
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, image_url, unit, min_stock_level, max_stock_level, source_id } = data;

      connection.query(
        `UPDATE ${TABLE} SET name = ?, category = ?, description = ?, image_url = ?, unit = ?, min_stock_level = ?, max_stock_level = ? WHERE ${PRIMARY_KEY} = ?`,
        [name, category, description, image_url, unit, min_stock_level, max_stock_level, id],
        (err, results) => {
          if (err) {
            console.error('❌ Service update error:', err);
            return reject(err);
          }

          console.log('✅ Service - Product updated');

          // Update supplier relationship: deactivate old mappings for product
          connection.query(
            'UPDATE product_sources SET is_preferred_supplier = FALSE, is_active = FALSE WHERE product_id = ?',
            [id],
            (err2) => {
              if (err2) {
                console.error('❌ Service - Failed to deactivate old suppliers:', err2);
                return reject(err2);
              }

              if (source_id !== null && source_id !== undefined && source_id !== '') {
                // Check if a mapping already exists for this product+source
                connection.query(
                  'SELECT id FROM product_sources WHERE product_id = ? AND source_id = ?',
                  [id, source_id],
                  (err3, existing) => {
                    if (err3) {
                      console.error('❌ Service - Check existing failed:', err3);
                      return reject(err3);
                    }

                    if (existing.length > 0) {
                      // reactivate existing mapping
                      connection.query(
                        'UPDATE product_sources SET is_preferred_supplier = TRUE, is_active = TRUE WHERE id = ?',
                        [existing[0].id],
                        (err4) => {
                          if (err4) {
                            console.error('❌ Service - Reactivate failed:', err4);
                            return reject(err4);
                          }

                          // After updating mapping, return the updated product row (canonical)
                          productsService.getById(id)
                            .then((row) => resolve(row))
                            .catch((getErr) => reject(getErr));
                        }
                      );
                    } else {
                      // create new mapping
                      connection.query(
                        'INSERT INTO product_sources (product_id, source_id, is_preferred_supplier, is_active) VALUES (?, ?, TRUE, TRUE)',
                        [id, source_id],
                        (err4) => {
                          if (err4) {
                            console.error('❌ Service - Create relationship failed:', err4);
                            return reject(err4);
                          }
                          
                          // Return updated product row
                          productsService.getById(id)
                            .then((row) => resolve(row))
                            .catch((getErr) => reject(getErr));
                        }
                      );
                    }
                  }
                );
              } else {
                
                // Return updated product row (canonical)
                productsService.getById(id)
                  .then((row) => resolve(row))
                  .catch((getErr) => reject(getErr));
              }
            }
          );
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
