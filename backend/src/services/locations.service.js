import { Location } from '../models/locations.model.js';
import { constants } from '../utils/constants.js';

const locationsService = {
  getAllPaginated: async (
    page = constants.PAGINATION.DEFAULT_PAGE,
    limit = constants.PAGINATION.DEFAULT_LIMIT,
    search = ''
  ) => {
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)),
      constants.PAGINATION.MAX_LIMIT
    );

    const [locations, total] = await Promise.all([
      Location.getAllPaginated(validatedPage, validatedLimit, search),
      Location.getTotalCount(search)
    ]);

    return {
      locations,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },

  getById: (id) => Location.getById(id),
  create: (data) => Location.create(data),
  update: (id, data) => Location.update(id, data),
  delete: (id) => Location.delete(id)
};

export default locationsService;
