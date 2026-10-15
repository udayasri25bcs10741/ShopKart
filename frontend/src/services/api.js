import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Crucial: Send and receive HttpOnly cookies across origins
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
