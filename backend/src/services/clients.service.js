import { Client } from '../models/clients.model.js';
import { constants } from '../utils/constants.js';

const clientsService = {
  // Keep existing method for backward compatibility
  getAll: () => Client.getAll(),
  
  // NEW: Get paginated clients with total count
  getAllPaginated: async (page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT) => {
    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)), 
      constants.PAGINATION.MAX_LIMIT
    );
    
    const [clients, total] = await Promise.all([
      Client.getAllPaginated(validatedPage, validatedLimit),
      Client.getTotalCount()
    ]);
    
    return {
      clients,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },
  
  // Keep existing methods unchanged
  getById: (id) => Client.getById(id),
  create: (clientData) => Client.create(clientData),
  update: (id, clientData) => Client.update(id, clientData),
  delete: (id) => Client.delete(id)
};

export default clientsService;