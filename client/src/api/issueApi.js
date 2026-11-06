import api from './client';

export const issueApi = {
  getIssues: async (params = {}) => {
    const res = await api.get('/issues', { params });
    return res.data;
  },

  getIssueById: async (id) => {
    const res = await api.get(`/issues/${id}`);
    return res.data;
  },

  reportIssue: async (data, isFormData = false) => {
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await api.post('/issues', data, { headers });
    return res.data;
  },

  updateIssueStatus: async (id, statusData) => {
    const res = await api.patch(`/issues/${id}/status`, statusData);
    return res.data;
  },
};
