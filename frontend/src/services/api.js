import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// RFP APIs
export const rfpApi = {
  create: (data) => api.post('/rfps', data),
  getAll: () => api.get('/rfps'),
  getById: (id) => api.get(`/rfps/${id}`),
  update: (id, data) => api.put(`/rfps/${id}`, data),
  updateStatus: (id, status) => api.patch(`/rfps/${id}/status`, { status }),
  delete: (id) => api.delete(`/rfps/${id}`),
};

// Vendor APIs
export const vendorApi = {
  create: (data) => api.post('/vendors', data),
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// Proposal APIs
export const proposalApi = {
  getByRfpId: (rfpId) => api.get(`/proposals/${rfpId}`),
  compare: (rfpId) => api.get(`/proposals/${rfpId}/compare`),
  create: (data) => api.post('/proposals', data),
};

// Email APIs
export const emailApi = {
  sendRfp: (data) => api.post('/email/send-rfp', data),
  fetchResponses: (data) => api.post('/email/fetch-responses', data),
};

export default api;
