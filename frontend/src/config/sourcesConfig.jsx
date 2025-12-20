// src/config/sourcesConfig.js
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export const sourcesConfig = {
  columns: (styles, handlers) => [
    {
      key: 'source_id',
      header: 'ID',
      width: 'minmax(50px, 80px)',
    },
    {
      key: 'source_name',
      header: 'Source Name',
      width: 'minmax(150px, 1fr)',
      render: (row) => <span>{row.source_name}</span>,
    },
    {
      key: 'contact_email',
      header: 'Email',
      width: 'minmax(180px, 250px)',
      render: (row) => <span>{row.contact_email || '-'}</span>,
    },
    {
      key: 'contact_phone',
      header: 'Phone',
      width: 'minmax(130px, 150px)',
      render: (row) => <span>{row.contact_phone || '-'}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      width: 'minmax(200px, 300px)',
      render: (row) => (
        <span title={row.address}>
          {row.address ? (row.address.length > 40 ? row.address.substring(0, 40) + '...' : row.address) : '-'}
        </span>
      ),
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
              handlers.onDelete(row.source_id, row.source_name);
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
