import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../../utils/clientsAPI'; // Use the actual API service

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsAPI.getAll();
      setClients(data);
      setError('');
    } catch (err) {
      setError('Failed to load clients: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await clientsAPI.create(formData);
      setFormData({ client_name: '', contact_email: '', contact_phone: '', address: '' });
      setShowForm(false);
      loadClients(); // Reload the list
      setError('');
    } catch (err) {
      setError('Failed to create client: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsAPI.delete(id);
        loadClients(); // Reload the list
        setError('');
      } catch (err) {
        setError('Failed to delete client: ' + err.message);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>CLIENT MANAGEMENT</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', margin: '10px 0', border: '1px solid red' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '10px' }}>×</button>
        </div>
      )}

      {!showForm ? (
        <div>
          <button 
            onClick={() => setShowForm(true)}
            disabled={loading}
            style={{ padding: '10px 20px', marginBottom: '20px' }}
          >
            Add New Client
          </button>

          {loading ? (
            <div>Loading clients...</div>
          ) : (
            <div>
              <h2>Clients ({clients.length})</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.client_id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.client_id}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.client_name}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.contact_email}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.contact_phone}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button 
                          onClick={() => handleDelete(client.client_id)}
                          style={{ padding: '5px 10px', backgroundColor: '#ff4444', color: 'white' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Create New Client</h2>
          <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Client Name *"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="email"
                placeholder="Contact Email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="tel"
                placeholder="Contact Phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '8px', height: '60px' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '10px 20px', marginRight: '10px' }}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              disabled={loading}
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;