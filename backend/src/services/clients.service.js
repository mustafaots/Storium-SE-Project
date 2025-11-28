import { Client } from '../models/clients.model.js';

const clientsService = {
  getAll: () => Client.getAll(),
  
  getById: (id) => Client.getById(id),
  
  create: (clientData) => Client.create(clientData),
  
  update: (id, clientData) => Client.update(id, clientData),
  
  delete: (id) => Client.delete(id)
};

export default clientsService;