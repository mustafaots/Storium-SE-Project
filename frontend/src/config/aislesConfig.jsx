import { aislesHelpers } from '../utils/aislesHelpers';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

export const aislesConfig = {
  columns: (styles, handlers) => [
    {
      key: 'name',
      header: 'Name',
      width: '1fr',
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
      width: '120px',
      render: (aisle) => (
        <div className={styles.actions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(aisle);
            }}
            className={styles.editButton}
            title="Edit Aisle"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(aisle.aisle_id);
            }}
            className={styles.deleteButton}
            title="Delete Aisle"
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
