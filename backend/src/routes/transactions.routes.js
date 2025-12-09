import express from 'express';
import { getTransactions , createManualOutflow ,createManualInflow,
  createTransfer,
  createAdjustment
} from '../controllers/transactions.controller.js';

const router = express.Router();

router.get('/', getTransactions);
router.post('/manual-outflow', createManualOutflow);
router.post('/manual-inflow', createManualInflow);
router.post('/transfer', createTransfer);
router.post('/adjustment', createAdjustment);

export default router;
