import styles from './table.module.css';
import { FaUser } from 'react-icons/fa';

function Table({ 
  data = [], 
  columns = [],
  filterType = 'mixed', // 'automatic' | 'manual' | 'mixed'
  size = 'medium',      // 'small' | 'medium' | 'large'
    className = ''
}) {
  // If no columns provided, use default transaction columns based on filterType
  const getDefaultColumns = () => {
    const baseColumns = [
      { key: 'timestamp', label: 'Timestamp', render: (item) => (
        <div className={styles.timestamp}>{item.timestamp}</div>
      )}
    ];
   
    if (filterType === 'automatic') {
      // Automated: Show timestamp, routine_id, and note
      baseColumns.push({
        key: 'routine_id',
        label: 'Routine',
        render: (item) => (
          <span className={`${styles.routineBadge}`}>
            R{item.routine_id}
          </span>
        )
      });
    } else if (filterType === 'manual') {
      // Manual: Show timestamp and note only (no routine_id column, user icon handled in type column)
      // Just add the note/action
    } else if (filterType === 'mixed') {
      // Mixed: Show timestamp, type (manual shows user icon, automated shows routine_id), and note
      baseColumns.push({
        key: 'type',
        label: 'Type',
        render: (item) => {
          if (item.is_automated) {
            return (
              <span className={`${styles.routineBadge}`}>
                R{item.routine_id}
              </span>
            );
          } else {
            return (
              <div className={styles.userIcon}>
                <FaUser />
              </div>
            );
          }
        }
      });
    }

    // Add action/note column for all views
    baseColumns.push({
      key: 'notes',
      label: 'Action',
      render: (item) => (
        <div className={styles.action}>{item.notes}</div>
      )
    });

    return baseColumns;
  };

  const tableColumns = columns.length > 0 ? columns : getDefaultColumns();

  // Calculate grid template based on number of columns
  const gridTemplate = tableColumns.map(col => {
    // Default column widths based on key
    if (col.key === 'timestamp') return '200px';
    if (col.key === 'routine_id' || col.key === 'type') return '120px';
    return '1fr';
  }).join(' ');

  return (
    <div className={`${styles.table} ${styles[size]} ${className}`}>
      {/* Table Header */}
      <div 
        className={styles.tableHeader} 
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {tableColumns.map((column) => (
          <div key={column.key} className={styles.headerCell}>
            {column.label}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className={styles.tableBody}>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div 
              key={item.txn_id || item.id || index} 
              className={styles.tableRow}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {tableColumns.map((column) => (
                <div key={column.key} className={styles.cell}>
                  {column.render ? column.render(item) : item[column.key]}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyMessage}>
              No data found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Table;