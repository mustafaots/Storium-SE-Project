// Utility functions for clients
export const clientsHelpers = {
  // Format date
  formatDate: (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Get client initials (for avatars, etc.)
  getInitials: (clientName) => {
    if (!clientName) return '??';
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Validate client data
  validateClient: (clientData) => {
    const errors = {};
    if (!clientData.client_name?.trim()) {
      errors.client_name = 'Client name is required';
    }
    return errors;
  },

  // Format phone for display: 4-2-2-2 grouping (e.g., 0556 26 88 76)
  formatPhone: (phone) => {
    if (!phone) return '-';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }
    return phone;
  },

  // Filter clients by search term
  filterClients: (clients, searchTerm) => {
    if (!searchTerm.trim()) return clients;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.client_name?.toLowerCase().includes(lowercasedTerm) ||
      client.contact_email?.toLowerCase().includes(lowercasedTerm) ||
      client.contact_phone?.toLowerCase().includes(lowercasedTerm) ||
      client.address?.toLowerCase().includes(lowercasedTerm)
    );
  }
};