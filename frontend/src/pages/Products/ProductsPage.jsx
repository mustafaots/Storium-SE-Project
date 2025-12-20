// src/pages/ProductsPage.jsx
import { useEffect, useState, useRef } from 'react';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import ProductForm from '../../components/Layout/ProductLayout/ProductForm';
import { FaBox, FaFile, FaPlus } from 'react-icons/fa';
import { exportToCSV, exportToPDF } from '../../utils/export';


import { useProducts } from '../../hooks/useProducts';
import { productsHandlers } from '../../handlers/productsHandlers';
import { productsConfig } from '../../config/productsConfig';
import useTableSearch from '../../hooks/useTableSearch';
import { productsAPI } from '../../utils/productsAPI';
import { productsHelpers } from '../../utils/productsHelpers';
import styles from './ProductsPage.module.css';

function ProductsPage() {
  const activeItem = useActiveNavItem();

  const {
    products,
    loading,
    error,
    showForm,
    isEditing,
    currentProduct,
    pagination,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentProduct,
    loadProducts,
    deleteProduct,
    handlePageChange,
    handlePageSizeChange
  } = useProducts();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportScope, setExportScope] = useState('current');
  const search = useTableSearch('');
  const hasInitialLoaded = useRef(false);

  // Initial load
  useEffect(() => {
    if (!hasInitialLoaded.current) {
      hasInitialLoaded.current = true;
      loadProducts(1, pagination.pageSize, '');
    }
  }, [loadProducts, pagination.pageSize]);

  // Reload when search changes
  useEffect(() => {
    loadProducts(1, pagination.pageSize, search.debouncedSearch);
  }, [search.debouncedSearch, loadProducts, pagination.pageSize]);

  // Handlers
  const handlers = {
    onEdit: (product) => productsHandlers.handleEdit(product, setCurrentProduct, setIsEditing, setShowForm, setError),
    onNewProduct: () => productsHandlers.handleNew(setCurrentProduct, setIsEditing, setShowForm, setError),
    onFormSuccess: () => productsHandlers.handleFormSuccess(
      setShowForm,
      setIsEditing,
      setCurrentProduct,
      () => loadProducts(pagination.currentPage, pagination.pageSize, search.debouncedSearch)
    ),
    onCancel: () => productsHandlers.handleCancel(setShowForm, setIsEditing, setCurrentProduct, setError),
    onDelete: (id) => productsHandlers.handleDelete(
      id,
      () => deleteProduct(id, search.debouncedSearch)
    ),
    onPageChange: (page) => handlePageChange(page, search.debouncedSearch),
    onPageSizeChange: (size) => handlePageSizeChange(size, search.debouncedSearch),
  };

  const productColumns = productsConfig.columns(styles, handlers);

  const exportHeaders = [
    { key: 'product_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'min_stock_level', label: 'Min Stock' },
    { key: 'max_stock_level', label: 'Max Stock' },
    { key: 'created_at', label: 'Created' },
  ];

  const buildExportRows = (rows) => (rows || []).map(p => ({
    product_id: p.product_id,
    name: p.name || '',
    category: p.category || '',
    unit: p.unit || '',
    min_stock_level: p.min_stock_level ?? '',
    max_stock_level: p.max_stock_level ?? '',
    created_at: productsHelpers.formatDate?.(p.created_at) ?? p.created_at ?? ''
  }));

  const fetchAllProductsForExport = async () => {
    try {
      const pageSize = 500;
      let page = 1;
      let all = [];
      let total = Infinity;

      while (all.length < total) {
        const response = await productsAPI.getAll(page, pageSize, '');
        if (!response.success) throw new Error(response.error || 'Failed to fetch products');
        all = all.concat(response.data || []);
        total = response.pagination?.total ?? all.length;
        if (!response.data || response.data.length === 0) break;
        page += 1;
      }

      return buildExportRows(all);
    } catch (err) {
      setError(err.message || 'Failed to export products');
      return [];
    }
  };

  const handleExportCSV = async () => {
    const rows = exportScope === 'current' ? buildExportRows(products) : await fetchAllProductsForExport();
    if (!rows.length) return;
    exportToCSV(rows, 'products');
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    const rows = exportScope === 'current' ? buildExportRows(products) : await fetchAllProductsForExport();
    if (!rows.length) return;
    exportToPDF(rows, exportHeaders, 'Products Report', 'products');
    setShowExportMenu(false);
  };


  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          {showForm ? (
            <ProductForm
              isEditing={isEditing}
              currentProduct={currentProduct}
              loading={loading}
              error={error}
              onSuccess={handlers.onFormSuccess}
              onCancel={handlers.onCancel}
              onError={setError}
            />
          ) : (
            <div className={styles.listContainer}>
              <Header
                title="PRODUCT MANAGEMENT"
                subtitle="Manage your products and their information"
                size="small"
                align="left"
                icon={<FaBox size={30} />}
              />

              {error && <ErrorAlert error={error} onClose={() => setError('')} />}

              {loading && products.length === 0 ? (
                <LoadingState message="Loading Products..." />
              ) : (
                <DataTable
                  data={products}
                  columns={productColumns}
                  keyField="product_id"
                  loading={loading}
                  emptyMessage={search.debouncedSearch ? `No products found for "${search.debouncedSearch}"` : 'No products found'}
                  pagination={pagination}
                  onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
                  onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
                  showPagination
                  showSearch
                  searchPlaceholder="Search products..."
                  onSearchChange={search.setSearchTerm}
                  searchTerm={search.searchTerm}
                  rightControls={
                    <div className={styles.buttonGroupInline}>
                      <Button variant='secondary' leadingIcon={<FaPlus />} onClick={handlers.onNewProduct}>Add</Button>
                      <select className={styles.exportScopeSelect} value={exportScope} onChange={(e) => setExportScope(e.target.value)}>
                        <option value="current">Current view</option>
                        <option value="all">All products</option>
                      </select>
                      <div className={styles.exportWrapper}>
                        <Button onClick={() => setShowExportMenu((prev) => !prev)} variant="primary" leadingIcon={<FaFile />}>Export</Button>
                        {showExportMenu && (
                          <div className={styles.exportMenu}>
                            <button onClick={handleExportCSV}>Export CSV</button>
                            <button onClick={handleExportPDF}>Export PDF</button>
                          </div>
                        )}
                      </div>
                    </div>
                  }
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

// Sub-components
const ErrorAlert = ({ error, onClose }) => error && (
  <div className={styles.errorAlert}>
    <div className={styles.errorContent}>
      <span className={styles.errorMessage}>{error}</span>
      <button onClick={onClose} className={styles.closeBtn}>×</button>
    </div>
  </div>
);

const LoadingState = ({ message = 'Loading...' }) => (
  <div className={styles.loadingState}>
    <div className={styles.loadingContent}>
      <h2>{message}</h2>
      <p>Please wait while we fetch your product data</p>
    </div>
  </div>
);

export default ProductsPage;
