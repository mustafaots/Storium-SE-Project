// src/utils/productsHelpers.js

export const productsHelpers = {
  // Normalize a product row (ensure sku and total exist)
  normalize: (p) => ({
    ...p,
    sku: p.sku || `SKU-${String(p.product_id).padStart(4, '0')}`,
    total: p.total ?? p.total_stock ?? 0
  }),

  // Format price-like numbers (if you add price later)
  formatPrice: (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    return n.toFixed(2);
  },

  // Format date
  formatDate: (isoString) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return isoString; }
  },

  // Short initials for product (for avatar circles)
  initials: (name) => {
    if (!name) return 'PR';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  // Filter product list by search term (client-side fallback)
  filterProducts: (products, term) => {
    if (!term || !String(term).trim()) return products;
    const t = String(term).toLowerCase();
    return (products || []).filter(p =>
      (p.name || '').toLowerCase().includes(t) ||
      (p.sku || '').toLowerCase().includes(t) ||
      (p.category || '').toLowerCase().includes(t)
    );
  }
};

export default productsHelpers;
