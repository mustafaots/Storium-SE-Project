import connection from '../config/database.js';

export const Client = {
  // Get all clients
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM clients ORDER BY created_at DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Get client by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM clients WHERE client_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  // Create new client
  create: (clientData) => {
    return new Promise((resolve, reject) => {
      const { client_name, contact_email, contact_phone, address } = clientData;
      connection.query(
        'INSERT INTO clients (client_name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)',
        [client_name, contact_email, contact_phone, address],
        (err, results) => {
          if (err) reject(err);
          else resolve({ client_id: results.insertId, ...clientData });
        }
      );
    });
  },

  // Update client
  update: (id, clientData) => {
    return new Promise((resolve, reject) => {
      const { client_name, contact_email, contact_phone, address } = clientData;
      connection.query(
        'UPDATE clients SET client_name = ?, contact_email = ?, contact_phone = ?, address = ? WHERE client_id = ?',
        [client_name, contact_email, contact_phone, address, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete client
  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM clients WHERE client_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};