export const aislesHandlers = {
  onEdit: (aisle, setCurrentAisle, setIsEditing, setShowForm, setError) => {
    setCurrentAisle(aisle);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  },

  onNew: (setCurrentAisle, setIsEditing, setShowForm, setError) => {
    setCurrentAisle(null);
    setIsEditing(false);
    setShowForm(true);
    setError('');
  },

  onFormSuccess: (setShowForm, setIsEditing, setCurrentAisle, reload) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentAisle(null);
    reload();
  },

  onCancel: (setShowForm, setIsEditing, setCurrentAisle, setError) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentAisle(null);
    setError('');
  },

  onDelete: (id, deleteAisle) => {
    deleteAisle(id);
  }
};
