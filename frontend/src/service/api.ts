// API Configuration - Use Render backend for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nextstepbackend-qhxw.onrender.com';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',

    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure endpoint starts with /api (backend routes are prefixed with /api)
  const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
    ...options,
    headers,
    cache: 'no-store', // Prevent caching for real-time data
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Save token to localStorage
export const saveAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove token from localStorage
export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

export { API_BASE_URL };

