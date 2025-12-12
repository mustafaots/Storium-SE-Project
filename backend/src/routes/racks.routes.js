import express from 'express';
import racksController from '../controllers/racks.controller.js';

const router = express.Router({ mergeParams: true });

// Nested under /locations/:locationId/depots/:depotId/aisles/:aisleId/racks
router.get('/', racksController.getAll);
router.get('/:id/layout', racksController.getLayout);
router.get('/:id', racksController.getById);
router.post('/', racksController.create);
router.put('/:id', racksController.update);
router.delete('/:id', racksController.delete);

router.post('/:id/slots/:slotId/stocks', racksController.createStock);
router.patch('/:id/stocks/move', racksController.moveStock);
router.get('/stocks/:stockId', racksController.getStock);
router.put('/stocks/:stockId', racksController.updateStock);
router.delete('/stocks/:stockId', racksController.deleteStock);
router.patch('/stocks/migrate', racksController.migrateStock);

export default router;
