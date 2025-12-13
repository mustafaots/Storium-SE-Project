/**
 * Utility functions to format data consistently
 * This ensures all dates, currencies, and numbers look the same everywhere
 */

// Format currency for display
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

// Format numbers with thousands separators
const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number || 0);
};

// Format date to readable string
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format phone number for display
const formatPhone = (phone) => {
  if (!phone) return phone;
  
  // Format 10-digit numbers as 4-2-2-2 blocks (e.g., 0556 26 88 76)
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }

  return phone; // Fallback: return as-is for other lengths
};

// Truncate long text with ellipsis
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export {
  formatCurrency,
  formatNumber,
  formatDate,
  formatPhone,
  truncateText
};