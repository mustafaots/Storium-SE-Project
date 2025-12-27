export const racksHandlers = {
  onEdit: (rack, setCurrentRack, setIsEditing, setShowForm, setError) => {
    setCurrentRack(rack);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  },

  onNew: (setCurrentRack, setIsEditing, setShowForm, setError) => {
    setCurrentRack(null);
    setIsEditing(false);
    setShowForm(true);
    setError('');
  },

  onFormSuccess: (setShowForm, setIsEditing, setCurrentRack, reload) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentRack(null);
    reload();
  },

  onCancel: (setShowForm, setIsEditing, setCurrentRack, setError) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentRack(null);
    setError('');
  },

  onDelete: (id, deleteRack) => {
    deleteRack(id);
  }
};
