// src/handlers/sourcesHandlers.js
import { sourcesController } from '../controllers/sourcesController';
import { sourcesHelpers } from '../utils/sourcesHelpers';

export const sourcesHandlers = {
  /**
   * Open edit form for a source
   */
  handleEdit: (source, setCurrentSource, setIsEditing, setShowForm, setError) => {
    try {
      setCurrentSource(source);
      setIsEditing(true);
      setShowForm(true);
      setError('');
    } catch (err) {
      console.error('[sourcesHandlers] handleEdit error', err);
      setError('Failed to open edit form');
    }
  },

  /**
   * Open new source form
   */
  handleNew: (setCurrentSource, setIsEditing, setShowForm, setError) => {
    try {
      setCurrentSource(null);
      setIsEditing(false);
      setShowForm(true);
      setError('');
    } catch (err) {
      console.error('[sourcesHandlers] handleNew error', err);
      setError('Failed to open new source form');
    }
  },

  /**
   * Handle form success (after create or update)
   */
  handleFormSuccess: (setShowForm, setIsEditing, setCurrentSource, refreshList) => {
    try {
      setShowForm(false);
      setIsEditing(false);
      setCurrentSource(null);
      if (typeof refreshList === 'function') refreshList();
    } catch (err) {
      console.error('[sourcesHandlers] handleFormSuccess error', err);
    }
  },

  /**
   * Cancel form (close without saving)
   */
  handleCancel: (setShowForm, setIsEditing, setCurrentSource, setError) => {
    try {
      setShowForm(false);
      setIsEditing(false);
      setCurrentSource(null);
      setError('');
    } catch (err) {
      console.error('[sourcesHandlers] handleCancel error', err);
      setError('Failed to cancel form');
    }
  },

  /**
   * Handle delete source with custom modal
   */
   handleDelete: (id, deleteSource) => {
    deleteSource(id);
  }

};

export default sourcesHandlers;