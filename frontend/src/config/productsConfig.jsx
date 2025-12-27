// src/config/productsConfig.js
import { FaEdit, FaTrash } from 'react-icons/fa';

export const productsConfig = {
  columns: (styles, handlers) => [
    {
      key: 'image',
      header: '',
      width: 'minmax(50px, 60px)',
      render: (row) => (
        <div 
          className={styles.productImageCell}
          onClick={(e) => {
            e.stopPropagation();
            handlers.onImageClick(row);
          }}
          style={{ cursor: 'pointer' }}
        >
          {row.image_data ? (
            <img 
              src={`data:${row.image_mime_type || 'image/png'};base64,${row.image_data}`}
              alt={row.name}
              className={styles.productImageCircle}
            />
          ) : (
            <div className={styles.productImagePlaceholder}>
              {row.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      ),
    },
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
      key: 'rate',
      header: 'Rate',
      width: 'minmax(80px, 100px)',
      render: (row) => <span>{row.rate != null ? row.rate : '-'}</span>,
    },
    {
      key: 'rate_unit',
      header: 'Rate Unit',
      width: 'minmax(100px, 130px)',
      render: (row) => <span>{row.rate_unit || '-'}</span>,
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