import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
});


api.interceptors.request.use(config => {
  return config;
});


api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.message || 'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const resumeAPI = {
  upload: (formData, onProgress) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  analyze: (data) => api.post('/resumes/analyze', data),
};

export const jdAPI = {
  create: (data) => {
    
    if (data instanceof FormData) {
      return api.post('/job-descriptions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/job-descriptions', data);
  },
  getAll: () => api.get('/job-descriptions'),
  getById: (id) => api.get(`/job-descriptions/${id}`),
  delete: (id) => api.delete(`/job-descriptions/${id}`),
};

export const candidateAPI = {
  getAll: () => api.get('/candidates'),
  getRanked: (jobDescId, params = {}) =>
    api.get(`/candidates/results/${jobDescId}`, { params }),
  exportCSV: (jobDescId) =>
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/candidates/export/${jobDescId}`, {
      responseType: 'blob',
    }),
};