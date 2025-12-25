import { Aisle } from '../models/aisles.model.js';
import { constants } from '../utils/constants.js';

const aislesService = {
  getAllPaginated: async (
    depotId,
    page = constants.PAGINATION.DEFAULT_PAGE,
    limit = constants.PAGINATION.DEFAULT_LIMIT,
    search = ''
  ) => {
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)),
      constants.PAGINATION.MAX_LIMIT
    );

    const [aisles, total] = await Promise.all([
      Aisle.getAllPaginated(depotId, validatedPage, validatedLimit, search),
      Aisle.getTotalCount(depotId, search)
    ]);

    return {
      aisles,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },

  getById: (id) => Aisle.getById(id),
  create: (depotId, data) => Aisle.create(depotId, data),
  update: (id, data) => Aisle.update(id, data),
  delete: (id) => Aisle.delete(id)
};

export default aislesService;
