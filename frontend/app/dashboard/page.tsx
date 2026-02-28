"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  CheckCircle as _CheckCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { authAPI } from "../../lib/api";
import { useAuthStore } from "../../lib/store";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  usage: {
    messagesThisMonth: number;
    rulesUsed: number;
    aiRepliesUsed: number;
  };
  limits: {
    automationRules: number;
    aiReplies: number;
  };
  trialEndsAt?: string;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { login } = useAuthStore();

  useEffect(() => {
    // Check for Facebook OAuth callback
    const fbauth = searchParams.get('fbauth');
    const token = searchParams.get('token');
    const fbUser = searchParams.get('user');
    
    const handleOAuthCallback = async () => {
      if (fbauth === 'success' && token) {
        console.log(`[OAuth] Received token from backend, storing in localStorage and auth store...`);
        
        // Store token in localStorage for persistence
        localStorage.setItem('token', token);
        
        // CRITICAL: Update Zustand auth store immediately so API interceptor can find the token
        // This ensures all subsequent API requests have the Authorization header
        login({ 
          id: '', 
          email: '', 
          firstName: fbUser || 'User',
          lastName: '',
          plan: 'free',
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
          }
        }, token);
        
        // Clear URL params BEFORE fetching user data
        window.history.replaceState({}, '', '/dashboard');
        
        console.log(`✅ OAuth callback processed. Now fetching user data...`);
        
        // Now fetch the user data to complete the auth flow
        try {
          const data = await authAPI.me();
          console.log('[OAuth] User data fetched successfully:', data);
          
          if (data && data.user) {
            setUser(data.user);
            // Update Zustand with complete user data
            login(data.user, token);
            console.log(`✅ Facebook OAuth complete! Welcome ${data.user.firstName}`);
          }
        } catch (error: any) {
          console.error('[OAuth] Error fetching user data:', error.response?.status, error.message);
          if (error.response?.status === 401) {
            console.error('[OAuth] Token invalid or expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            useAuthStore.getState().logout();
            window.location.href = "/login?error=Token%20expired";
          }
        } finally {
          setLoading(false);
        }
      }
    };
    
    handleOAuthCallback();
  }, [searchParams, login]);

  useEffect(() => {
    // Only run this effect if NOT coming from OAuth callback
    const fbauth = searchParams.get('fbauth');
    if (fbauth) {
      // OAuth flow is handled by the first useEffect above
      return;
    }
    
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn('[Dashboard] No token found, redirecting to login');
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    const fetchUser = async () => {
      try {
        console.log('[Dashboard] Fetching user data with token...');
        const data = await authAPI.me();
        console.log('[Dashboard] User data fetched successfully:', data);
        
        if (data && data.user) {
          setUser(data.user);
          
          // Update Zustand auth store with complete user data
          login(data.user, token);
        } else {
          throw new Error("Server returned no user data");
        }
      } catch (error: any) {
        console.error('[Dashboard] Error fetching user:', error.response?.status, error.message);
        
        // Check if it's an auth error
        if (error.response?.status === 401) {
          console.error('[Dashboard] Token invalid or expired, clearing session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          useAuthStore.getState().logout();
        }
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams, login]); // Re-fetch user when FB auth completes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-brand-muted mb-4">Failed to load user data</div>
          <button
            onClick={() => (window.location.href = "/login")}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Messages This Month",
      value: user.usage.messagesThisMonth,
      icon: Users,
      color: "from-brand-primary to-brand-primary-dark",
      bgColor: "bg-brand-primary-50",
    },
    {
      label: "Automation Rules",
      value: `${user.usage.rulesUsed}/${user.limits.automationRules}`,
      icon: Zap,
      color: "from-brand-accent to-brand-accent-dark",
      bgColor: "bg-brand-accent-50",
    },
    {
      label: "AI Replies Used",
      value: user.usage.aiRepliesUsed,
      icon: BarChart3,
      color: "from-brand-secondary to-brand-secondary-dark",
      bgColor: "bg-brand-secondary-50",
    },
    {
      label: "Current Plan",
      value: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
      icon: TrendingUp,
      color: "from-brand-primary to-brand-secondary",
      bgColor: "bg-brand-primary-50",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-bold text-brand-text mb-3">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-lg text-brand-text-secondary">
          Here's what's happening with your automations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`card-elevated ${stat.bgColor} border-none group hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-text-secondary mb-1">
                    {stat.label}
                  </p>
                  <p
                    className={`text-3xl font-heading font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-1 bg-brand-border rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color}`}
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card-elevated border-none">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold text-brand-text">
                Quick Actions
              </h2>
              <span className="text-xs font-semibold text-brand-muted">
                Get started fast
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/accounts">
                <button className="btn-primary w-full h-24 flex flex-col items-center justify-center gap-2 group hover:shadow-primary hover:scale-105 active:scale-95">
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-semibold">Connect Account</span>
                </button>
              </Link>
              <Link href="/dashboard/rules">
                <button className="btn-secondary w-full h-24 flex flex-col items-center justify-center gap-2 group hover:scale-105 active:scale-95">
                  <Zap className="w-6 h-6" />
                  <span className="text-sm font-semibold">Create Rule</span>
                </button>
              </Link>
              <Link href="/dashboard/inbox">
                <button className="btn-secondary w-full h-24 flex flex-col items-center justify-center gap-2 group hover:scale-105 active:scale-95">
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-semibold">View Inbox</span>
                </button>
              </Link>
              <Link href="/dashboard/billing">
                <button className="btn-secondary w-full h-24 flex flex-col items-center justify-center gap-2 group hover:scale-105 active:scale-95">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm font-semibold">Manage Billing</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="card-elevated border-none bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-heading font-bold text-brand-text">
              Your Plan
            </h3>
            <div className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-full">
              {user.plan.toUpperCase()}
            </div>
          </div>
          <p className="text-brand-text-secondary mb-6 leading-relaxed">
            {user.plan === "free"
              ? "🚀 Ready to unlock more features? Upgrade your plan to get more accounts, rules, and AI replies."
              : user.trialEndsAt
                ? `⏰ Your trial ends on ${new Date(user.trialEndsAt).toLocaleDateString()}`
                : "✅ You're on an active plan with full features enabled."}
          </p>
          {user.plan === "free" && (
            <Link href="/dashboard/billing">
              <button className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 hover:shadow-primary hover:scale-105 active:scale-95">
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8 card-elevated border-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-heading font-bold text-brand-text">
            Getting Started Guide
          </h2>
          <span className="px-3 py-1 bg-brand-success-50 text-brand-success text-xs font-bold rounded-full">
            3 steps
          </span>
        </div>
        <div className="space-y-5">
          {[
            {
              number: 1,
              title: "Connect Your Instagram Account",
              desc: "Link your Instagram account securely to start managing automations.",
              icon: "📱",
            },
            {
              number: 2,
              title: "Create Your First Automation Rule",
              desc: "Set up rules to automatically respond to keywords, hashtags, or specific users.",
              icon: "⚡",
            },
            {
              number: 3,
              title: "Monitor & Optimize",
              desc: "Track performance in your inbox and analytics to improve automation effectiveness.",
              icon: "📊",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-4 p-4 rounded-lg bg-brand-light-2 hover:bg-brand-light transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-sm font-bold flex items-center justify-center">
                  {step.number}
                </div>
                {step.number < 3 && (
                  <div className="w-0.5 h-12 bg-brand-border ml-5 mt-10" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-semibold text-brand-text group-hover:text-brand-primary transition-colors">
                  {step.title}
                </p>
                <p className="text-sm text-brand-text-secondary mt-1">
                  {step.desc}
                </p>
              </div>
              <span className="text-2xl">{step.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
