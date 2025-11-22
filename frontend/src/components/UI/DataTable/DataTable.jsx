// represents a reusable data table component with loading and empty states

import React from 'react';
import styles from './DataTable.module.css';

const DataTable = ({
  data,
  columns,
  keyField = 'id',
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingContent}>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  style={{ width: column.width, textAlign: column.align || 'left' }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <TableRow
                key={item[keyField]}
                item={item}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableRow = ({ item, columns, onRowClick }) => (
  <tr 
    className={onRowClick ? styles.clickableRow : ''}
    onClick={() => onRowClick && onRowClick(item)}
  >
    {columns.map(column => (
      <td
        key={column.key}
        style={{ textAlign: column.align || 'left' }}
        className={column.className || ''}
      >
        {column.render ? column.render(item) : item[column.key]}
      </td>
    ))}
  </tr>
);

export default DataTable;