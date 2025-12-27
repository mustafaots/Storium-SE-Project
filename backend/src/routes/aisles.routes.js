import express from 'express';
import aislesController from '../controllers/aisles.controller.js';
import racksRoutes from './racks.routes.js';

const router = express.Router({ mergeParams: true });

// Nested under /locations/:locationId/depots/:depotId/aisles
router.get('/', aislesController.getAll);
router.get('/:id', aislesController.getById);
router.post('/', aislesController.create);
router.put('/:id', aislesController.update);
router.delete('/:id', aislesController.delete);

// Nested racks under aisles
router.use('/:aisleId/racks', racksRoutes);

export default router;
