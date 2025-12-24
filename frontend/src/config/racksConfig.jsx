import { racksHelpers } from '../utils/racksHelpers';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

export const racksConfig = {
  columns: (styles, handlers) => [
    {
      key: 'rack_code',
      header: 'Code',
      width: '1fr',
      render: (rack) => <span className={styles.nameCell}>{rack.rack_code}</span>
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (rack) => (
        <span className={styles.createdCell}>
          {racksHelpers.formatDate(rack.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (rack) => (
        <div className={styles.actions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(rack);
            }}
            className={styles.editButton}
            title="Edit Rack"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(rack.rack_id);
            }}
            className={styles.deleteButton}
            title="Delete Rack"
          >
            <FaTrashAlt />
          </button>
        </div>
      )
    }
  ],

  validationSchema: {
    // validation handled in form helper
  }
};
