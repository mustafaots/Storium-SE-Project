import express from 'express';
import depotsController from '../controllers/depots.controller.js';
import aislesRoutes from './aisles.routes.js';

const router = express.Router({ mergeParams: true });

// Nested under /locations/:locationId/depots
router.get('/', depotsController.getAll);
router.get('/:id', depotsController.getById);
router.post('/', depotsController.create);
router.put('/:id', depotsController.update);
router.delete('/:id', depotsController.delete);

// Nested aisles
router.use('/:depotId/aisles', aislesRoutes);

export default router;
