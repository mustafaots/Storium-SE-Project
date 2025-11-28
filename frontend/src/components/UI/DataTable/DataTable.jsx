import styles from './DataTable.module.css';

const DataTable = ({ 
  data = [], 
  columns = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  className = '',
  size = 'medium'
}) => {
  // Handle both array and object formats - ROBUST FALLBACK
  const tableData = Array.isArray(data) ? data : (data?.data || data?.items || data?.records || []);
  
  // Calculate grid template with fallback widths
  const gridTemplate = columns.map(col => {
    // Use explicit width if provided, otherwise use smart defaults
    if (col.width) return col.width;
    
    // Smart fallback widths based on content type
    if (col.key.includes('id')) return 'minmax(5px, 50px)';
    if (col.key.includes('action')) return 'minmax(10px, 150px)';
    if (col.key.includes('date') || col.key.includes('created')) return 'minmax(90px, 115px)';
    if (col.key.includes('phone') || col.key.includes('status')) return 'minmax(100px, 130px)';
    if (col.key.includes('email')) return 'minmax(180px, 300px)';
    if (col.key.includes('name')) return 'minmax(150px, 150px)';
    
    // Default for other columns
    return 'minmax(100px, 1fr)';
  }).join(' ');

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingContent}>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyMessage}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default DataTable;