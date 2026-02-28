import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { useAuthStore } from './store';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api';
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // include cookies for cross-origin auth
  timeout: 15000, // 15 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand store first (has priority for fresh logins)
    let { token } = useAuthStore.getState();
    
    // If not in store, try localStorage (fallback for page reloads)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
      if (token) {
        console.debug(`[API] Found token in localStorage for ${config.url}, syncing to Zustand`);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url} - Token: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`[API] ${config.method?.toUpperCase()} ${config.url} - No auth token available`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.debug('[API] Received 401, attempting token refresh');
      
      try {
        let { token } = useAuthStore.getState();
        
        // If no token in store, check localStorage
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('token');
        }
        
        // If still no token, clear everything and reject
        if (!token) {
          console.log('[API] No token available for refresh, logging out');
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          return Promise.reject(error);
        }
        
        // Call refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true, // ensure cookies are sent during refresh
          }
        );

        const { token: newToken } = response.data;
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().login(currentUser, newToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
          }
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.debug('[API] Token refreshed, retrying request');
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('[API] Token refresh failed, clearing session');
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Generic request method
  request: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient(url, config);
    return response.data;
  },

  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.request<T>(url, { ...config, method: 'GET' });
  },

  // POST request
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.request<T>(url, { ...config, method: 'POST', data });
  },

  // PUT request
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.request<T>(url, { ...config, method: 'PUT', data });
  },

  // PATCH request
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.request<T>(url, { ...config, method: 'PATCH', data });
  },

  // DELETE request
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.request<T>(url, { ...config, method: 'DELETE' });
  },
};

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, password: string, firstName: string, lastName: string) =>
    api.post('/auth/signup', { email, password, firstName, lastName }),

  me: () => api.get('/auth/me'),

  updateProfile: (data: any) =>
    api.put('/auth/profile', data),

  refreshToken: () => api.post('/auth/refresh', {}),

  logout: () => api.post('/auth/logout', {}),

  resetPassword: (email: string) =>
    api.post('/auth/reset-password', { email }),

  confirmReset: (token: string, password: string) =>
    api.post('/auth/confirm-reset', { token, password }),
};

// Instagram endpoints
export const instagramAPI = {
  getAccounts: () => api.get('/instagram/accounts'),

  connectAccount: (accessToken: string) =>
    api.post('/instagram/connect', { accessToken }),

  disconnectAccount: (accountId: string) =>
    api.delete(`/instagram/accounts/${accountId}`),

  getAccountInfo: (accountId: string) =>
    api.get(`/instagram/accounts/${accountId}`),

  syncConversations: (accountId: string) =>
    api.post(`/instagram/accounts/${accountId}/sync`, {}),

  getConversations: (accountId: string, page = 1, limit = 20) =>
    api.get(`/instagram/accounts/${accountId}/conversations`, {
      params: { page, limit },
    }),

  getConversationMessages: (accountId: string, conversationId: string) =>
    api.get(
      `/instagram/accounts/${accountId}/conversations/${conversationId}/messages`
    ),

  sendMessage: (
    accountId: string,
    conversationId: string,
    message: string
  ) =>
    api.post(`/instagram/accounts/${accountId}/conversations/${conversationId}/send`, {
      message,
    }),
};

// Rules endpoints
export const rulesAPI = {
  getRules: (accountId?: string) =>
    api.get('/rules', { params: { accountId } }),

  createRule: (data: any) => api.post('/rules', data),

  updateRule: (ruleId: string, data: any) =>
    api.put(`/rules/${ruleId}`, data),

  deleteRule: (ruleId: string) =>
    api.delete(`/rules/${ruleId}`),

  toggleRule: (ruleId: string) =>
    api.patch(`/rules/${ruleId}/toggle`, {}),

  testRule: (ruleId: string, text: string) =>
    api.post(`/rules/${ruleId}/test`, { text }),
};

// Conversations endpoints
export const conversationsAPI = {
  getConversations: (page = 1, limit = 20) =>
    api.get('/conversations', { params: { page, limit } }),

  getConversation: (conversationId: string) =>
    api.get(`/conversations/${conversationId}`),

  getMessages: (conversationId: string, page = 1, limit = 50) =>
    api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),

  markAsRead: (conversationId: string) =>
    api.patch(`/conversations/${conversationId}/read`, {}),

  searchConversations: (query: string) =>
    api.get('/conversations/search', { params: { q: query } }),
};

// Billing endpoints
export const billingAPI = {
  getPlans: () => api.get('/billing/plans'),

  getSubscription: () => api.get('/billing/subscription'),

  createCheckout: (planId: string) =>
    api.post('/billing/checkout', { planId }),

  cancelSubscription: () =>
    api.post('/billing/subscription/cancel', {}),

  updatePaymentMethod: (paymentMethodId: string) =>
    api.put('/billing/payment-method', { paymentMethodId }),

  getInvoices: (page = 1, limit = 10) =>
    api.get('/billing/invoices', { params: { page, limit } }),
};

// Analytics endpoints
export const analyticsAPI = {
  getStats: (accountId?: string) =>
    api.get('/analytics/stats', { params: { accountId } }),

  getMetrics: (startDate: string, endDate: string) =>
    api.get('/analytics/metrics', {
      params: { startDate, endDate },
    }),

  getRuleStats: (ruleId: string) =>
    api.get(`/analytics/rules/${ruleId}`, {}),

  getConversationStats: (conversationId: string) =>
    api.get(`/analytics/conversations/${conversationId}`, {}),
};

export default api;
