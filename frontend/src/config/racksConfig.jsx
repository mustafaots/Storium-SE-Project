import { racksHelpers } from '../utils/racksHelpers';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

export const racksConfig = {
  columns: (styles, handlers) => [
    {
      key: 'rack_code',
      header: 'Code',
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
      render: (rack) => (
        <div className={styles.actions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(rack);
            }}
            className={styles.editButton}
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(rack.rack_id);
            }}
            className={styles.deleteButton}
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
