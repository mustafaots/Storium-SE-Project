// Import the team's connection file
// MAKE SURE THIS PATH POINTS TO WHERE YOUR TEAM'S DB FILE IS
import db from '../config/database.js'; 

export const RoutineModel = {
  
  // 1. Get all routines
  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM routines ORDER BY created_at DESC';
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // 2. Create a new routine
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { name, promise, resolve: resolveText, frequency } = data;
      const sql = 'INSERT INTO routines (name, promise, resolve, frequency) VALUES (?, ?, ?, ?)';
      db.query(sql, [name, promise, resolveText, frequency], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  },

  // 3. Toggle status
  toggleStatus: (id, isActive) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE routines SET is_active = ? WHERE routine_id = ?';
      db.query(sql, [isActive, id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  },

  // 4. Delete a routine
  deleteById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM routines WHERE routine_id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  } , 

  // ... existing code (findAll, create, toggleStatus) ...

  // 5. Find a single routine by ID (NEW)
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM routines WHERE routine_id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        // Return the first result or null if not found
        resolve(results[0] || null);
      });
    });
  } , 

  // ... existing code ...

  // 6. Get Dashboard Stats (NEW)
  getDashboardStats: () => {
    return new Promise((resolve, reject) => {
      // This single query counts 3 different things at the same time
      const sql = `
        SELECT
          (SELECT COUNT(*) FROM routines WHERE is_active = 1) AS active_routines,
          (SELECT COUNT(*) FROM alerts WHERE severity = 'critical') AS critical_errors,
          (SELECT COUNT(*) FROM action_history WHERE created_at >= NOW() - INTERVAL 24 HOUR) AS executions_24h
      `;
      
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        // It returns an array like [{ active_routines: 2, critical_errors: 1... }]
        resolve(results[0]);
      });
    });
  } , 

  // 7. Get Product List (ADD THIS)
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT product_id, name FROM products ORDER BY name ASC';
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  } , 
  // 8. Log History (NEW)
  logHistory: (routineId, actionText) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO action_history (routine_id, action, is_automated) VALUES (?, ?, 1)';
      db.query(sql, [routineId, actionText], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

// ... existing code (deleteById) ...
};