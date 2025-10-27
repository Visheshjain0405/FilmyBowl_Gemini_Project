import axios from 'axios';

const api = axios.create({
  baseURL: 'https://filmybowl-gemini-project.onrender.com/api',
  timeout: 60000,
});

export default api;
