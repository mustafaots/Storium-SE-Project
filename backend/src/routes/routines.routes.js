import express from 'express';
import { 
  getAllRoutines, 
  createRoutine, 
  toggleRoutineStatus, 
  deleteRoutine,
  executeRoutine,
  getStats,
  getProductOptions // Make sure this is imported
} from '../controllers/routines.controller.js';

const router = express.Router();

// === STATIC ROUTES (Fixed Names) MUST BE FIRST ===
router.get('/stats', getStats);
router.get('/products', getProductOptions); // <--- This is the fix

// === DYNAMIC ROUTES (Variable IDs) MUST BE LAST ===
router.get('/', getAllRoutines);
router.post('/', createRoutine);
router.patch('/:id/toggle', toggleRoutineStatus);
router.delete('/:id', deleteRoutine);
router.post('/:id/execute', executeRoutine);

export default router;