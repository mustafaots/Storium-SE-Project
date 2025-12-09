import { clientsHelpers } from '../utils/clientsHelpers';
import { FaTrashAlt , FaEdit } from 'react-icons/fa';

export const clientsConfig = {
  // Table columns configuration for clients DataTable
  columns: (styles, handlers) => [
    {
      key: 'client_id',
      header: 'ID',
      width: '80px'
    },
    {
      key: 'client_name',
      header: 'Name',
      render: (client) => <span className={styles.clientName}>{client.client_name}</span>
    },
    {
      key: 'contact_email',
      header: 'Email',
      render: (client) => client.contact_email || '-'
    },
    {
      key: 'contact_phone',
      header: 'Phone',
      render: (client) => clientsHelpers.formatPhone(client.contact_phone)
    },
    {
      key: 'address',
      header: 'Address',
      render: (client) => <span className={styles.clientAddress}>{client.address || '-'}</span>
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (client) => (
        <span className={styles.clientCreated}>
          {clientsHelpers.formatDate(client.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <div className={styles.actions}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(client);
            }}
            className={styles.editButton}
          >
            <FaEdit/>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(client.client_id);
            }}
            className={styles.deleteButton}
          >
            <FaTrashAlt/>
          </button>
        </div>
      )
    }
  ],

  // Form configuration
  form: {
    validationSchema: {
      client_name: [
        (value) => !value?.trim() ? 'Client name is required' : null,
        (value) => value?.length < 2 ? 'Client name must be at least 2 characters' : null
      ]
    }
  }
};