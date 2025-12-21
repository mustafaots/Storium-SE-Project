import express from 'express';
// Import functions exactly as named in the controller above
import { getAlerts, markRead, markAllAsRead, deleteAlert, createAlert } from '../controllers/alerts.controller.js';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', createAlert); // Added this to prevent "export not found" error
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteAlert);

export default router;