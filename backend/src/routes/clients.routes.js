import express from 'express';
import { clientsController } from '../controllers/clients.controller.js';

const router = express.Router();

router.get('/', clientsController.getAllClients);
router.get('/:id', clientsController.getClientById);
router.post('/', clientsController.createClient);
router.put('/:id', clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

export default router;