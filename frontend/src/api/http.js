import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centralized error logging
    console.error('API Error:', err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default http;
