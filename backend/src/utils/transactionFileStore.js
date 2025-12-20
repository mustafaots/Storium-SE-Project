// backend/src/utils/transactionFileStore.js
// File-based transaction storage to prevent loss from cascade deletes

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store transactions in a JSON lines file in the data directory
const DATA_DIR = path.join(__dirname, '../../data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.jsonl');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure transactions file exists
if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(TRANSACTIONS_FILE, '', 'utf8');
}

// Auto-increment counter for txn_id
let nextTxnId = 1;

// Load existing transactions to determine next ID
function initializeNextId() {
  try {
    const content = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    let maxId = 0;
    for (const line of lines) {
      try {
        const txn = JSON.parse(line);
        if (txn.txn_id && txn.txn_id > maxId) {
          maxId = txn.txn_id;
        }
      } catch (e) {
        // Skip malformed lines
      }
    }
    nextTxnId = maxId + 1;
  } catch (e) {
    nextTxnId = 1;
  }
}

initializeNextId();

export const TransactionFileStore = {
  /**
   * Append a new transaction record to the file
   * @param {Object} txnData - Transaction data (without txn_id and timestamp)
   * @returns {Object} - The saved transaction with txn_id and timestamp
   */
  create(txnData) {
    const txn = {
      txn_id: nextTxnId++,
      ...txnData,
      timestamp: new Date().toISOString()
    };

    const line = JSON.stringify(txn) + '\n';
    fs.appendFileSync(TRANSACTIONS_FILE, line, 'utf8');

    return txn;
  },

  /**
   * Read all transactions from the file
   * @returns {Array} - Array of transaction objects
   */
  readAll() {
    try {
      const content = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      const transactions = [];
      
      for (const line of lines) {
        try {
          transactions.push(JSON.parse(line));
        } catch (e) {
          console.error('Failed to parse transaction line:', line);
        }
      }
      
      // Sort by timestamp descending, then by txn_id descending
      transactions.sort((a, b) => {
        const timeCompare = new Date(b.timestamp) - new Date(a.timestamp);
        if (timeCompare !== 0) return timeCompare;
        return b.txn_id - a.txn_id;
      });
      
      return transactions;
    } catch (e) {
      console.error('Failed to read transactions file:', e);
      return [];
    }
  },

  /**
   * Get paginated transactions with optional filters
   * @param {Object} filters - { filterType, dateFilter, search, page, pageSize }
   * @returns {Object} - { rows, totalCount }
   */
  getPaginated(filters = {}) {
    const { filterType, dateFilter, search, page = 1, pageSize = 10 } = filters;
    
    let transactions = this.readAll();

    // Apply filterType filter (automatic/manual)
    if (filterType === 'automatic') {
      transactions = transactions.filter(t => t.is_automated === 1 || t.is_automated === true);
    } else if (filterType === 'manual') {
      transactions = transactions.filter(t => t.is_automated === 0 || t.is_automated === false);
    }

    // Apply date filter
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      transactions = transactions.filter(t => t.timestamp && t.timestamp.startsWith(today));
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      transactions = transactions.filter(t => t.timestamp && new Date(t.timestamp) >= weekAgo);
    } else if (dateFilter === 'month') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      transactions = transactions.filter(t => {
        if (!t.timestamp) return false;
        const txnDate = new Date(t.timestamp);
        return txnDate.getFullYear() === currentYear && txnDate.getMonth() === currentMonth;
      });
    }

    // Apply search filter
    if (search && search.trim() !== '') {
      const searchLower = search.trim().toLowerCase();
      transactions = transactions.filter(t => {
        const notes = (t.notes || '').toLowerCase();
        const refNum = (t.reference_number || '').toLowerCase();
        const productName = (t.product_name || '').toLowerCase();
        const clientName = (t.client_name || '').toLowerCase();
        const sourceName = (t.source_name || '').toLowerCase();
        
        return notes.includes(searchLower) ||
               refNum.includes(searchLower) ||
               productName.includes(searchLower) ||
               clientName.includes(searchLower) ||
               sourceName.includes(searchLower);
      });
    }

    const totalCount = transactions.length;
    const limit = Number(pageSize) || 10;
    const offset = ((Number(page) || 1) - 1) * limit;

    const rows = transactions.slice(offset, offset + limit);

    return { rows, totalCount };
  },

  /**
   * Get a single transaction by ID
   * @param {number} txnId 
   * @returns {Object|null}
   */
  getById(txnId) {
    const transactions = this.readAll();
    return transactions.find(t => t.txn_id === Number(txnId)) || null;
  }
};
