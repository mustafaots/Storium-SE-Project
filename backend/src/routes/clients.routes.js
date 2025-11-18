const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');

// GET /api/clients - Get all clients with pagination & search
router.get('/', clientsController.getAllClients);

// GET /api/clients/list - Get simple client list for dropdowns
router.get('/list', clientsController.getClientList);

// GET /api/clients/:id - Get single client by ID
router.get('/:id', clientsController.getClientById);

// POST /api/clients - Create new client
router.post('/', clientsController.createClient);

// PUT /api/clients/:id - Update client
router.put('/:id', clientsController.updateClient);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', clientsController.deleteClient);

module.exports = router;