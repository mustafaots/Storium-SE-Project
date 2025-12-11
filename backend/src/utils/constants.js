/**
 * Application-wide constants and configuration
 * This is like a central settings file for the whole app
 */

// Inventory settings
const INVENTORY_SCOPES = {
  SMALL: 'small',
  INDUSTRIAL: 'industrial'
};

// Product types
const PRODUCT_TYPES = {
  RAW: 'raw',
  WIP: 'wip',
  TO_SHIP: 'to_ship',
  DEADSTOCK: 'deadstock',
  DISCREPANCY: 'discrepancy'
};

// Stock movement types
const TRANSACTION_TYPES = {
  INFLOW: 'inflow',
  OUTFLOW: 'outflow',
  TRANSFER: 'transfer',
  CONSUMPTION: 'consumption',
  ADJUSTMENT: 'adjustment'
};

// Alert types and severities
const ALERT_TYPES = {
  LOW_STOCK: 'low_stock',
  OVERSTOCK: 'overstock',
  EXPIRY: 'expiry',
  REORDER: 'reorder'
};

const ALERT_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

// Default pagination settings
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 5,
  MAX_LIMIT: 100
};

// Measurement units
const MEASUREMENT_UNITS = ['pcs', 'kg', 'g', 'lb', 'oz', 'liters', 'ml', 'boxes', 'pallets'];

const constants = {
  INVENTORY_SCOPES,
  PRODUCT_TYPES,
  TRANSACTION_TYPES,
  ALERT_TYPES,
  ALERT_SEVERITIES,
  PAGINATION,
  MEASUREMENT_UNITS
};

export { constants };