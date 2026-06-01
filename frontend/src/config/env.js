// Using relative URL to leverage Vite proxy in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
// Public API URL exposed via Vite env (e.g. VITE_API_URL=https://your-backend-domain.com)
export const API = import.meta.env.VITE_API_URL || API_BASE_URL;
