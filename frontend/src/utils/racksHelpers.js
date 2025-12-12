export const racksHelpers = {
  formatDate: (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  buildRackCode: ({ face_type, levels, bays, bins_per_bay }) => {
    const face = face_type === 'double' ? 'D' : 'S';
    const lvl = Math.max(1, parseInt(levels, 10) || 1);
    const bay = Math.max(1, parseInt(bays, 10) || 1);
    const bins = Math.max(1, parseInt(bins_per_bay, 10) || 1);
    return `R-${face}-L${lvl}-B${bay}-P${bins}`;
  },

  parseRackCode: (code) => {
    const match = code?.match(/^R-(S|D)-L(\d+)-B(\d+)-P(\d+)$/);
    if (!match) return null;
    return {
      face_type: match[1] === 'D' ? 'double' : 'single',
      levels: parseInt(match[2], 10),
      bays: parseInt(match[3], 10),
      bins_per_bay: parseInt(match[4], 10)
    };
  },

  validateRack: ({ face_type, levels, bays, bins_per_bay }) => {
    const errors = {};

    if (face_type !== 'single' && face_type !== 'double') {
      errors.face_type = 'Choose single or double';
    }

    const requirePositiveInt = (value, label) => {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        errors[label] = 'Must be a positive integer';
      }
    };

    requirePositiveInt(levels, 'levels');
    requirePositiveInt(bays, 'bays');
    requirePositiveInt(bins_per_bay, 'bins_per_bay');

    return errors;
  }
};
