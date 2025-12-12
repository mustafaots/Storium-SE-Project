import express from 'express';
import { 
  getAllRoutines, 
  createRoutine, 
  toggleRoutineStatus, 
  deleteRoutine 
} from '../controllers/routines.controller.js';

const router = express.Router();

router.get('/', getAllRoutines);
router.post('/', createRoutine);
router.patch('/:id/toggle', toggleRoutineStatus);
router.delete('/:id', deleteRoutine);

export default router;