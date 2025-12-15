export const aislesHelpers = {
  formatDate: (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  validateAisle: (data, schema) => {
    const errors = {};
    Object.keys(schema).forEach((field) => {
      const rules = schema[field];
      for (const rule of rules) {
        const error = rule(data[field]);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    });
    return errors;
  }
};
