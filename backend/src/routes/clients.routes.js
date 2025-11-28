import express from 'express';
import clientsController from '../controllers/clients.controller.js';
import validateClients from '../middleware/special_validators/validateClients.js';

const router = express.Router();

// GET /api/clients?page=1&limit=10&search=term
router.get('/', clientsController.getAllClients);
router.get('/:id', clientsController.getClientById);

router.post('/', validateClients, clientsController.createClient);
router.put('/:id', validateClients, clientsController.updateClient);

router.delete('/:id', clientsController.deleteClient);

export default router;