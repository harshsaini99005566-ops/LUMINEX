"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { authAPI } from "../lib/api";
import { useAuthStore } from "../lib/store";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const fbauth = params.get("fbauth");
        const callbackToken = params.get("token");

        if (fbauth === "success" && callbackToken) {
          console.log("[AuthGuard] OAuth callback detected, priming token before verification");
          localStorage.setItem("token", callbackToken);
          useAuthStore.getState().login(
            {
              id: "",
              email: "",
              firstName: "User",
              lastName: "",
              plan: "free",
              createdAt: new Date().toISOString(),
              usage: {
                accountsUsed: 0,
                messagesThisMonth: 0,
                rulesUsed: 0,
                aiRepliesUsed: 0,
                lastResetDate: new Date().toISOString(),
              },
              limits: {
                instagramAccounts: 0,
                automationRules: 0,
                aiReplies: 0,
                monthlyMessages: 0,
              },
            },
            callbackToken
          );
        }

        console.log("[AuthGuard] Verifying authentication...");
        await authAPI.me();
        console.log("[AuthGuard] Authentication successful");

        if (isMounted) {
          setVerified(true);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("[AuthGuard] Authentication failed:", error?.response?.status, error?.message);

        if (isMounted) {
          const params = new URLSearchParams(window.location.search);
          const fbauth = params.get("fbauth");
          const callbackToken = params.get("token");

          if (fbauth === "success" && callbackToken) {
            console.warn("[AuthGuard] OAuth callback present, allowing dashboard to finalize auth");
            setVerified(true);
            setLoading(false);
            return;
          }

          localStorage.removeItem("token");
          localStorage.removeItem("user");
          useAuthStore.getState().logout();
          setLoading(false);
          router.push("/login");
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark text-cyber-primary">
        <div className="text-center">
          <div className="text-xl font-mono mb-4">⚡ Verifying session...</div>
          <div className="w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return null;
  }

  return <>{children}</>;
}
