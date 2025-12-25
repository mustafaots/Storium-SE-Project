import { Depot } from '../models/depots.model.js';
import { constants } from '../utils/constants.js';

const depotsService = {
  getAllPaginated: async (
    locationId,
    page = constants.PAGINATION.DEFAULT_PAGE,
    limit = constants.PAGINATION.DEFAULT_LIMIT,
    search = ''
  ) => {
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)),
      constants.PAGINATION.MAX_LIMIT
    );

    const [depots, total] = await Promise.all([
      Depot.getAllPaginated(locationId, validatedPage, validatedLimit, search),
      Depot.getTotalCount(locationId, search)
    ]);

    return {
      depots,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },

  getById: (id) => Depot.getById(id),
  create: (locationId, data) => Depot.create(locationId, data),
  update: (id, data) => Depot.update(id, data),
  delete: (id) => Depot.delete(id)
};

export default depotsService;
