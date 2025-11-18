import React, { useState } from 'react';

const ClientList = ({ 
  clients, 
  pagination, 
  onEdit, 
  onDelete, 
  onSearch, 
  onPageChange, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      onPageChange(newPage);
    }
  };

  if (loading && clients.length === 0) {
    return <div className="loading">Loading clients...</div>;
  }

  return (
    <div className="client-list">
      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">Search</button>
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Clients Table */}
      {clients.length === 0 ? (
        <div className="no-clients">
          {searchTerm ? 'No clients found matching your search.' : 'No clients found. Create your first client!'}
        </div>
      ) : (
        <>
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.client_id}>
                  <td className="client-name">{client.client_name}</td>
                  <td>{client.contact_email || '-'}</td>
                  <td>{client.contact_phone || '-'}</td>
                  <td className="client-address">
                    {client.address ? `${client.address.substring(0, 50)}${client.address.length > 50 ? '...' : ''}` : '-'}
                  </td>
                  <td className="client-created">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => onEdit(client)}
                      className="btn-edit"
                      disabled={loading}
                      title="Edit client"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${client.client_name}"?`)) {
                          onDelete(client.client_id);
                        }
                      }}
                      className="btn-delete"
                      disabled={loading}
                      title="Delete client"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="btn-pagination"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} total clients)
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="btn-pagination"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientList;