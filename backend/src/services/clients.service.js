import connection from '../config/database.js';
import { Client } from '../models/clients.model.js';
import { constants } from '../utils/constants.js';
import { buildPagination, buildSearchConditions } from '../utils/database.js';

const TABLE = Client.tableName;
const PRIMARY_KEY = Client.primaryKey;

const clientsService = {
  // Get all clients
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },
  
  // Get paginated clients with total count (supports search)
  getAllPaginated: async (
    page = constants.PAGINATION.DEFAULT_PAGE,
    limit = constants.PAGINATION.DEFAULT_LIMIT,
    search = ''
  ) => {
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)), 
      constants.PAGINATION.MAX_LIMIT
    );
    
    const { limit: queryLimit, offset } = buildPagination(validatedPage, validatedLimit);
    const { conditions, params } = buildSearchConditions(
      ['client_name', 'contact_email', 'contact_phone', 'address'],
      search
    );

    const whereClause = conditions ? `WHERE ${conditions}` : '';
    const queryParams = [...params, queryLimit, offset];

    const [clients, totalRows] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(
          `SELECT * FROM ${TABLE} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          queryParams,
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      }),
      new Promise((resolve, reject) => {
        connection.query(
          `SELECT COUNT(*) as total FROM ${TABLE} ${whereClause}`,
          params,
          (err, results) => {
            if (err) reject(err);
            else resolve(results[0].total);
          }
        );
      })
    ]);
    
    return {
      clients,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: totalRows,
        pages: Math.ceil(totalRows / validatedLimit)
      }
    };
  },
  
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${TABLE} WHERE ${PRIMARY_KEY} = ?`, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  create: (clientData) => {
    return new Promise((resolve, reject) => {
      const { client_name, contact_email, contact_phone, address } = clientData;
      connection.query(
        `INSERT INTO ${TABLE} (client_name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)`,
        [client_name, contact_email, contact_phone, address],
        (err, results) => {
          if (err) reject(err);
          else resolve({ client_id: results.insertId, ...clientData });
        }
      );
    });
  },

  update: (id, clientData) => {
    return new Promise((resolve, reject) => {
      const { client_name, contact_email, contact_phone, address } = clientData;
      connection.query(
        `UPDATE ${TABLE} SET client_name = ?, contact_email = ?, contact_phone = ?, address = ? WHERE ${PRIMARY_KEY} = ?`,
        [client_name, contact_email, contact_phone, address, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM ${TABLE} WHERE ${PRIMARY_KEY} = ?`, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};

export default clientsService;