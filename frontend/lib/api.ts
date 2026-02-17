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
  withCredentials: true, // include cookies for auth
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // First try to get token from Zustand store
    let { token } = useAuthStore.getState();
    
    // If not in store, try localStorage (for when page loads)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Interceptor adding token to ${config.method?.toUpperCase()} ${config.url}`);
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
      try {
        const { token } = useAuthStore.getState();
        
        // If no token or malformed token, clear everything and reject
        if (!token) {
          console.log('[API] No token available for refresh, logging out');
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
        
        // Call refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // ensure cookies are sent during refresh
          }
        );

        const { token: newToken } = response.data;
        useAuthStore.getState().login(useAuthStore.getState().user!, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('[API] Token refresh failed, clearing session');
        useAuthStore.getState().logout();
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
