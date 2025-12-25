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
        p.unit,
        p.min_stock_level, 
        p.max_stock_level,
        p.rate,
        p.rate_unit,
        p.image_mime_type,
        TO_BASE64(p.image_data) AS image_data,
        COALESCE(st.total_stock, 0) AS total_stock,
        ps.source_id,
        src.source_name AS supplier,
        p.created_at
      FROM ${TABLE} p
      LEFT JOIN (
        SELECT product_id, SUM(quantity) AS total_stock
        FROM stocks
        GROUP BY product_id
      ) st ON st.product_id = p.${PRIMARY_KEY}
      LEFT JOIN product_sources ps ON ps.product_id = p.${PRIMARY_KEY} AND ps.is_preferred_supplier = TRUE
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
          console.log('📦 Products service raw results:', JSON.stringify(results.slice(0, 2), null, 2));
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(
          `SELECT COUNT(*) as total FROM ${TABLE} p ${whereClause}`,
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
          p.unit,
          p.min_stock_level, 
          p.max_stock_level,
          p.rate,
          p.rate_unit,
          p.image_mime_type,
          TO_BASE64(p.image_data) AS image_data,
          COALESCE(st.total_stock, 0) AS total_stock,
          ps.source_id,
          src.source_name AS supplier,
          p.created_at
        FROM ${TABLE} p
        LEFT JOIN (
          SELECT product_id, SUM(quantity) AS total_stock
          FROM stocks
          GROUP BY product_id
        ) st ON st.product_id = p.${PRIMARY_KEY}
        LEFT JOIN product_sources ps ON ps.product_id = p.${PRIMARY_KEY} AND ps.is_preferred_supplier = TRUE
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
      const { name, category, description, unit, min_stock_level, max_stock_level, source_id, rate, rate_unit, image_data, image_mime_type } = data;

      const validRate = rate != null && rate !== '' && !Number.isNaN(Number(rate)) && Number(rate) >= 0
        ? Number(rate)
        : null;
      const validRateUnit = rate_unit != null && String(rate_unit).trim() !== '' ? String(rate_unit).trim() : null;

      // 1) Insert product
      connection.query(
        `INSERT INTO ${TABLE} (name, category, description, unit, min_stock_level, max_stock_level, rate, rate_unit, image_data, image_mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, unit, min_stock_level, max_stock_level, validRate, validRateUnit, image_data || null, image_mime_type || null],
        (err, insertRes) => {
          if (err) {
            console.error('❌ Service create error (insert):', err);
            return reject(err);
          }

          const productId = insertRes.insertId;

          // 2) If supplier provided, insert mapping then fetch product row; otherwise just fetch product row
          if (source_id !== null && source_id !== undefined && source_id !== '') {
            connection.query(
              'INSERT INTO product_sources (product_id, source_id, is_preferred_supplier, created_at) VALUES (?, ?, TRUE, NOW())',
              [productId, source_id],
              (psErr) => {
                if (psErr) {
                  console.error('❌ Service - Failed to link supplier:', psErr);
                  return reject(psErr);
                }
                productsService.getById(productId)
                  .then((row) => resolve(row))
                  .catch((getErr) => reject(getErr));
              }
            );
          } else {
            productsService.getById(productId)
              .then((row) => resolve(row))
              .catch((getErr) => reject(getErr));
          }
        }
      );
    });
  },

  // Update existing product
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      const { name, category, description, unit, min_stock_level, max_stock_level, source_id, rate, rate_unit, image_data, image_mime_type } = data;

      const validRate = rate != null && rate !== '' && !Number.isNaN(Number(rate)) && Number(rate) >= 0
        ? Number(rate)
        : null;
      const validRateUnit = rate_unit != null && String(rate_unit).trim() !== '' ? String(rate_unit).trim() : null;

      // Build update query
      let updateQuery;
      let updateParams;

      if (image_data !== undefined) {
        updateQuery = `UPDATE ${TABLE} SET name = ?, category = ?, description = ?, unit = ?, min_stock_level = ?, max_stock_level = ?, rate = ?, rate_unit = ?, image_data = ?, image_mime_type = ? WHERE ${PRIMARY_KEY} = ?`;
        updateParams = [name, category, description, unit, min_stock_level, max_stock_level, validRate, validRateUnit, image_data, image_mime_type || null, id];
      } else {
        updateQuery = `UPDATE ${TABLE} SET name = ?, category = ?, description = ?, unit = ?, min_stock_level = ?, max_stock_level = ?, rate = ?, rate_unit = ? WHERE ${PRIMARY_KEY} = ?`;
        updateParams = [name, category, description, unit, min_stock_level, max_stock_level, validRate, validRateUnit, id];
      }

      connection.query(
        updateQuery,
        updateParams,
        (err, results) => {
          if (err) {
            console.error('❌ Service update error:', err);
            return reject(err);
          }

          console.log('✅ Service - Product updated');

          // Update supplier relationship: deactivate old mappings for product
          connection.query(
            'UPDATE product_sources SET is_preferred_supplier = FALSE WHERE product_id = ?',
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
                        'UPDATE product_sources SET is_preferred_supplier = TRUE WHERE id = ?',
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
                        'INSERT INTO product_sources (product_id, source_id, is_preferred_supplier) VALUES (?, ?, TRUE)',
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
      // First delete supplier mappings
      connection.query(
        'DELETE FROM product_sources WHERE product_id = ?',
        [id],
        (err) => {
          if (err) return reject(err);
          // Then delete the product
          connection.query(
            `DELETE FROM ${TABLE} WHERE ${PRIMARY_KEY} = ?`,
            [id],
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        }
      );
    });
  }
};

export default productsService;
