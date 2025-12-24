import express from 'express';
import { getTransactions , clearTransactions, createManualOutflow ,createManualInflow,
  createTransfer,
  createAdjustment,
  createRelocation,
  createConsumption,
  createStockInflow
} from '../controllers/transactions.controller.js';

const router = express.Router();

router.get('/', getTransactions);
router.delete('/clear', clearTransactions);
router.post('/manual-outflow', createManualOutflow);
router.post('/manual-inflow', createManualInflow);
router.post('/transfer', createTransfer);
router.post('/adjustment', createAdjustment);
router.post('/relocation', createRelocation);
router.post('/consumption', createConsumption);
router.post('/stock-inflow', createStockInflow);

export default router;
