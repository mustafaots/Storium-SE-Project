// to handle client-related events (UI logic)

export const clientsHandlers = {
  // Edit client handler
  handleEdit: (client, setCurrentClient, setIsEditing, setShowForm, setError) => {
    setCurrentClient(client);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  },

  // New client handler
  handleNewClient: (setCurrentClient, setIsEditing, setShowForm, setError) => {
    setCurrentClient(null);
    setIsEditing(false);
    setShowForm(true);
    setError('');
  },

  // Form success handler
  handleFormSuccess: (setShowForm, setIsEditing, setCurrentClient, loadClients) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentClient(null);
    loadClients();
  },

  // Cancel handler
  handleCancel: (setShowForm, setIsEditing, setCurrentClient, setError) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentClient(null);
    setError('');
  },

  // Delete handler
  handleDelete: (id, deleteClient) => {
    deleteClient(id);
  }
};