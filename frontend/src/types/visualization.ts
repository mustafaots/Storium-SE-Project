// Storium IMS Visualization Types - Matching exact MySQL Schema

// =====================
// PHYSICAL STRUCTURE
// =====================

export interface Location {
  location_id: number;
  name: string;
  address: string | null;
  coordinates: string | null;
  created_at: string;
}

export interface Depot {
  depot_id: number;
  parent_location: number;
  name: string;
  created_at: string;
}

export interface Aisle {
  aisle_id: number;
  parent_depot: number;
  name: string;
  created_at: string;
}

export interface Rack {
  rack_id: number;
  parent_aisle: number;
  rack_code: string;
  created_at: string;
}

export interface RackSlot {
  slot_id: number;
  rack_id: number;
  direction: 'right' | 'left';
  bay_no: number;
  level_no: number;
  bin_no: number;
  capacity: number;
  is_occupied: boolean;
  created_at: string;
}

// =====================
// PRODUCT HIERARCHY
// =====================

export interface Product {
  product_id: number;
  name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  image_mime_type: string | null;
  unit: string | null;
  min_stock_level: number | null;
  max_stock_level: number | null;
  rate: number | null;
  rate_unit: string | null;
  created_at: string;
}

export interface Stock {
  stock_id: number;
  product_id: number;
  slot_id: number;
  slot_coordinates: string | null;
  quantity: number;
  batch_no: string | null;
  expiry_date: string | null;
  strategy: 'FIFO' | 'LIFO' | 'JIT';
  product_type: 'raw' | 'wip' | 'to_ship' | 'deadstock' | 'discrepancy';
  is_consumable: boolean;
  sale_price: number | null;
  cost_price: number | null;
  last_updated: string;
}

// =====================
// SOURCES & CLIENTS
// =====================

export interface Source {
  source_id: number;
  source_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  coordinates: string | null;
  created_at: string;
}

export interface ProductSource {
  id: number;
  product_id: number;
  source_id: number;
  cost_price: number | null;
  lead_time_days: number | null;
  is_preferred_supplier: boolean;
  created_at: string;
}

export interface Client {
  client_id: number;
  client_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: string;
}

// =====================
// AUTOMATION & HISTORY
// =====================

export interface Routine {
  routine_id: number;
  name: string;
  promise: string | null;
  resolve: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'on_event';
  is_active: boolean;
  last_run: string | null;
  created_at: string;
}

export interface ActionHistory {
  action_id: number;
  action: string;
  created_at: string;
  is_automated: boolean;
  actor_name: string | null;
  routine_id: number | null;
}

// =====================
// STOCK MOVEMENTS
// =====================

export interface Transaction {
  txn_id: number;
  is_automated: boolean;
  routine_id: number | null;
  stock_id: number | null;
  product_id: number;
  from_slot_id: number | null;
  to_slot_id: number | null;
  txn_type: 'inflow' | 'outflow' | 'transfer' | 'consumption' | 'adjustment';
  quantity: number;
  total_value: number | null;
  reference_number: string | null;
  notes: string | null;
  timestamp: string;
  source_id: number | null;
  client_id: number | null;
  stock_snapshot: Record<string, unknown> | null;
}

// =====================
// ALERTS
// =====================

export interface Alert {
  alert_id: number;
  alert_type: 'low_stock' | 'overstock' | 'expiry' | 'reorder';
  severity: 'info' | 'warning' | 'critical';
  sent_at: string;
  is_read: boolean;
  content: string | null;
  linked_stock: number | null;
  linked_product: number | null;
}

// =====================
// VISUALIZATION TYPES
// =====================

export interface KPIData {
  totalStockValue: number;
  movementsToday: number;
  belowMinLevel: number;
  warehouseOccupancy: number;
}

export interface StockTrendDataPoint {
  date: string;
  value: number;
  label: string;
}

export type OccupancyLevel = 'empty' | 'low' | 'mid' | 'full';

export interface WarehouseSlot {
  slotId: number;
  slotName: string;
  occupancy: number;
  level: OccupancyLevel;
  productName?: string;
  quantity?: number;
}

export interface WarehouseZone {
  zoneId: string;
  zoneName: string;
  floor: number;
  slots: WarehouseSlot[];
}

export interface FilterState {
  viewType: 'stock_levels' | 'transactions' | 'products';
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
  products: number[];
  locations: number[];
  stockTypes: ('raw' | 'wip' | 'to_ship' | 'deadstock' | 'discrepancy')[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  previousValue?: number;
}

export interface VisualizationData {
  kpis: KPIData;
  stockTrends: StockTrendDataPoint[];
  warehouseZones: WarehouseZone[];
  chartData: ChartDataPoint[];
  comparison: {
    percentage: number;
    isPositive: boolean;
    period: string;
  };
}