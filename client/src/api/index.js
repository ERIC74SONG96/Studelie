import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const posts = {
  getAll: () => api.get('/posts'),
  getById: (id) => api.get(`/posts/${id}`),
  create: (postData) => api.post('/posts', postData),
  update: (id, postData) => api.put(`/posts/${id}`, postData),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  comment: (id, comment) => api.post(`/posts/${id}/comments`, { content: comment }),
};

export const courses = {
  getAll: () => api.get('/api/courses'),
  getById: (id) => api.get(`/api/courses/${id}`),
  create: (courseData) => api.post('/api/courses', courseData),
  update: (id, courseData) => api.put(`/api/courses/${id}`, courseData),
  delete: (id) => api.delete(`/api/courses/${id}`),
  enroll: (id) => api.post(`/api/courses/${id}/enroll`),
  unenroll: (id) => api.post(`/api/courses/${id}/unenroll`),
  addMaterial: (id, materialData) => api.post(`/api/courses/${id}/materials`, materialData),
};

export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getFriends: () => api.get('/users/friends'),
  addFriend: (userId) => api.post('/users/friends', { userId }),
  removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
};

export const messages = {
  getAll: () => api.get('/messages'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  send: (userId, content) => api.post('/messages', { recipientId: userId, content }),
};

export default api; 