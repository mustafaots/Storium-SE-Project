import { useEffect, useRef } from 'react';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import ProductForm from '../../components/Layout/ProductLayout/ProductForm';
import { FaBox, FaFile, FaPlus } from 'react-icons/fa';

import { useProducts } from '../../hooks/useProducts';
import { productsHandlers } from '../../handlers/productsHandlers';
import { productsConfig } from '../../config/productsConfig';
import useTableSearch from '../../hooks/useTableSearch';
import styles from './ProductsPage.module.css';

function ProductsPage() {
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

  const search = useTableSearch('');
  const activeItem = useActiveNavItem();
  const hasInitialLoaded = useRef(false);

  // Initial load ONLY
  useEffect(() => {
    if (!hasInitialLoaded.current) {
      hasInitialLoaded.current = true;
      loadProducts(1, 10, '');
    }
  }, []);

  // Search changes (skip first render)
  useEffect(() => {
    if (hasInitialLoaded.current) {
      loadProducts(1, pagination.pageSize, search.debouncedSearch);
    }
  }, [search.debouncedSearch]);

  const handlers = {
    onEdit: (product) => productsHandlers.handleEdit(
      product, setCurrentProduct, setIsEditing, setShowForm, setError
    ),
    onNewProduct: () => productsHandlers.handleNew(
      setCurrentProduct, setIsEditing, setShowForm, setError
    ),
    onFormSuccess: () => productsHandlers.handleFormSuccess(
      setShowForm, setIsEditing, setCurrentProduct,
      () => loadProducts(pagination.currentPage, pagination.pageSize, search.debouncedSearch)
    ),
    onCancel: () => productsHandlers.handleCancel(
      setShowForm, setIsEditing, setCurrentProduct, setError
    ),
    onDelete: (id, productName) => productsHandlers.handleDelete(id, deleteProduct, productName),
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    // NEW: when user clicks "Load all products" from NoResults
    onLoadAllProducts: () => {
      // clear search and reload first page with empty search
      search.setSearchTerm('');
      loadProducts(1, pagination.pageSize, '');
    }
  };

  const productColumns = productsConfig.columns(styles, handlers);

  // DEBUG: watch important state to help reproduce 'disappearing' UI issues
  useEffect(() => {
    console.debug('[ProductsPage] state', { loading, error, showForm, productsLength: products?.length ?? 0, pagination });
  }, [loading, error, showForm, products, pagination]);

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

              <ErrorAlert error={error} onClose={() => setError('')} />

              {loading && (!products || products.length === 0) ? (
                <LoadingState message="Loading Products..." />
              ) : (!products || products.length === 0) ? (
                // Distinguish between "no results from search" and "completely empty list"
                search.debouncedSearch ? (
                  <NoResults
                    term={search.debouncedSearch}
                    onClearSearch={() => {
                      search.setSearchTerm('');
                      loadProducts(1, pagination.pageSize, '');
                    }}
                    onAddProduct={() => handlers.onLoadAllProducts()}
                  />
                ) : (
                  <EmptyState onAddProduct={handlers.onNewProduct} />
                )
              ) : (
                <>
                  <DataTable
                    data={products || []}
                    columns={productColumns}
                    keyField="product_id"
                    loading={loading}
                    emptyMessage="No products found"
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    showPagination
                    showSearch
                    searchPlaceholder="Search products..."
                    onSearchChange={search.setSearchTerm}
                    searchTerm={search.searchTerm}
                  />

                  {pagination.totalCount > 0 && (
                    <div className={styles.paginationInfoContainer}>
                      <div className={styles.paginationInfo}>
                        <span className={styles.resultsText}>
                          Showing <strong>{(pagination.currentPage - 1) * pagination.pageSize + 1}</strong> to <strong>{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}</strong> of <strong>{pagination.totalCount}</strong> products
                        </span>
                        {search.debouncedSearch && (
                          <span className={styles.searchInfo}>
                            matching "<strong>{search.debouncedSearch}</strong>"
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={styles.actionsContainer}>
                    <div className={styles.buttonGroup}>
                      <Button variant="secondary" leadingIcon={<FaPlus />} onClick={handlers.onNewProduct}>
                        Add
                      </Button>
                      <Button variant="primary" leadingIcon={<FaFile />} onClick={() => {}}>
                        Export
                      </Button>
                    </div>
                  </div>
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

const LoadingState = ({ message }) => (
  <div className={styles.loadingState}>
    <div className={styles.loadingContent}>
      <h2>{message}</h2>
      <p>Please wait while we fetch your product data</p>
    </div>
  </div>
);

const EmptyState = ({ onAddProduct }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyContent}>
      <h2>No Products Found</h2>
      <p>Create your first product to get started</p>
      <button onClick={onAddProduct} className={styles.primaryButton}>
        Add Your First Product
      </button>
    </div>
  </div>
);

const NoResults = ({ term, onClearSearch, onAddProduct }) => (
  <div className={styles.noResults}>
    <div className={styles.noResultsContent}>
      <h2>No results</h2>
      <p>
        We couldn't find any products matching&nbsp;
        <strong>{term}</strong>.
      </p>
      <div className={styles.noResultsActions}>
        <button onClick={onClearSearch} className={styles.secondaryButton}>
          Clear search
        </button>
        {/* This button now loads all products (clears the search & fetches full list) */}
        <button onClick={onAddProduct} className={styles.primaryButton}>
          Load all products
        </button>
      </div>
    </div>
  </div>
);

export default ProductsPage;
