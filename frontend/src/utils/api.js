import { api as request } from './apiRequest';

// Set base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Helper function to add auth token to requests
const getAuthConfig = (config = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
};

// API methods
const api = {
  // Auth
  login: (credentials) => request({
    method: 'POST',
    url: `${API_BASE_URL}/auth/login`,
    data: credentials,
    headers: { 'Content-Type': 'application/json' }
  }),
  
  register: (userData) => request({
    method: 'POST',
    url: `${API_BASE_URL}/auth/register`,
    data: userData,
    headers: { 'Content-Type': 'application/json' }
  }),

  // Medicines
  getMedicines: (params = {}) => request({
    method: 'GET',
    url: `${API_BASE_URL}/medicines`,
    params,
    ...getAuthConfig()
  }),
  
  getMedicine: (id) => request({
    method: 'GET',
    url: `${API_BASE_URL}/medicines/${id}`,
    ...getAuthConfig()
  }),
  
  createMedicine: (medicineData) => request({
    method: 'POST',
    url: `${API_BASE_URL}/medicines`,
    data: medicineData,
    ...getAuthConfig()
  }),
  
  updateMedicine: (id, medicineData) => request({
    method: 'PUT',
    url: `${API_BASE_URL}/medicines/${id}`,
    data: medicineData,
    ...getAuthConfig()
  }),
  
  deleteMedicine: (id) => request({
    method: 'DELETE',
    url: `${API_BASE_URL}/medicines/${id}`,
    ...getAuthConfig()
  }),
  
  getLowStockMedicines: () => request({
    method: 'GET',
    url: `${API_BASE_URL}/medicines/low-stock`,
    ...getAuthConfig()
  }),
  
  getExpiringSoonMedicines: (months = 3) => request({
    method: 'GET',
    url: `${API_BASE_URL}/medicines/expiring-soon`,
    params: { months },
    ...getAuthConfig()
  }),

  // Orders
  getOrders: () => request({
    method: 'GET',
    url: `${API_BASE_URL}/orders`,
    ...getAuthConfig()
  }),
  
  getOrder: (id) => request({
    method: 'GET',
    url: `${API_BASE_URL}/orders/${id}`,
    ...getAuthConfig()
  }),
  
  createOrder: (orderData) => request({
    method: 'POST',
    url: `${API_BASE_URL}/orders`,
    data: orderData,
    ...getAuthConfig()
  }),
  
  updateOrderStatus: (id, status) => request({
    method: 'PATCH',
    url: `${API_BASE_URL}/orders/${id}/status`,
    data: { status },
    ...getAuthConfig()
  }),

  // Customers
  getCustomers: () => request({
    method: 'GET',
    url: `${API_BASE_URL}/users/customers`,
    ...getAuthConfig()
  }),
  
  getCustomer: (id) => request({
    method: 'GET',
    url: `${API_BASE_URL}/users/${id}`,
    ...getAuthConfig()
  }),

  // Admin
  getDashboardStats: () => request({
    method: 'GET',
    url: `${API_BASE_URL}/admin/dashboard-stats`,
    ...getAuthConfig()
  }),

  // Upload
  uploadFile: async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return request({
      method: 'POST',
      url: `${API_BASE_URL}/upload/${type}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(getAuthConfig().headers || {})
      }
    });
  }
};

export default api;
