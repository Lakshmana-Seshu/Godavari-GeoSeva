import api from './client';

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  getFacilityStatistics: async () => {
    const res = await api.get('/dashboard/facility-statistics');
    return res.data;
  },

  getIssueStatistics: async () => {
    const res = await api.get('/dashboard/issue-statistics');
    return res.data;
  },

  getCoverageAnalysis: async (params = {}) => {
    const res = await api.get('/dashboard/coverage-analysis', { params });
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  },

  updateUserStatus: async (id, status) => {
    const res = await api.patch(`/users/${id}/status`, { accountStatus: status });
    return res.data;
  },
};
