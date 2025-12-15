import { aislesHelpers } from '../utils/aislesHelpers';
import { FaEdit, FaTrashAlt, FaBoxes } from 'react-icons/fa';

export const aislesConfig = {
  columns: (styles, handlers) => [
    {
      key: 'name',
      header: 'Name',
      render: (aisle) => <span className={styles.nameCell}>{aisle.name}</span>
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (aisle) => (
        <span className={styles.createdCell}>
          {aislesHelpers.formatDate(aisle.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (aisle) => (
        <div className={styles.actions}>
          {handlers.onViewRacks && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlers.onViewRacks(aisle);
              }}
              className={styles.viewButton}
            >
              <FaBoxes />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(aisle);
            }}
            className={styles.editButton}
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(aisle.aisle_id);
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
