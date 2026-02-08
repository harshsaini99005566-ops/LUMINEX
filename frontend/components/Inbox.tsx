/**
 * Inbox Component
 * Unified Instagram conversation inbox with conversation list and chat display
 * Combines ConversationList and ChatDisplay with responsive layout
 */

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  MessageCircle,
  Settings,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import ConversationList from './ConversationList';
import ChatDisplay from './ChatDisplay';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface InstagramAccount {
  _id: string;
  username: string;
  profilePic?: string;
  followerCount?: number;
  followingCount?: number;
}

interface InboxProps {
  onLogout?: () => void;
}

const Inbox: React.FC<InboxProps> = ({ onLogout }) => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [_loadingStats, _setLoadingStats] = useState(false);

  // Fetch Instagram accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/instagram/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { success, data } = response.data;

        if (success && data && data.length > 0) {
          setAccounts(data);
          setSelectedAccountId(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        message.error('Failed to load Instagram accounts');
      }
    };

    fetchAccounts();
  }, []);

  // Fetch statistics
  const fetchStats = async () => {
    if (!selectedAccountId) return;

    _setLoadingStats(true);
    try {
      const response = await axios.get(`${API_URL}/api/conversations/stats`, {
        params: { accountId: selectedAccountId },
      });

      const { success, data } = response.data;
      if (success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      _setLoadingStats(false);
    }
  };

  const handleShowStats = () => {
    if (!showStats) {
      fetchStats();
    }
    setShowStats(!showStats);
  };

  const _currentAccount = accounts.find((a) => a._id === selectedAccountId);

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6" />
          <div>
            <h1 className="text-lg font-bold">VEXORA Inbox</h1>
            <p className="text-xs opacity-90">Instagram Automation Manager</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleShowStats}
            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-lg transition"
            title="View statistics"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Stats</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-lg transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="text-sm">Notifications</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 hover:bg-red-600 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700 text-white px-4 py-3 space-y-2 border-b border-blue-600">
          <button
            onClick={handleShowStats}
            className="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg transition flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistics</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg transition flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg transition flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 hover:bg-red-600 rounded-lg transition flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Account Selector */}
      {accounts.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Instagram Account
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setSelectedConversationId('');
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                @{account.username}
                {account.followerCount &&
                  ` (${(account.followerCount / 1000).toFixed(1)}K followers)`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Statistics Panel */}
      {showStats && stats && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Total Conversations
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalConversations || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Unread
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.unreadCount || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Automation Rate
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.automationRate?.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.avgResponseTime ? `${stats.avgResponseTime}m` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className="w-full md:w-96 flex-shrink-0">
          {selectedAccountId && (
            <ConversationList
              accountId={selectedAccountId}
              onSelectConversation={setSelectedConversationId}
              selectedConversationId={selectedConversationId}
            />
          )}
        </div>

        {/* Chat Display */}
        {selectedConversationId && selectedAccountId ? (
          <div className="hidden md:flex flex-1">
            <ChatDisplay
              conversationId={selectedConversationId}
              accountId={selectedAccountId}
              onBack={() => setSelectedConversationId('')}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation to start</p>
              <p className="text-sm opacity-75 mt-1">
                Choose from your inbox to view and reply to messages
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Chat View */}
      {selectedConversationId && selectedAccountId && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col">
          <ChatDisplay
            conversationId={selectedConversationId}
            accountId={selectedAccountId}
            onBack={() => setSelectedConversationId('')}
          />
        </div>
      )}
    </div>
  );
};

export default Inbox;
