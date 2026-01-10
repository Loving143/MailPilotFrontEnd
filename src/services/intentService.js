import api from './api';

export const intentService = {
  // Create intent category
  createCategory: async (categoryData) => {
    const response = await api.post('/create/category', categoryData);
    return response.data;
  },

  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/fetch/category/all');
    return response.data;
  },

  // Create intent code
  createIntentCode: async (intentCodeData) => {
    const response = await api.post('/create/intent-code', intentCodeData);
    return response.data;
  },

  // Fetch specific intent code
  fetchIntentCode: async (intentCode) => {
    const response = await api.get(`/fetch/intentCode/${intentCode}`);
    return response.data;
  },

  // Get intents by category
  getIntentsByCategory: async (categoryCode) => {
    const response = await api.get(`/fetch/intents/byCategoryCode/${categoryCode}`);
    return response.data;
  }
};