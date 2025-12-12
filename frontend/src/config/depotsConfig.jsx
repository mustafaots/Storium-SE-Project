import { depotsHelpers } from '../utils/depotsHelpers';
import { FaEdit, FaTrashAlt, FaStream } from 'react-icons/fa';

export const depotsConfig = {
  columns: (styles, handlers) => [
    {
      key: 'name',
      header: 'Name',
      render: (depot) => <span className={styles.nameCell}>{depot.name}</span>
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (depot) => (
        <span className={styles.createdCell}>
          {depotsHelpers.formatDate(depot.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (depot) => (
        <div className={styles.actions}>
          {handlers.onViewAisles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlers.onViewAisles(depot);
              }}
              className={styles.viewButton}
            >
              <FaStream />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(depot);
            }}
            className={styles.editButton}
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(depot.depot_id);
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
    name: [
      (value) => !value?.trim() ? 'Name is required' : null,
      (value) => value?.length < 2 ? 'Name must be at least 2 characters' : null
    ]
  }
};
