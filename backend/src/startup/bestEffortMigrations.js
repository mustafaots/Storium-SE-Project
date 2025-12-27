// backend/src/startup/bestEffortMigrations.js
// Startup-only best-effort migrations. Failures should not crash the server.

/**
 * Ensures `routines.frequency` supports real-time execution.
 * (Frontend/scheduler use 'always')
 *
 * @param {import('mysql2/promise').Pool} dbPromisePool mysql2 promise pool
 */
export const ensureRoutinesFrequencyAlways = async (dbPromisePool) => {
  try {
    const db = dbPromisePool;
    if (!db || typeof db.query !== 'function') return;

    const [rows] = await db.query(
      `SELECT COLUMN_TYPE
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'routines'
         AND COLUMN_NAME = 'frequency'`
    );

    const columnType = rows?.[0]?.COLUMN_TYPE;
    if (typeof columnType === 'string' && !columnType.includes("'always'")) {
      await db.query(
        "ALTER TABLE routines MODIFY frequency ENUM('daily','weekly','monthly','on_event','always')"
      );
      console.log("✅ Migrated routines.frequency to include 'always'");
    }
  } catch (error) {
    console.warn('⚠️ Could not auto-migrate routines.frequency:', error?.message || error);
  }
};

export const runBestEffortMigrations = async (dbPromisePool) => {
  await ensureRoutinesFrequencyAlways(dbPromisePool);
};
