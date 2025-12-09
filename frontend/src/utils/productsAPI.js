import axios from 'axios';

const API_URL = 'http://localhost:3001/api/products';

export const productsAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const res = await axios.get(API_URL, { params: { page, limit, search } });
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  }
};
