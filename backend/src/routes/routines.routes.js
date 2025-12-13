import express from 'express';
import { 
  getAllRoutines, 
  createRoutine, 
  toggleRoutineStatus, 
  deleteRoutine,
  executeRoutine,
  getStats // <--- 1. IMPORT THIS
} from '../controllers/routines.controller.js';

const router = express.Router();

// 2. ADD THIS LINE AT THE TOP (Before the others)
router.get('/stats', getStats); 

router.get('/', getAllRoutines);
router.post('/', createRoutine);
router.patch('/:id/toggle', toggleRoutineStatus);
router.delete('/:id', deleteRoutine);
router.post('/:id/execute', executeRoutine);

export default router;