import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Trips API
export const tripsAPI = {
  getAll: () => apiClient.get('/trips'),
  getById: (id) => apiClient.get(`/trips/${id}`),
  create: (data) => apiClient.post('/trips', data),
  update: (id, data) => apiClient.put(`/trips/${id}`, data),
  delete: (id) => apiClient.delete(`/trips/${id}`),
};

// Expenses API
export const expensesAPI = {
  getAll: (tripId) => apiClient.get('/expenses', { params: { tripId } }),
  getStats: (tripId) => apiClient.get(`/expenses/stats/${tripId}`),
  create: (data) => apiClient.post('/expenses', data),
  update: (id, data) => apiClient.put(`/expenses/${id}`, data),
  delete: (id) => apiClient.delete(`/expenses/${id}`),
};

// AI API
export const aiAPI = {
  chat: (message, context) => apiClient.post('/ai/chat', { message, context }),
  generateItinerary: (data) => apiClient.post('/ai/generate-itinerary', data),
};

// Saved Itineraries API
export const savedItinerariesAPI = {
  getAll: () => apiClient.get('/saved-itineraries'),
  getById: (id) => apiClient.get(`/saved-itineraries/${id}`),
  create: (data) => apiClient.post('/saved-itineraries', data),
  update: (id, data) => apiClient.put(`/saved-itineraries/${id}`, data),
  delete: (id) => apiClient.delete(`/saved-itineraries/${id}`),
};

// Ads API
export const adsAPI = {
  getAll: (category) => apiClient.get('/ads', { params: { category } }),
  create: (data) => apiClient.post('/ads', data),
  delete: (id) => apiClient.delete(`/ads/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => apiClient.get('/cart'),
  addItem: (adId, quantity = 1) => apiClient.post('/cart/items', { adId, quantity }),
  updateItem: (adId, quantity) => apiClient.put(`/cart/items/${adId}`, { quantity }),
  removeItem: (adId) => apiClient.delete(`/cart/items/${adId}`),
  clear: () => apiClient.delete('/cart'),
};

export const checkoutAPI = {
  pay: (data) => apiClient.post('/checkout', data),
};

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};

