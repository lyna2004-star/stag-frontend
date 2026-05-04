import axios from 'axios';

const api = axios.create({
  // تم تغيير الرابط من localhost إلى رابط Render الجديد
  baseURL: 'https://stag-backend-z7vh.onrender.com', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

export default api;