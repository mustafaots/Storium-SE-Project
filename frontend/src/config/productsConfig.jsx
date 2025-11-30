// src/config/productsConfig.js
import { FaEdit, FaTrash } from 'react-icons/fa';

export const productsConfig = {
  columns: (styles, handlers) => [
    {
      key: 'product_id',
      header: 'ID',
      width: 'minmax(50px, 80px)',
    },
    {
      key: 'name',
      header: 'Name',
      width: 'minmax(150px, 1fr)',
      render: (row) => <span>{row.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      width: 'minmax(120px, 150px)',
      render: (row) => <span>{row.category || '-'}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      width: 'minmax(120px, 150px)',
      render: (row) => <span>{row.supplier || '-'}</span>,
    },
    {
      key: 'unit',
      header: 'Unit',
      width: 'minmax(80px, 100px)',
    },
    {
      key: 'total_stock',
      header: 'Total Stock',
      width: 'minmax(100px, 120px)',
      render: (row) => <span>{row.total_stock ?? row.total ?? 0}</span>,
    },
    {
      key: 'min_stock_level',
      header: 'Min Stock',
      width: 'minmax(90px, 110px)',
      render: (row) => <span>{row.min_stock_level ?? 0}</span>,
    },
    {
      key: 'max_stock_level',
      header: 'Max Stock',
      width: 'minmax(90px, 110px)',
      render: (row) => <span>{row.max_stock_level ?? 0}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'minmax(120px, 150px)',
      render: (row) => (
        <div className={styles.actionButtons}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(row);
            }} 
            className={styles.editBtn}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(row.product_id, row.name);
            }} 
            className={styles.deleteBtn}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ]
};