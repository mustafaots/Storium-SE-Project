// UI event handlers for locations
export const locationsHandlers = {
  onEdit: (location, setCurrentLocation, setIsEditing, setShowForm, setError) => {
    setCurrentLocation(location);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  },

  onNew: (setCurrentLocation, setIsEditing, setShowForm, setError) => {
    setCurrentLocation(null);
    setIsEditing(false);
    setShowForm(true);
    setError('');
  },

  onFormSuccess: (setShowForm, setIsEditing, setCurrentLocation, reload) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentLocation(null);
    reload();
  },

  onCancel: (setShowForm, setIsEditing, setCurrentLocation, setError) => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentLocation(null);
    setError('');
  },

  onDelete: (id, deleteLocation) => {
    deleteLocation(id);
  }
};
