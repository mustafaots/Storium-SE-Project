// backend/src/services/clients.service.js
import { Client } from '../models/clients.model.js';
import { constants } from '../utils/constants.js';

const clientsService = {
  // Get paginated clients with total count (supports search)
  getAllPaginated: async (
    page = constants.PAGINATION.DEFAULT_PAGE,
    limit = constants.PAGINATION.DEFAULT_LIMIT,
    search = ''
  ) => {
    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)),
      constants.PAGINATION.MAX_LIMIT
    );

    const [clients, total] = await Promise.all([
      Client.getAllPaginated(validatedPage, validatedLimit, search),
      Client.getTotalCount(search)
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

  // Pass-through CRUD helpers
  getById: (id) => Client.getById(id),
  create: (clientData) => Client.create(clientData),
  update: (id, clientData) => Client.update(id, clientData),
  delete: (id) => Client.delete(id)
};

export default clientsService;
