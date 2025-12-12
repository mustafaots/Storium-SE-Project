import { depotsHelpers } from '../utils/depotsHelpers';
import { FaEdit, FaTrashAlt, FaStream, FaDownload } from 'react-icons/fa';

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
              title="View Aisles"
            >
              <FaStream />
            </button>
          )}
          {handlers.onExport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlers.onExport(depot);
              }}
              className={styles.exportButton}
              title="Export Inventory"
            >
              <FaDownload />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(depot);
            }}
            className={styles.editButton}
            title="Edit Depot"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(depot.depot_id);
            }}
            className={styles.deleteButton}
            title="Delete Depot"
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
