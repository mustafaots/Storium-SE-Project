import db from '../config/database.js';

export const AlertModel = {
  findAll: () => {
    return new Promise((resolve, reject) => {
      // Correct SQL to fetch alerts
      const sql = `SELECT a.*, p.name as product_name FROM alerts a LEFT JOIN products p ON a.linked_product = p.product_id ORDER BY a.sent_at DESC`;
      db.query(sql, (err, res) => err ? reject(err) : resolve(res));
    });
  },
  toggleRead: (id, isRead) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE alerts SET is_read = ? WHERE alert_id = ?', [isRead, id], (err, res) => err ? reject(err) : resolve(res));
    });
  },
  markAllRead: () => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE alerts SET is_read = 1', (err, res) => err ? reject(err) : resolve(res));
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM alerts WHERE alert_id = ?', [id], (err, res) => err ? reject(err) : resolve(res));
    });
  },
  // Added create for compatibility
  create: (data) => {
    return new Promise((resolve, reject) => {
       const sql = `INSERT INTO alerts (alert_type, severity, content, linked_stock, linked_product, sent_at, is_read) VALUES (?, ?, ?, ?, ?, NOW(), 0)`;
       db.query(sql, [data.alert_type, data.severity, data.content, data.linked_stock, data.linked_product], (err, res) => err ? reject(err) : resolve(res));
    });
  }
};