import express from 'express';
import locationsController from '../controllers/locations.controller.js';
import depotsRoutes from './depots.routes.js';

const router = express.Router();

// GET /api/locations?page=1&limit=10&search=term
router.get('/', locationsController.getAll);
router.get('/:id', locationsController.getById);

router.post('/', locationsController.create);
router.put('/:id', locationsController.update);

router.delete('/:id', locationsController.delete);

// Nested depots
router.use('/:locationId/depots', depotsRoutes);

export default router;
