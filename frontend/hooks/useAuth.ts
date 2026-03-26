import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/store";
import { authAPI } from "../lib/api";
import { User, ApiResponse } from "../types";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    setLoading,
    isLoading,
  } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response: ApiResponse<{ user: User; token: string }> =
        await authAPI.login(email, password);
      login(response.data.user, response.data.token);
      router.push("/dashboard");
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    setError(null);
    setLoading(true);
    try {
      const response: ApiResponse<{ user: User; token: string }> =
        await authAPI.register(email, password, firstName, lastName);
      login(response.data.user, response.data.token);
      router.push("/dashboard");
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
      router.push("/login");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    setError(null);
    setLoading(true);
    try {
      const response: ApiResponse<User> = await authAPI.updateProfile(data);
      updateUser(response.data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Update failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authAPI.resetPassword(email);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Reset failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (token: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authAPI.confirmReset(token, password);
      router.push("/login");
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Reset confirmation failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    resetPassword: handleResetPassword,
    confirmReset: handleConfirmReset,
  };
}
