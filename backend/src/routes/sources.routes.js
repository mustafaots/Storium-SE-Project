import express from 'express';
import sourcesController from '../controllers/sources.controller.js';
import validateSources from '../middleware/special_validators/validateSources.js';

const router = express.Router();

router.get('/', sourcesController.getAllSources);
router.get('/:id', sourcesController.getSourceById);

router.post('/', validateSources, sourcesController.createSource);
router.put('/:id', validateSources, sourcesController.updateSource);

router.delete('/:id', sourcesController.deleteSource);

export default router;
