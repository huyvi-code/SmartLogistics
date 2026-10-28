import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartlog_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const ordersAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  create: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  updateStatus: async (id, status, mo_ta = '', vi_tri = '') => {
    const res = await api.patch(`/orders/${id}/status`, {
      trang_thai: status,
      mo_ta,
      vi_tri,
    });
    return res.data;
  },
  assignDriver: async (id, tai_xe_id, tuyen_giao_id = null) => {
    const res = await api.patch(`/orders/${id}/assign`, {
      tai_xe_id,
      tuyen_giao_id,
    });
    return res.data;
  },
  calculateFee: async (data) => {
    const res = await api.post('/orders/calculate-fee', data);
    return res.data;
  },
  submitPod: async (id, podPayload) => {
    const res = await api.post(`/orders/${id}/pod`, podPayload);
    return res.data;
  },
  getPod: async (id) => {
    const res = await api.get(`/orders/${id}/pod`);
    return res.data;
  },
};

export const trackingAPI = {
  track: async (trackingNumber) => {
    const res = await api.get(`/tracking/${trackingNumber}`);
    return res.data;
  },
};

export const driversAPI = {
  getAll: async () => {
    const res = await api.get('/drivers');
    return res.data;
  },
  create: async (driverData) => {
    const res = await api.post('/drivers', driverData);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/drivers/${id}/status?status=${status}`);
    return res.data;
  },
};

export const routesAPI = {
  getAll: async () => {
    const res = await api.get('/routes');
    return res.data;
  },
};

export const incidentsAPI = {
  getAll: async (status) => {
    const res = await api.get('/incidents', { params: { status } });
    return res.data;
  },
  report: async (data) => {
    const res = await api.post('/incidents', data);
    return res.data;
  },
  resolve: async (id, resolution) => {
    const res = await api.patch(`/incidents/${id}/resolve`, {
      bien_phap_khac_phuc: resolution,
    });
    return res.data;
  },
};

export const statsAPI = {
  getOverview: async () => {
    const res = await api.get('/stats/overview');
    return res.data;
  },
};

export const aiAPI = {
  suggestIncidentSolution: async (orderId, loaiSuCo, moTa) => {
    const res = await api.post('/ai/suggest-incident-solution', {
      order_id: orderId,
      loai_su_co: loaiSuCo,
      mo_ta: moTa,
    });
    return res.data;
  },
  suggestDriver: async (orderId) => {
    const res = await api.get(`/ai/suggest-driver/${orderId}`);
    return res.data;
  },
  chat: async (message, contextOrderId = null) => {
    const res = await api.post('/ai/chat', {
      message,
      context_order_id: contextOrderId,
    });
    return res.data;
  },
};

export const systemAPI = {
  checkHealth: async () => {
    const res = await axios.get('http://localhost:8000/health', { timeout: 3000 });
    return res.data;
  },
};

export default api;

