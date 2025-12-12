// src/utils/sourcesHelpers.js

export const sourcesHelpers = {
  // Normalize a source row
  normalize: (s) => ({
    ...s,
    source_name: s.source_name || 'Unknown Source',
    contact_email: s.contact_email || '',
    contact_phone: s.contact_phone || '',
    address: s.address || '',
    coordinates: s.coordinates || '',
    rating: s.rating ?? 0,
    is_active: s.is_active ?? true
  }),

  // Format rating with star
  formatRating: (rating) => {
    if (rating === null || rating === undefined || rating === '') return '-';
    const num = Number(rating);
    if (Number.isNaN(num)) return '-';
    return `⭐ ${num.toFixed(1)}`;
  },

  // Get rating color
  getRatingColor: (rating) => {
    if (!rating) return '#999';
    if (rating >= 4.5) return '#4CAF50'; // Green
    if (rating >= 4.0) return '#FFC107'; // Yellow
    if (rating >= 3.0) return '#FF9800'; // Orange
    return '#FF5722'; // Red
  },

  // Format date
  formatDate: (isoString) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return isoString; }
  },
  

  // Short initials for source (for avatar circles)
  initials: (name) => {
    if (!name) return 'SO';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },
//format phone 
formatPhone: (phone) => {
    if (!phone) return '-';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    return phone;
  },
  // Format status
  formatStatus: (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  },

  // Filter source list by search term (client-side fallback)
  filterSources: (sources, term) => {
    if (!term || !String(term).trim()) return sources;
    const t = String(term).toLowerCase();
    return (sources || []).filter(s =>
      (s.source_name || '').toLowerCase().includes(t) ||
      (s.contact_email || '').toLowerCase().includes(t) ||
      (s.contact_phone || '').toLowerCase().includes(t) ||
      (s.address || '').toLowerCase().includes(t)
    );
  },

  // Truncate text
  truncate: (text, maxLength = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

export default sourcesHelpers;