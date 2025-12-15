import { Rack } from '../models/racks.model.js';
import { constants } from '../utils/constants.js';

const racksService = {
  getAllPaginated: async (
    aisleId,
    page = constants.PAGINATION.DEFAULT_PAGE,
    limit = constants.PAGINATION.DEFAULT_LIMIT,
    search = ''
  ) => {
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)),
      constants.PAGINATION.MAX_LIMIT
    );

    const [racks, total] = await Promise.all([
      Rack.getAllPaginated(aisleId, validatedPage, validatedLimit, search),
      Rack.getTotalCount(aisleId, search)
    ]);

    return {
      racks,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },

  getById: (id) => Rack.getById(id),
  create: (aisleId, data) => Rack.create(aisleId, data),
  update: (id, data) => Rack.update(id, data),
  delete: (id) => Rack.delete(id)
};

export default racksService;
