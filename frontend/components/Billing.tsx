/**
 * Billing Component
 * Manage subscriptions, plans, invoices, and payment methods
 */

'use client';

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Download,
  Settings,
  Calendar as _Calendar,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Type definitions
interface PlanLimits {
  instagramAccounts: number;
  automationRules: number;
  aiReplies: number;
  monthlyMessages: number;
}

interface Plan {
  name: string;
  price: number;
  limits: PlanLimits;
}

interface Plans {
  [key: string]: Plan;
}

const Billing = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<Plans>({});
  const [usage, setUsage] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [upgradeInProgress, setUpgradeInProgress] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, usageRes, invoicesRes, paymentRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/billing/subscription`),
          axios.get(`${API_URL}/api/billing/plans`),
          axios.get(`${API_URL}/api/billing/usage`),
          axios.get(`${API_URL}/api/billing/invoices`),
          axios.get(`${API_URL}/api/billing/payment-method`),
        ]);

      setSubscription(subRes.data);
      setPlans(plansRes.data.plans);
      setUsage(usageRes.data);
      setInvoices(invoicesRes.data.invoices);
      setPaymentMethod(paymentRes.data.paymentMethod);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      message.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planKey) => {
    setUpgradeInProgress(true);
    try {
      const response = await axios.post(`${API_URL}/api/billing/checkout`, {
        plan: planKey,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      message.error('Failed to initiate upgrade');
    } finally {
      setUpgradeInProgress(false);
    }
  };

  const handleCancel = async (immediate = false) => {
    try {
      const endpoint = immediate ? '/cancel' : '/cancel-at-period-end';
      await axios.post(`${API_URL}/api/billing${endpoint}`);

      message.success(
        immediate
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at the end of your current period'
      );

      setShowCancelModal(false);
      await fetchData();
    } catch (error) {
      console.error('Cancel error:', error);
      message.error('Failed to cancel subscription');
    }
  };

  const handleStartTrial = async () => {
    try {
      const _response = await axios.post(
        `${API_URL}/api/billing/trial/start`,
        { trialDays: 14 }
      );

      message.success('14-day free trial started! Enjoy Pro features.');
      await fetchData();
    } catch (error) {
      console.error('Trial error:', error);
      message.error(
        error.response?.data?.error || 'Failed to start free trial'
      );
    }
  };

  const _getPlanColor = (plan) => {
    switch (plan) {
      case 'free':
        return 'gray';
      case 'starter':
        return 'blue';
      case 'pro':
        return 'purple';
      case 'agency':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getPlanBgColor = (plan) => {
    const colors = {
      free: 'bg-gray-50 dark:bg-slate-800',
      starter: 'bg-blue-50 dark:bg-blue-900/20',
      pro: 'bg-purple-50 dark:bg-purple-900/20',
      agency: 'bg-orange-50 dark:bg-orange-900/20',
    };
    return colors[plan] || colors.free;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription, plans, and billing information
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-slate-700">
          {['plans', 'usage', 'invoices', 'payment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                {/* Current Plan */}
                {subscription && (
                  <div
                    className={`p-6 rounded-lg border-2 border-blue-500 ${getPlanBgColor(subscription.plan)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                          {subscription.plan} Plan
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Your current plan
                        </p>
                        {subscription.subscription?.status === 'trialing' && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Free trial until{' '}
                            {new Date(subscription.trialEndsAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {subscription.plan !== 'free' && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-medium"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(plans).map(([key, plan]: [string, Plan]) => (
                    <div
                      key={key}
                      className={`p-6 rounded-lg border-2 ${
                        subscription?.plan === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-slate-700'
                      } transition hover:shadow-lg`}
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {plan.name}
                      </h3>
                      <div className="mt-3 mb-4">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                      </div>

                      <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{plan.limits.instagramAccounts} accounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{plan.limits.automationRules} rules</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{plan.limits.aiReplies.toLocaleString()} AI replies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{plan.limits.monthlyMessages.toLocaleString()} messages/month</span>
                        </li>
                      </ul>

                      {subscription?.plan === key ? (
                        <button
                          disabled
                          className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium cursor-default opacity-60"
                        >
                          Current Plan
                        </button>
                      ) : subscription?.plan === 'free' && key !== 'free' ? (
                        <>
                          {key === 'pro' && subscription.plan === 'free' && (
                            <button
                              onClick={handleStartTrial}
                              className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition mb-2"
                            >
                              Start 14-Day Trial
                            </button>
                          )}
                          <button
                            onClick={() => handleUpgrade(key)}
                            disabled={upgradeInProgress}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                          >
                            {upgradeInProgress ? 'Processing...' : 'Upgrade'}
                          </button>
                        </>
                      ) : subscription?.plan !== 'free' && key !== 'free' ? (
                        <button
                          onClick={() => handleUpgrade(key)}
                          disabled={upgradeInProgress}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {upgradeInProgress ? 'Processing...' : 'Change Plan'}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && usage && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram Accounts */}
                  <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Instagram Accounts
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.usage.accountsUsed} / {usage.limits.instagramAccounts}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.percentages.accountsUsed}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            usage.percentages.accountsUsed >= 80
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${usage.percentages.accountsUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Automation Rules */}
                  <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Automation Rules
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.usage.rulesUsed} / {usage.limits.automationRules}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.percentages.rulesUsed}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            usage.percentages.rulesUsed >= 80
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${usage.percentages.rulesUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Replies */}
                  <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      AI Replies
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.usage.aiRepliesUsed.toLocaleString()} /{' '}
                          {usage.limits.aiReplies.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.percentages.aiRepliesUsed}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            usage.percentages.aiRepliesUsed >= 80
                              ? 'bg-red-500'
                              : 'bg-purple-500'
                          }`}
                          style={{ width: `${usage.percentages.aiRepliesUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Messages */}
                  <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Monthly Messages
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.usage.messagesThisMonth.toLocaleString()} /{' '}
                          {usage.limits.monthlyMessages.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {usage.percentages.messagesThisMonth}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            usage.percentages.messagesThisMonth >= 80
                              ? 'bg-red-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${usage.percentages.messagesThisMonth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {usage.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Usage Warnings
                    </h3>
                    <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                      {usage.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No invoices yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Invoice ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                            {invoice.id}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                            ${(invoice.amount / 100).toFixed(2)} {invoice.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                invoice.status === 'paid'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <a
                              href={invoice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h2>

                  {paymentMethod ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Current Payment Method
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                              {paymentMethod.brand} •••• {paymentMethod.last4}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                            </p>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                      </div>

                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                        Update Payment Method
                      </button>
                    </div>
                  ) : (
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                      Add Payment Method
                    </button>
                  )}
                </div>

                {/* Billing Portal */}
                <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Billing Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Manage your billing information, payment methods, and subscription in the Stripe portal
                  </p>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                    Open Billing Portal
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Cancel Subscription
              </h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your subscription? You&apos;ll lose access to premium features.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleCancel(false)}
                className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
              >
                Cancel at Period End
              </button>
              <button
                onClick={() => handleCancel(true)}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
              >
                Cancel Immediately
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
