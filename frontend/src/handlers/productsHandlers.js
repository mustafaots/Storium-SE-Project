// src/handlers/productsHandlers.js
import { productsController } from '../controllers/productsController';
import { productsHelpers } from '../utils/productsHelpers';

export const productsHandlers = {
  /**
   * Open edit form for a product
   */
  handleEdit: (product, setCurrentProduct, setIsEditing, setShowForm, setError) => {
    try {
      setCurrentProduct(product);
      setIsEditing(true);
      setShowForm(true);
      setError('');
    } catch (err) {
      console.error('[productsHandlers] handleEdit error', err);
      setError('Failed to open edit form');
    }
  },

  /**
   * Open new product form
   */
  handleNew: (setCurrentProduct, setIsEditing, setShowForm, setError) => {
    try {
      setCurrentProduct(null);
      setIsEditing(false);
      setShowForm(true);
      setError('');
    } catch (err) {
      console.error('[productsHandlers] handleNew error', err);
      setError('Failed to open new product form');
    }
  },

  /**
   * Handle form success (after create or update)
   */
  handleFormSuccess: (setShowForm, setIsEditing, setCurrentProduct, refreshList) => {
    try {
      setShowForm(false);
      setIsEditing(false);
      setCurrentProduct(null);
      if (typeof refreshList === 'function') refreshList();
    } catch (err) {
      console.error('[productsHandlers] handleFormSuccess error', err);
    }
  },

  /**
   * Cancel form (close without saving)
   */
  handleCancel: (setShowForm, setIsEditing, setCurrentProduct, setError) => {
    try {
      setShowForm(false);
      setIsEditing(false);
      setCurrentProduct(null);
      setError('');
    } catch (err) {
      console.error('[productsHandlers] handleCancel error', err);
      setError('Failed to cancel form');
    }
  },

  /**
   * Handle delete product with custom modal
   */
  handleDelete: async (id, deleteProduct, productName = 'this product') => {
    try {
      await deleteProduct(id);
      console.log('Product deleted successfully');
    } catch (err) {
      console.error('[productsHandlers] handleDelete error', err);
      alert('❌ Failed to delete product: ' + err.message);
    }
  }
};

export default productsHandlers;