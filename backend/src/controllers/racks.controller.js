import racksService from '../services/racks.service.js';
import apiResponse from '../utils/apiResponse.js';
import { formatDate } from '../utils/formatters.js';
import { constants } from '../utils/constants.js';
import { RackSlot } from '../models/rackSlots.model.js';
import { Stock } from '../models/stocks.model.js';
import db from '../config/database.js';
import { TransactionsService } from '../services/transactions.service.js';

const buildRackCode = ({ face_type, levels, bays, bins_per_bay }) => {
  const face = face_type === 'double' ? 'D' : 'S';
  const lvl = Math.max(1, parseInt(levels, 10) || 1);
  const bay = Math.max(1, parseInt(bays, 10) || 1);
  const bins = Math.max(1, parseInt(bins_per_bay, 10) || 1);
  return `R-${face}-L${lvl}-B${bay}-P${bins}`;
};

const parseRackCode = (code) => {
  const match = code?.match(/^R-(S|D)-L(\d+)-B(\d+)-P(\d+)$/);
  if (!match) return null;
  return {
    face_type: match[1] === 'D' ? 'double' : 'single',
    levels: parseInt(match[2], 10),
    bays: parseInt(match[3], 10),
    bins_per_bay: parseInt(match[4], 10)
  };
};

const validateRackInput = (data) => {
  const errors = [];
  const faceValid = data.face_type === 'single' || data.face_type === 'double';
  if (!faceValid) errors.push('face_type must be single or double');

  const asInt = (v) => Number.isInteger(v) && v > 0;
  const levels = parseInt(data.levels, 10);
  const bays = parseInt(data.bays, 10);
  const bins = parseInt(data.bins_per_bay, 10);

  if (!asInt(levels)) errors.push('levels must be a positive integer');
  if (!asInt(bays)) errors.push('bays must be a positive integer');
  if (!asInt(bins)) errors.push('bins_per_bay must be a positive integer');

  return { errors, levels, bays, bins };
};

const racksController = {
  getAll: async (req, res) => {
    try {
      const aisleId = req.params.aisleId;
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      const { racks, pagination } = await racksService.getAllPaginated(aisleId, page, limit, search);

      const formatted = racks.map((rack) => ({
        ...rack,
        created_at: formatDate(rack.created_at)
      }));

      res.json(apiResponse.paginatedResponse(formatted, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const rack = await racksService.getById(req.params.id);
      if (!rack) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }
      const formatted = { ...rack, created_at: formatDate(rack.created_at) };
      res.json(apiResponse.successResponse(formatted, 'Rack retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  create: async (req, res) => {
    try {
      const aisleId = req.params.aisleId;
      const { errors, levels, bays, bins } = validateRackInput(req.body);
      if (errors.length) {
        return res.status(400).json(apiResponse.errorResponse(errors.join(', ')));
      }

      const rack_code = buildRackCode({
        face_type: req.body.face_type,
        levels,
        bays,
        bins_per_bay: bins
      });

      const newRack = await racksService.create(aisleId, { rack_code });
      res.status(201).json(apiResponse.successResponse(newRack, 'Rack created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  update: async (req, res) => {
    try {
      const { errors, levels, bays, bins } = validateRackInput(req.body);
      if (errors.length) {
        return res.status(400).json(apiResponse.errorResponse(errors.join(', ')));
      }

      const rack_code = buildRackCode({
        face_type: req.body.face_type,
        levels,
        bays,
        bins_per_bay: bins
      });

      const result = await racksService.update(req.params.id, { rack_code });
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }
      res.json(apiResponse.successResponse(null, 'Rack updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const result = await racksService.delete(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }
      res.json(apiResponse.successResponse(null, 'Rack deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  getLayout: async (req, res) => {
    try {
      const rackId = req.params.id;
      const rack = await racksService.getById(rackId);
      if (!rack) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }

      const parsed = parseRackCode(rack.rack_code);
      if (!parsed) {
        return res.status(400).json(apiResponse.errorResponse('Invalid rack code format'));
      }

      const directions = parsed.face_type === 'double' ? ['R', 'L'] : ['R'];
      await RackSlot.ensureSlots(rackId, {
        directions,
        levels: parsed.levels,
        bays: parsed.bays,
        binsPerBay: parsed.bins_per_bay
      });

      const normalizeDir = (dir) => {
        const val = (dir || '').toString().toLowerCase();
        if (val === 'right' || val === 'r') return 'R';
        if (val === 'left' || val === 'l') return 'L';
        return (dir || '').toString().toUpperCase() || 'R';
      };

      const slots = await RackSlot.getSlotsWithStock(rackId);
      const mapped = slots.map((slot) => {
        const dirCode = normalizeDir(slot.direction);
        return {
          slot_id: slot.slot_id,
          direction: dirCode,
          bay_no: slot.bay_no,
          level_no: slot.level_no,
          bin_no: slot.bin_no,
          coordinate: `R${rackId}-${dirCode}-B${slot.bay_no}-L${slot.level_no}-P${slot.bin_no}`,
          stock: slot.stock_id ? {
            stock_id: slot.stock_id,
            product_id: slot.product_id,
            quantity: slot.quantity,
            batch_no: slot.batch_no,
            expiry_date: slot.expiry_date,
            strategy: slot.strategy,
            product_type: slot.product_type,
            is_consumable: !!slot.is_consumable,
            sale_price: slot.sale_price,
            cost_price: slot.cost_price
          } : null
        };
      });

      res.json(apiResponse.successResponse({
        rack: { ...rack, parsed },
        layout: {
          ...parsed,
          directions
        },
        slots: mapped
      }, 'Rack layout fetched'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  createStock: async (req, res) => {
    try {
      const rackId = req.params.id;
      const slotId = req.params.slotId;

      const slot = await RackSlot.getSlotById(slotId);
      if (!slot || `${slot.rack_id}` !== `${rackId}`) {
        return res.status(404).json(apiResponse.errorResponse('Slot not found for this rack'));
      }

      // Get rack to build coordinate string
      const rack = await racksService.getById(rackId);
      if (!rack) {
        return res.status(404).json(apiResponse.errorResponse('Rack not found'));
      }

      // Build slot_coordinates: rack_code-direction-bay-level-bin
      const dirCode = slot.direction === 'right' ? 'R' : (slot.direction === 'left' ? 'L' : slot.direction);
      const slot_coordinates = `${rack.rack_code}-${dirCode}-B${slot.bay_no}-L${slot.level_no}-P${slot.bin_no}`;
      console.log('Building slot_coordinates:', { rack_code: rack.rack_code, direction: slot.direction, dirCode, bay: slot.bay_no, level: slot.level_no, bin: slot.bin_no, slot_coordinates });

      const {
        product_id,
        quantity,
        batch_no,
        expiry_date,
        strategy = 'FIFO',
        product_type,
        is_consumable = false,
        sale_price,
        cost_price
      } = req.body;

      const errors = [];
      if (!product_id) errors.push('product_id is required');
      if (!quantity || parseInt(quantity, 10) <= 0) errors.push('quantity must be positive');
      if (!product_type || !Object.values(constants.PRODUCT_TYPES).includes(product_type)) {
        errors.push('Invalid product_type');
      }
      if (!['FIFO', 'LIFO', 'JIT'].includes(strategy)) {
        errors.push('Invalid strategy');
      }
      if (errors.length) {
        return res.status(400).json(apiResponse.errorResponse(errors.join(', ')));
      }

      const newStock = await Stock.create(slotId, {
        product_id,
        quantity,
        batch_no,
        expiry_date,
        strategy,
        product_type,
        is_consumable,
        sale_price,
        cost_price,
        slot_coordinates
      });

      res.status(201).json(apiResponse.successResponse(newStock, 'Stock created for slot'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  moveStock: async (req, res) => {
    try {
      const rackId = req.params.id;
      const { stockId, targetSlotId } = req.body;
      if (!stockId || !targetSlotId) {
        return res.status(400).json(apiResponse.errorResponse('stockId and targetSlotId are required'));
      }

      const targetSlot = await RackSlot.getSlotById(targetSlotId);
      if (!targetSlot || `${targetSlot.rack_id}` !== `${rackId}`) {
        return res.status(404).json(apiResponse.errorResponse('Target slot not found for this rack'));
      }

      const result = await Stock.moveToSlot(stockId, targetSlotId);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Stock not found'));
      }

      res.json(apiResponse.successResponse(null, 'Stock moved successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  updateStock: async (req, res) => {
    try {
      const stockId = req.params.stockId;
      const result = await Stock.update(stockId, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Stock not found'));
      }
      res.json(apiResponse.successResponse(null, 'Stock updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  deleteStock: async (req, res) => {
    try {
      const stockId = req.params.stockId;
      const result = await Stock.softDelete(stockId);
      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Stock not found'));
      }
      res.json(apiResponse.successResponse(null, 'Stock discarded successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  migrateStock: async (req, res) => {
    try {
      const { stockId, targetSlotId, rackCode } = req.body;
      if (!stockId || !targetSlotId) {
        return res.status(400).json(apiResponse.errorResponse('stockId and targetSlotId are required'));
      }

      const connection = db.promise();
      await connection.beginTransaction();
      try {
        const [stockRows] = await connection.query(
          'SELECT stock_id, product_id, slot_id, quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
          [stockId]
        );
        const stockRow = stockRows?.[0];
        if (!stockRow) {
          await connection.rollback();
          return res.status(404).json(apiResponse.errorResponse('Stock not found'));
        }

        // Get the target slot to build coordinates
        const targetSlot = await RackSlot.getSlotById(targetSlotId);
        if (!targetSlot) {
          await connection.rollback();
          return res.status(404).json(apiResponse.errorResponse('Target slot not found'));
        }

        // Check if slot is empty
        const slotsWithStock = await RackSlot.getSlotsWithStock(targetSlot.rack_id);
        const slotData = slotsWithStock.find(s => s.slot_id === parseInt(targetSlotId));
        if (slotData?.stock_id) {
          await connection.rollback();
          return res.status(400).json(apiResponse.errorResponse('Target slot is not empty'));
        }

        // Build new coordinates
        const dirCode = targetSlot.direction === 'right' ? 'R' : (targetSlot.direction === 'left' ? 'L' : targetSlot.direction);
        const newCoordinates = `${rackCode}-${dirCode}-B${targetSlot.bay_no}-L${targetSlot.level_no}-P${targetSlot.bin_no}`;

        const [updateResult] = await connection.query(
          'UPDATE stocks SET slot_id = ?, slot_coordinates = ?, last_updated = CURRENT_TIMESTAMP WHERE stock_id = ?',
          [targetSlotId, newCoordinates, stockId]
        );
        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json(apiResponse.errorResponse('Stock not found'));
        }

        // Record the move as a relocation/transfer depending on depot boundaries.
        await TransactionsService.createRelocation({
          stockId: stockRow.stock_id,
          productId: stockRow.product_id,
          fromSlotId: stockRow.slot_id,
          toSlotId: Number(targetSlotId),
          quantity: stockRow.quantity,
          note: `Stock migrated to ${newCoordinates}`,
          dbConn: connection
        });

        await connection.commit();

        res.json(apiResponse.successResponse(null, 'Stock migrated successfully'));
      } catch (innerError) {
        await connection.rollback();
        throw innerError;
      }
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  getStock: async (req, res) => {
    try {
      const stockId = req.params.stockId;
      const stock = await Stock.getById(stockId);
      if (!stock) {
        return res.status(404).json(apiResponse.errorResponse('Stock not found'));
      }
      res.json(apiResponse.successResponse(stock, 'Stock retrieved'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default racksController;
