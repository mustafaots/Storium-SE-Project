import styles from './DataTable.module.css';
import Pagination from '../Pagination/Pagination';

const DataTable = ({ 
  data = [], 
  columns = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  className = '',
  size = 'medium',
  // Pagination props
  pagination = null,
  onPageChange,
  onPageSizeChange,
  showPagination = false,
  // Search props
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearchChange,
  searchTerm = '',
  // Optional right-side controls (e.g., action buttons)
  rightControls = null
}) => {
  // Handle both array and object formats
  const tableData = Array.isArray(data) ? data : (data?.data || data?.items || data?.records || []);
  
  // Calculate grid template with fallback widths
  const gridTemplate = columns.map(col => {
    if (col.width) return col.width;
    if (col.key.includes('id')) return 'minmax(5px, 50px)';
    if (col.key.includes('action')) return 'minmax(10px, 150px)';
    if (col.key.includes('date') || col.key.includes('created')) return 'minmax(90px, 115px)';
    if (col.key.includes('phone') || col.key.includes('status')) return 'minmax(100px, 130px)';
    if (col.key.includes('email')) return 'minmax(180px, 300px)';
    if (col.key.includes('name')) return 'minmax(150px, 150px)';
    return 'minmax(100px, 1fr)';
  }).join(' ');

  const handleSearchInputChange = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const isEmpty = !tableData || tableData.length === 0;

  return (
    <div className={styles.tableWrapper}>
      {/* Combined Search and Pagination Controls */}
      {(showSearch || showPagination || rightControls) && (
        <div className={styles.controlsRow}>
          {/* Search Bar */}
          {showSearch && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchInputChange}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange && onSearchChange('')}
                  className={styles.clearSearch}
                >
                  ✕
                </button>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {showPagination && pagination && onPageChange && onPageSizeChange && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              className={styles.pagination}
            />
          )}

          {/* Right-side custom controls */}
          {rightControls && (
            <div className={styles.rightControls}>
              {rightControls}
            </div>
          )}
        </div>
      )}

      {/* Table or empty state */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingContent}>
            <p>Loading data...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyMessage}>
            {emptyMessage}
          </div>
        </div>
      ) : (
        <div className={`${styles.table} ${styles[size]} ${className}`}>
          {/* Table Header */}
          <div 
            className={styles.tableHeader} 
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map((column) => (
              <div key={column.key} className={styles.headerCell}>
                {column.header || column.label}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className={styles.tableBody}>
            {tableData.map((item) => (
              <div 
                key={item[keyField]} 
                className={`${styles.tableRow} ${onRowClick ? styles.clickableRow : ''}`}
                style={{ gridTemplateColumns: gridTemplate }}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <div key={column.key} className={styles.cell}>
                    {column.render ? column.render(item) : item[column.key]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;