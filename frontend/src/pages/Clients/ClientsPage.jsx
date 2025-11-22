
// Necessary imports
import { useState, useEffect } from 'react';
import { clientsAPI } from '../../utils/clientsAPI';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import ClientForm from '../../components/Layout/ClientsLayout/ClientForm';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import { FaUsers } from 'react-icons/fa';
import styles from './ClientsPage.module.css';

// Main ClientsPage component
function ClientsPage() {

  // The usual navbar item variable
  const activeItem = useActiveNavItem();

  // State variables for clients data and UI states
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

  // Define columns (headers) for the DataTable in Key-Value format (JSON)
  const clientColumns = [
    {
      key: 'client_id',
      header: 'ID',
      width: '80px'
    },
    {
      key: 'client_name',
      header: 'Name',
      render: (client) => <span className={styles.clientName}>
        {client.client_name}
        </span>
    },
    {
      key: 'contact_email',
      header: 'Email',
      render: (client) => client.contact_email || '-'
    },
    {
      key: 'contact_phone',
      header: 'Phone',
      render: (client) => client.contact_phone || '-'
    },
    {
      key: 'address',
      header: 'Address',
      render: (client) => <span className={styles.clientAddress}>
        {client.address || '-'}
        </span>
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (client) => <span className={styles.clientCreated}>
        {formatDate(client.created_at)}
        </span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <div className={styles.actions}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(client);
            }}
            className={styles.editButton}
            disabled={loading}
          >
            Edit
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(client.client_id);
            }}
            className={styles.deleteButton}
            disabled={loading}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // Load clients on component mount
  useEffect(  () => {loadClients();}  , [] );

  // Function to load clients from the API
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

  // Handlers for edit, delete, new client, form success, and cancel actions
  const handleEdit = (client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  };

  // Handler for deleting a client
  const handleDelete = async (id) => {
    try {
      await clientsAPI.delete(id);
      loadClients();
      setError('');
    } catch (err) {
      setError('Failed to delete client: ' + err.message);
    }
  };

  // Handler for creating a new client
  const handleNewClient = () => {
    setCurrentClient(null);
    setIsEditing(false);
    setShowForm(true);
    setError('');
  };

  // Handler for successful form submission
  const handleFormSuccess = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentClient(null);
    loadClients();
  };

  // Handler for cancelling the form
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentClient(null);
    setError('');
  };

  // Utility function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render the MAIN component
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>

          {showForm ? (
            <ClientForm
              isEditing={isEditing}
              currentClient={currentClient}
              loading={loading}
              error={error}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
              onError={setError}
            />
          ) : (
            <div className={styles.listContainer}>
              <Header
                title="CLIENT MANAGEMENT"
                subtitle="Manage your clients and their information"
                size="small"
                align="left"
                icon={<FaUsers size={30}/>}
              />

              <div className={styles.buttonContainer}>
                <Button onClick={handleNewClient} makes_sound={false}>
                  Add Client
                </Button>
              </div>

              <ErrorAlert error={error} onClose={() => setError('')} />

              {loading && clients.length === 0 ? (
                <LoadingState />
              ) : clients.length === 0 ? (
                <EmptyState onAddClient={handleNewClient} />
              ) : (
                <DataTable
                  data={clients}
                  columns={clientColumns}
                  keyField="client_id"
                  loading={loading}
                  emptyMessage="No clients found"
                  className={styles.clientsTable}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <NavBar activeItem={activeItem} />
    </div>
  );
}

// Sub-component for error alert
const ErrorAlert = ({ error, onClose }) => (
  error && (
    <div className={styles.errorAlert}>
      <div className={styles.errorContent}>
        <span className={styles.errorMessage}>{error}</span>
        <button onClick={onClose} className={styles.closeBtn}>×</button>
      </div>
    </div>
  )
);

// Loading state component
const LoadingState = () => (
  <div className={styles.loadingState}>
    <div className={styles.loadingContent}>
      <h2>Loading Clients...</h2>
      <p>Please wait while we fetch your client data</p>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ onAddClient }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyContent}>
      <h2>No Clients Found</h2>
      <p>Create your first client to get started</p>
      <button onClick={onAddClient} className={styles.primaryButton}>
        Add Your First Client
      </button>
    </div>
  </div>
);

export default ClientsPage;