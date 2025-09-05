import axios from 'axios';
import { toast } from 'react-toastify';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const apiRequest = async (config, retries = 0) => {
  try {
    const response = await axios({
      ...config,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    return response.data;
  } catch (error) {
    // Handle rate limiting (429 status code)
    if (error.response?.status === 429) {
      if (retries < MAX_RETRIES) {
        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest(config, retries + 1);
      }
      toast.error('Too many requests. Please wait a moment and try again.');
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status !== 401) { // Don't show toast for unauthorized errors
      toast.error(errorMessage);
    }
    throw error;
  }
};

// Create a wrapper for common API methods
export const api = {
  get: (url, config = {}) => apiRequest({ ...config, method: 'GET', url }),
  post: (url, data, config = {}) => apiRequest({ ...config, method: 'POST', url, data }),
  put: (url, data, config = {}) => apiRequest({ ...config, method: 'PUT', url, data }),
  delete: (url, config = {}) => apiRequest({ ...config, method: 'DELETE', url }),
  patch: (url, data, config = {}) => apiRequest({ ...config, method: 'PATCH', url, data }),
};
