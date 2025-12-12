// Declarative representation of the clients table for reuse/documentation
export const Client = Object.freeze({
  tableName: 'clients',
  primaryKey: 'client_id',
  columns: Object.freeze({
    client_id: { type: 'INT', nullable: false, autoIncrement: true },
    client_name: { type: 'VARCHAR(255)', nullable: false },
    contact_email: { type: 'VARCHAR(255)', nullable: true },
    contact_phone: { type: 'VARCHAR(50)', nullable: true },
    address: { type: 'TEXT', nullable: true },
    created_at: { type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' }
  })
});
