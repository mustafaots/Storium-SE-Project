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
  }
};