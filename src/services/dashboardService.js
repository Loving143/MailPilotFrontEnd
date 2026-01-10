import api from './api';

export const dashboardService = {
  // Get main dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  // Get detailed statistics
  getDetailedStats: async () => {
    const response = await api.get('/api/dashboard/stats/detailed');
    return response.data;
  },

  // Get statistics by date range
  getStatsByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/api/dashboard/stats/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get statistics by period
  getStatsByPeriod: async (period) => {
    const response = await api.get(`/api/dashboard/stats/period/${period}`);
    return response.data;
  },

  // Get dashboard summary (both dashboard and detailed stats)
  getDashboardSummary: async () => {
    const response = await api.get('/api/dashboard/summary');
    return response.data;
  },

  // Get quick statistics
  getQuickStats: async () => {
    const response = await api.get('/api/dashboard/quick-stats');
    return response.data;
  },

  // Available periods for period-based queries
  getAvailablePeriods: () => [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ]
};