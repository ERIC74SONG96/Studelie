import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API d'authentification
export const auth = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
  getProfile: () => api.get('/api/auth/profile'),
};

// API des posts
export const posts = {
  getAll: (params = {}) => api.get('/api/posts', { params }),
  getById: (id) => api.get(`/api/posts/${id}`),
  create: (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.media) {
      postData.media.forEach(file => {
        formData.append('media', file);
      });
    }
    if (postData.tags) {
      formData.append('tags', JSON.stringify(postData.tags));
    }
    formData.append('privacy', postData.privacy || 'public');
    if (postData.location) {
      formData.append('location', postData.location);
    }
    return api.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, postData) => api.put(`/api/posts/${id}`, postData),
  delete: (id) => api.delete(`/api/posts/${id}`),
  addReaction: (postId, type) => api.post(`/api/posts/${postId}/reactions`, { type }),
  addComment: (postId, commentData) => api.post(`/api/posts/${postId}/comments`, commentData),
  getComments: (postId) => api.get(`/api/posts/${postId}/comments`),
};

// API des cours
export const courses = {
  getAll: () => api.get('/api/courses'),
  getById: (id) => api.get(`/api/courses/${id}`),
  create: (courseData) => api.post('/api/courses', courseData),
  update: (id, courseData) => api.put(`/api/courses/${id}`, courseData),
  delete: (id) => api.delete(`/api/courses/${id}`),
};

// API des événements
export const events = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (eventData) => api.post('/api/events', eventData),
  update: (id, eventData) => api.put(`/api/events/${id}`, eventData),
  delete: (id) => api.delete(`/api/events/${id}`),
};

// API des amis
export const friends = {
  getAll: () => api.get('/api/friends'),
  getSuggestions: () => api.get('/api/friends/suggestions'),
  add: (userId) => api.post(`/api/friends/${userId}`),
  remove: (userId) => api.delete(`/api/friends/${userId}`),
};

// API des messages
export const messages = {
  getAll: () => api.get('/api/messages'),
  getConversation: (userId) => api.get(`/api/messages/conversation/${userId}`),
  send: (messageData) => api.post('/api/messages', messageData),
};

// API du profil
export const profile = {
  get: () => api.get('/api/profile'),
  update: (profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (key === 'profilePicture' && profileData[key] instanceof File) {
        formData.append('profilePicture', profileData[key]);
      } else {
        formData.append(key, profileData[key]);
      }
    });
    return api.put('/api/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Exports individuels pour la compatibilité
export const login = auth.login;
export const register = auth.register;
export const getProfile = profile.get;
export const createPost = posts.create;
export const getPosts = posts.getAll;
export const addReaction = posts.addReaction;
export const addComment = posts.addComment;

export default api; 