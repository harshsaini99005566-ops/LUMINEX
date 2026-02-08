"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { authAPI } from "../lib/api";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        console.log("[AuthGuard] Verifying authentication...");
        await authAPI.me();
        console.log("[AuthGuard] Authentication successful");

        if (isMounted) {
          setVerified(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("[AuthGuard] Authentication failed:", error);
        console.log("[AuthGuard] Redirecting to login");

        if (isMounted) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
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
