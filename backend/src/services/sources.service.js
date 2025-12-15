// backend/src/services/sources.service.js
import { Source } from '../models/sources.model.js';
import { constants } from '../utils/constants.js';

const sourcesService = {
  // Keep existing method for backward compatibility
  getAll: () => Source.getAll(),

  // Get paginated sources with total count (supports search)
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

    const [sources, total] = await Promise.all([
      Source.getAllPaginated(validatedPage, validatedLimit, search),
      Source.getTotalCount(search)
    ]);

    return {
      sources,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },

  // Pass-through CRUD helpers
  getById: (id) => Source.getById(id),
  create: (sourceData) => Source.create(sourceData),
  update: (id, sourceData) => Source.update(id, sourceData),
  delete: (id) => Source.delete(id)
};

export default sourcesService;
