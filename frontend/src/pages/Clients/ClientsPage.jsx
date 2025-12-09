// Clients page: wires search, pagination, and CRUD handlers into the shared DataTable
import { useEffect } from 'react';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import ClientForm from '../../components/Layout/ClientsLayout/ClientForm';
import { FaUsers, FaFile, FaUserPlus } from 'react-icons/fa';

// Local imports
import { useClients } from '../../hooks/useClients';
import { clientsHandlers } from '../../handlers/clientsHandlers';
import { clientsConfig } from '../../config/clientsConfig';
import { clientsController } from '../../controllers/clientsController';
import useTableSearch from '../../hooks/useTableSearch'; // ← ADD this import
import styles from './ClientsPage.module.css';

function ClientsPage() {
  const activeItem = useActiveNavItem();
  
  const {
    clients,
    loading,
    error,
    showForm,
    isEditing,
    currentClient,
    pagination,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentClient,
    loadClients,
    deleteClient,
    handlePageChange,
    handlePageSizeChange
  } = useClients();

  // Track search term with debounce so we don't spam requests
  const search = useTableSearch('');

  // When debounced search changes, reload from page 1 with current page size
  useEffect(() => {
    loadClients(1, pagination.pageSize, search.debouncedSearch);
  }, [search.debouncedSearch, loadClients, pagination.pageSize]);

  // Centralized handlers so child components stay dumb
  const handlers = {
    onEdit: (client) => clientsHandlers.handleEdit(
      client, setCurrentClient, setIsEditing, setShowForm, setError
    ),
    
    onNewClient: () => clientsHandlers.handleNewClient(
      setCurrentClient, setIsEditing, setShowForm, setError
    ),
    
    onFormSuccess: () => clientsHandlers.handleFormSuccess(
      setShowForm, setIsEditing, setCurrentClient, 
      () => loadClients(pagination.currentPage, pagination.pageSize, search.debouncedSearch) // ← UPDATE this
    ),
    
    onCancel: () => clientsHandlers.handleCancel(
      setShowForm, setIsEditing, setCurrentClient, setError
    ),
    
    onDelete: (id) => clientsHandlers.handleDelete(id, deleteClient, () => 
      loadClients(pagination.currentPage, pagination.pageSize, search.debouncedSearch) // ← UPDATE this
    ),
    
    onCreate: (formData) => clientsController.createClient(
      formData, () => {}, setError, handlers.onFormSuccess
    ),
    
    onUpdate: (formData) => clientsController.updateClient(
      currentClient.client_id, formData, () => {}, setError, handlers.onFormSuccess
    ),

    onPageChange: (page) => handlePageChange(page, search.debouncedSearch),
    onPageSizeChange: (size) => handlePageSizeChange(size, search.debouncedSearch)
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

              <ErrorAlert error={error} onClose={() => setError('')} />

              {loading && clients.length === 0 ? (
                <LoadingState />
              ) : (
                <>
                  <DataTable
                    data={clients}
                    columns={clientColumns}
                    keyField="client_id"
                    loading={loading}
                    emptyMessage={search.debouncedSearch ? 'No clients found for this search' : 'No clients found'}
                    className={styles.clientsTable}
                    // Pagination props
                    pagination={pagination}
                    onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
                    onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
                    showPagination={true}
                    // Search props
                    showSearch={true}
                    searchPlaceholder="Search clients..."
                    onSearchChange={search.setSearchTerm}
                    searchTerm={search.searchTerm}
                    rightControls={(
                      <div className={styles.buttonGroupInline}>
                        <Button variant='secondary' leadingIcon={<FaUserPlus />} onClick={handlers.onNewClient}>
                          Add
                        </Button>
                        <Button 
                          onClick={()=>{}}
                          variant="primary"
                          leadingIcon={<FaFile />}
                        >
                          Export
                        </Button>
                      </div>
                    )}
                  />

                  {/* NEW: Separate container for pagination info */}
                  {pagination.totalCount > 0 && (
                    <div className={styles.paginationInfoContainer}>
                      <div className={styles.paginationInfo}>
                        <span className={styles.resultsText}>
                          Showing <strong>{(pagination.currentPage - 1) * pagination.pageSize + 1}</strong> to <strong>{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}</strong> of <strong>{pagination.totalCount}</strong> clients
                        </span>
                        {search.debouncedSearch && (
                          <span className={styles.searchInfo}>
                            matching "<strong>{search.debouncedSearch}</strong>"
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Buttons now live inline with the search bar via rightControls */}
                </>
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

export default ClientsPage;