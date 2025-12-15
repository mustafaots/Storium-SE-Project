// src/config/transactionsConfig.jsx
import { FaUser , FaEye } from 'react-icons/fa';

export const transactionsConfig = {
  /**
   * Columns configuration for transactions table.
   * filterType: 'automatic' | 'manual' | 'mixed'
   */
  columns: (styles, filterType , handlers = {} ) => {
    const baseColumns = [
      {
        key: 'timestamp',
        header: 'Timestamp',
        width: '200px',
        render: (item) => (
          <div className={styles.timestamp}>{item.timestamp}</div>
        )
      }
    ];

    if (filterType === 'automatic') {
      baseColumns.push({
        key: 'routine_id',
        header: 'Routine',
        width: '120px',
        render: (item) => (
          <span className={styles.routineBadge}>
            R{item.routine_id}
          </span>
        )
      });
    } else if (filterType === 'mixed') {
      baseColumns.push({
        key: 'type',
        header: 'Type',
        width: '120px',
        render: (item) =>
          item.is_automated ? (
            <span className={styles.routineBadge}>
              R{item.routine_id}
            </span>
          ) : (
            <div className={styles.userIcon}>
              <FaUser />
            </div>
          )
      });
    }

    baseColumns.push({
      key: 'notes',
      header: 'Note ',
      render: (item) => (
        <div className={styles.action}>{item.notes}</div>
      )
    });

    baseColumns.push({
      key: 'actions',
      header: 'Action',
      width: '80px',
      render: (item) => (
        <div className={styles.actionsCell}>
          <button
            type="button"
            className={styles.detailsButton}
            onClick={(e) => {
              e.stopPropagation();
              handlers.onShowDetails && handlers.onShowDetails(item);
            }}
          >
            <FaEye />
          </button>
        </div>
      )
    });

    return baseColumns;
  }
};
