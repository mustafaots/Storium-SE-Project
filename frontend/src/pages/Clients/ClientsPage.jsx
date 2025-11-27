// Necessary imports
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import ClientForm from '../../components/Layout/ClientsLayout/ClientForm';
import { FaUsers } from 'react-icons/fa';

// Local imports
import { useClients } from '../../hooks/useClients';
import { clientsHandlers } from '../../handlers/clientsHandlers';
import { clientsConfig } from '../../config/clientsConfig';
import { clientsController } from '../../controllers/clientsController';
import styles from './ClientsPage.module.css';

// Main ClientsPage component
function ClientsPage() {
  const activeItem = useActiveNavItem();
  
  // Use clients hook for state management
  const {
    clients,
    loading,
    error,
    showForm,
    isEditing,
    currentClient,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentClient,
    loadClients,
    deleteClient
  } = useClients();

  // Handler functions
  const handlers = {
    onEdit: (client) => clientsHandlers.handleEdit(
      client, setCurrentClient, setIsEditing, setShowForm, setError
    ),
    
    onNewClient: () => clientsHandlers.handleNewClient(
      setCurrentClient, setIsEditing, setShowForm, setError
    ),
    
    onFormSuccess: () => clientsHandlers.handleFormSuccess(
      setShowForm, setIsEditing, setCurrentClient, loadClients
    ),
    
    onCancel: () => clientsHandlers.handleCancel(
      setShowForm, setIsEditing, setCurrentClient, setError
    ),
    
    onDelete: (id) => clientsHandlers.handleDelete(id, deleteClient),
    
    onCreate: (formData) => clientsController.createClient(
      formData, () => {}, setError, handlers.onFormSuccess
    ),
    
    onUpdate: (formData) => clientsController.updateClient(
      currentClient.client_id, formData, () => {}, setError, handlers.onFormSuccess
    )
  };

  // Get table columns configuration
  const clientColumns = clientsConfig.columns(styles, handlers);

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
              onSuccess={handlers.onFormSuccess}
              onCancel={handlers.onCancel}
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
                <Button onClick={handlers.onNewClient} makes_sound={false}>
                  Add Client
                </Button>
              </div>

              <ErrorAlert error={error} onClose={() => setError('')} />

              {loading && clients.length === 0 ? (
                <LoadingState />
              ) : clients.length === 0 ? (
                <EmptyState onAddClient={handlers.onNewClient} />
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

// Sub-components (keep these in the same file as they're UI-specific)
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

const LoadingState = () => (
  <div className={styles.loadingState}>
    <div className={styles.loadingContent}>
      <h2>Loading Clients...</h2>
      <p>Please wait while we fetch your client data</p>
    </div>
  </div>
);

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