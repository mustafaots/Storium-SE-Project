import express from 'express';
import racksController from '../controllers/racks.controller.js';

const router = express.Router({ mergeParams: true });

// Nested under /locations/:locationId/depots/:depotId/aisles/:aisleId/racks
router.get('/', racksController.getAll);
router.get('/:id', racksController.getById);
router.post('/', racksController.create);
router.put('/:id', racksController.update);
router.delete('/:id', racksController.delete);

export default router;
