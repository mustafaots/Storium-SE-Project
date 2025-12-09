// Clients page: wires search, pagination, and CRUD handlers into the shared DataTable
import { useEffect, useState } from 'react';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import ClientForm from '../../components/Layout/ClientsLayout/ClientForm';
import { FaUsers, FaFile, FaUserPlus } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Local imports
import { useClients } from '../../hooks/useClients';
import { clientsHandlers } from '../../handlers/clientsHandlers';
import { clientsConfig } from '../../config/clientsConfig';
import { clientsController } from '../../controllers/clientsController';
import useTableSearch from '../../hooks/useTableSearch';
import { clientsHelpers } from '../../utils/clientsHelpers';
import { clientsAPI } from '../../utils/clientsAPI';
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

  const [showExportMenu, setShowExportMenu] = useState(false);
  // Export scope separates "what" to export from "how" (CSV/PDF): current view vs full dataset
  const [exportScope, setExportScope] = useState('current'); // 'current' | 'all'

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

  // Export helpers
  // Column definitions reused by CSV/PDF so both formats stay in sync
  const exportHeaders = [
    { key: 'client_id', label: 'ID' },
    { key: 'client_name', label: 'Name' },
    { key: 'contact_email', label: 'Email' },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'created_at', label: 'Created' },
  ];

  // Normalize client rows for export and format fields for display parity
  const buildExportRows = (source) => source.map((client) => ({
    client_id: client.client_id,
    client_name: client.client_name || '',
    contact_email: client.contact_email || '',
    contact_phone: clientsHelpers.formatPhone(client.contact_phone),
    address: client.address || '',
    created_at: clientsHelpers.formatDate(client.created_at),
  }));

  // CSV export: choose data based on scope, then serialize and download as a Blob
  const exportToCSV = async () => {
    const rows = exportScope === 'current'
      ? buildExportRows(clients)
      : await fetchAllClientsForExport();
    if (!rows.length) return;

    const escape = (value) => {
      const str = String(value ?? '');
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headerLine = exportHeaders.map((h) => escape(h.label)).join(',');
    const lines = rows.map((row) => exportHeaders.map((h) => escape(row[h.key])).join(','));
    const csv = [headerLine, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients.csv';
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // PDF export: choose data based on scope, render with jsPDF+autotable, download directly
  const exportToPDF = async () => {
    const rows = exportScope === 'current'
      ? buildExportRows(clients)
      : await fetchAllClientsForExport();
    if (!rows.length) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Clients', 40, 40);

    const head = [exportHeaders.map((h) => h.label)];
    const body = rows.map((row) => exportHeaders.map((h) => row[h.key] ?? ''));

    doc.autoTable({
      head,
      body,
      startY: 60,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [54, 57, 63] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save('clients.pdf');
    setShowExportMenu(false);
  };

  // Fetch all clients (ignoring pagination/search) for full export when scope = "all"
  const fetchAllClientsForExport = async () => {
    try {
      const pageSize = 500;
      let page = 1;
      let all = [];
      let total = Infinity;

      while (all.length < total) {
        const response = await clientsAPI.getAll(page, pageSize, '');
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch clients');
        }
        all = all.concat(response.data || []);
        total = response.pagination?.total ?? all.length;
        if (!response.data || response.data.length === 0) break;
        page += 1;
      }

      return buildExportRows(all);
    } catch (err) {
      setError(err.message || 'Failed to export clients');
      return [];
    }
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
                        <select
                          className={styles.exportScopeSelect}
                          value={exportScope}
                          onChange={(e) => setExportScope(e.target.value)}
                        >
                          <option value="current">Current view</option>
                          <option value="all">All clients</option>
                        </select>
                        <div className={styles.exportWrapper}>
                          <Button 
                            onClick={() => setShowExportMenu((prev) => !prev)}
                            variant="primary"
                            leadingIcon={<FaFile />}
                          >
                            Export
                          </Button>
                          {showExportMenu && (
                            <div className={styles.exportMenu}>
                              <button onClick={exportToCSV}>Export CSV</button>
                              <button onClick={exportToPDF}>Export PDF</button>
                            </div>
                          )}
                        </div>
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