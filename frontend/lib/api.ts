// Stub API for dashboard - fixes missing authAPI import
// Provides type-safe API calls without backend dependency

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authAPI = {
  // Email/Password login
  emailLogin: async (email: string, password: string) => {
    return axios.post(`${API_URL}/login`, {
      email,
      password,
    });
  },

  // Facebook login (redirect)
  facebookLogin: () => {
    window.location.href = `${API_URL}/auth/facebook`;
  },

  // User info (unchanged)
  me: async (): Promise<ApiResponse<{ user: { id: string; firstName: string; lastName: string; email: string; plan: string; usage: { messagesThisMonth: number; rulesUsed: number; aiRepliesUsed: number; }; limits: { automationRules: number; aiReplies: number }; trialEndsAt?: string; }; }>> => {
    // Simulate user data from localStorage for demo
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      return {
        success: true,
        data: {
          user: JSON.parse(userStr),
        },
      };
    }
    return {
      success: false,
      error: "No user data found",
    };
  },
};
