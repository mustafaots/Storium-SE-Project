// src/controllers/sourcesController.js
export const sourcesController = {
  loadSources: async (setData, setLoading, setError, setPagination, page, pageSize, search) => {
    setLoading(true);
    setError('');
    try {
      const mockData = [
        { 
          source_id: 1, 
          source_name: 'Tech Solutions Inc.',
          contact_email: 'contact@techsolutions.com',
          contact_phone: '+1 (555) 123-4567',
          address: '123 Tech Street, Silicon Valley, CA 94025',
          coordinates: '37.3688° N, 122.0363° W',
          rating: 4.8,
          is_active: true,
          created_at: new Date().toISOString()
        },
        { 
          source_id: 2, 
          source_name: 'Global Coffee Traders',
          contact_email: 'info@globalcoffee.com',
          contact_phone: '+1 (555) 234-5678',
          address: '456 Coffee Lane, Portland, OR 97201',
          coordinates: '45.5152° N, 122.6784° W',
          rating: 4.5,
          is_active: true,
          created_at: new Date().toISOString()
        },
        { 
          source_id: 3, 
          source_name: 'FitGear Supplies',
          contact_email: 'sales@fitgear.com',
          contact_phone: '+1 (555) 345-6789',
          address: '789 Fitness Ave, Austin, TX 78701',
          coordinates: '30.2672° N, 97.7431° W',
          rating: 4.3,
          is_active: true,
          created_at: new Date().toISOString()
        },
        { 
          source_id: 4, 
          source_name: 'Office Essentials Co.',
          contact_email: 'support@officeessentials.com',
          contact_phone: '+1 (555) 456-7890',
          address: '321 Business Blvd, New York, NY 10001',
          coordinates: '40.7128° N, 74.0060° W',
          rating: 4.6,
          is_active: true,
          created_at: new Date().toISOString()
        },
        { 
          source_id: 5, 
          source_name: 'SportWear Distributors',
          contact_email: 'orders@sportwear.com',
          contact_phone: '+1 (555) 567-8901',
          address: '654 Athletic Road, Denver, CO 80202',
          coordinates: '39.7392° N, 104.9903° W',
          rating: 4.7,
          is_active: true,
          created_at: new Date().toISOString()
        },
        { 
          source_id: 6, 
          source_name: 'Euro Imports Ltd.',
          contact_email: 'contact@euroimports.eu',
          contact_phone: '+44 20 7946 0958',
          address: '12 London Bridge Street, London, UK SE1 9SG',
          coordinates: '51.5074° N, 0.1278° W',
          rating: 4.2,
          is_active: false,
          created_at: new Date().toISOString()
        }
      ];

      const filtered = search
        ? mockData.filter(s =>
            s.source_name.toLowerCase().includes(search.toLowerCase()) ||
            (s.contact_email || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.address || '').toLowerCase().includes(search.toLowerCase())
          )
        : mockData;

      setData(filtered);

      setPagination({
        currentPage: page,
        pageSize: pageSize,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize)
      });

      return undefined;
      
    } catch (err) {
      setError('Failed to load sources');
      console.error('Load sources error:', err);
    } finally {
      setLoading(false);
    }
  },

  deleteSource: async (id, onSuccess, onError) => {
    try {
      console.log('Deleted source id:', id);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err?.message);
    }
  }
};