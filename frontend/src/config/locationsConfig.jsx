import { locationsHelpers } from '../utils/locationsHelpers';
import { FaEdit, FaTrashAlt, FaWarehouse } from 'react-icons/fa';

export const locationsConfig = {
  columns: (styles, handlers) => [
    {
      key: 'name',
      header: 'Name',
      render: (location) => <span className={styles.nameCell}>{location.name}</span>
    },
    {
      key: 'address',
      header: 'Address',
      render: (location) => <span className={styles.addressCell}>{location.address || '-'}</span>
    },
    {
      key: 'coordinates',
      header: 'Coordinates',
      render: (location) => location.coordinates || '-'
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (location) => (
        <span className={styles.createdCell}>
          {locationsHelpers.formatDate(location.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (location) => (
        <div className={styles.actions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onViewDepots(location);
            }}
            className={styles.depotButton}
          >
            <FaWarehouse />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(location);
            }}
            className={styles.editButton}
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(location.location_id);
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
    ],
    address: [
      (value) => value?.length > 500 ? 'Address must be under 500 characters' : null
    ],
    coordinates: [
      (value) => value?.length > 100 ? 'Coordinates must be under 100 characters' : null
    ]
  }
};
