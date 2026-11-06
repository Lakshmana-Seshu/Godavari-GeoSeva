import api from './client';

export const facilityApi = {
  getFacilities: async (params = {}) => {
    const res = await api.get('/facilities', { params });
    return res.data;
  },

  getNearbyFacilities: async (params = {}) => {
    const res = await api.get('/facilities/nearby', { params });
    return res.data;
  },

  getFacilityById: async (id) => {
    const res = await api.get(`/facilities/${id}`);
    return res.data;
  },

  createFacility: async (data) => {
    const res = await api.post('/facilities', data);
    return res.data;
  },

  updateFacility: async (id, data) => {
    const res = await api.patch(`/facilities/${id}`, data);
    return res.data;
  },

  deleteFacility: async (id) => {
    const res = await api.delete(`/facilities/${id}`);
    return res.data;
  },
};
