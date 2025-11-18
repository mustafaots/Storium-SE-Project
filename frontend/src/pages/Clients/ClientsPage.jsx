import React, { useState, useEffect } from 'react';
import { useClientController } from '../../controllers/clientController'; // Frontend React hook
import ClientList from '../../components/Layout/ClientsLayout/ClientList';
import ClientForm from '../../components/Layout/ClientsLayout/ClientForm';
import ErrorAlert from '../../components/UI/ErrorAlert/ErrorAlert';
import styles from './ClientsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

function ClientsPage() {
  const activeItem = useActiveNavItem();
  const {
    clients,
    currentClient,
    loading,
    error,
    pagination,
    actions,
  } = useClientController();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    actions.loadClients({ page: 1, limit: 10 });
  }, [actions]);

  const handleCreateClient = async (clientData) => {
    try {
      await actions.createClient(clientData);
      setShowForm(false);
      actions.clearError();
    } catch (error) {
      // Error is handled by controller
    }
  };

  const handleUpdateClient = async (clientData) => {
    try {
      await actions.updateClient(currentClient.client_id, clientData);
      setShowForm(false);
      setIsEditing(false);
      actions.clearCurrentClient();
      actions.clearError();
    } catch (error) {
      // Error is handled by controller
    }
  };

  const handleEditClient = (client) => {
    actions.clearError();
    actions.loadClient(client.client_id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await actions.deleteClient(clientId);
      actions.clearError();
    } catch (error) {
      // Error is handled by controller
    }
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    actions.loadClients({ 
      page: 1, 
      limit: pagination.limit, 
      search: search || undefined 
    });
  };

  const handlePageChange = (newPage) => {
    actions.loadClients({ 
      page: newPage, 
      limit: pagination.limit, 
      search: searchTerm || undefined 
    });
  };

  const handleNewClient = () => {
    actions.clearError();
    actions.clearCurrentClient();
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    actions.clearCurrentClient();
    actions.clearError();
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>CLIENT MANAGEMENT</h1>
            <p className={styles.subtitle}>Manage your clients and their information</p>
            
            {!showForm && (
              <button 
                onClick={handleNewClient}
                className={styles.primaryButton}
                disabled={loading}
              >
                Add New Client
              </button>
            )}
          </header>

          <ErrorAlert error={error} onClose={actions.clearError} />

          {showForm ? (
            <div className={styles.formSection}>
              <h2>{isEditing ? 'Edit Client' : 'Create New Client'}</h2>
              <ClientForm
                client={currentClient}
                onSubmit={isEditing ? handleUpdateClient : handleCreateClient}
                onCancel={handleCancelForm}
                loading={loading}
              />
            </div>
          ) : (
            <div className={styles.listSection}>
              <div className={styles.sectionHeader}>
                <h2>Clients ({pagination.total})</h2>
              </div>
              <ClientList
                clients={clients}
                pagination={pagination}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onSearch={handleSearch}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
      <NavBar activeItem={activeItem} />
    </div>
  );
}

export default ClientsPage;