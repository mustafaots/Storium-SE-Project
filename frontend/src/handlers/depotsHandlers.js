export const depotsHandlers = {
  onEdit: (depot, setCurrentDepot, setIsEditing, setShowForm, setError) => {
    setCurrentDepot(depot);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  },

  onNew: (setCurrentDepot, setIsEditing, setShowForm, setError) => {
    setCurrentDepot(null);
    setIsEditing(false);
    setShowForm(true);
    setError('');
  },

  onFormSuccess: (setShowForm, setIsEditing, setCurrentDepot, reload) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentDepot(null);
    reload();
  },

  onCancel: (setShowForm, setIsEditing, setCurrentDepot, setError) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentDepot(null);
    setError('');
  },

  onDelete: (id, deleteDepot) => {
    deleteDepot(id);
  }
};
