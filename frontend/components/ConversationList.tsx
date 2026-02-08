/**
 * ConversationList Component
 * Displays list of Instagram conversations with real-time updates,
 * filtering, searching, and conversation management features
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";

import { message } from "antd";
import {
  MessageCircle,
  Search,
  Settings,
  AlertCircle,
  Star,
  Archive,
  Flag,
  MoreVertical,
  Loader,
} from "lucide-react";
import axios from "axios";

interface Conversation {
  _id: string;
  userId: string;
  instagramAccountId: string;
  participantId: string;
  participantUsername: string;
  participantProfilePic?: string;
  lastMessage?: string;
  lastMessageAt: Date;
  createdAt: Date;
  unreadCount: number;
  messageCount: number;
  isPriority: boolean;
  isSpam: boolean;
  isActive: boolean;
  automationEnabled: boolean;
  tags: string[];
  overallSentiment?: string;
}

interface ConversationListProps {
  accountId: string;
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const ConversationList: React.FC<ConversationListProps> = ({
  accountId,
  onSelectConversation,
  selectedConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "spam" | "priority">(
    "all",
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(
    async (page = 1, searchTerm = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          accountId,
          page: String(page),
          limit: "20",
          filter,
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await axios.get(
          `${API_URL}/api/conversations?${params}`,
        );
        const { success, data, pagination } = response.data;

        if (success) {
          setConversations(data || []);
          setCurrentPage(page);
          setTotalPages(pagination?.pages || 1);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        message.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    },
    [accountId, filter],
  );

  // Search conversations
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.length === 0) {
        await fetchConversations(1);
        return;
      }

      if (query.length < 2) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/conversations/search`,
          {
            params: {
              accountId,
              q: query,
              limit: 20,
            },
          },
        );

        const { success, data } = response.data;
        if (success) {
          setConversations(data || []);
        }
      } catch (error) {
        console.error("Error searching conversations:", error);
        message.error("Search failed");
      } finally {
        setLoading(false);
      }
    },
    [accountId, fetchConversations],
  );

  // Mark as spam
  const handleMarkSpam = async (conversationId: string, isSpam: boolean) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/conversations/${conversationId}/spam`,
        { accountId, isSpam: !isSpam },
      );

      if (response.data.success) {
        message.success(`Marked as ${!isSpam ? "spam" : "not spam"}`);
        await fetchConversations(currentPage, searchQuery);
      }
    } catch (error) {
      console.error("Error marking as spam:", error);
      message.error("Failed to mark as spam");
    }
    setActionMenu(null);
  };

  // Mark as priority
  const handleMarkPriority = async (
    conversationId: string,
    isPriority: boolean,
  ) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/conversations/${conversationId}/priority`,
        { accountId, isPriority: !isPriority },
      );

      if (response.data.success) {
        message.success(`Marked as ${!isPriority ? "priority" : "normal"}`);
        await fetchConversations(currentPage, searchQuery);
      }
    } catch (error) {
      console.error("Error marking as priority:", error);
      message.error("Failed to mark as priority");
    }
    setActionMenu(null);
  };

  // Archive conversation
  const handleArchive = async (conversationId: string) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/conversations/${conversationId}/archive`,
        { accountId },
      );

      if (response.data.success) {
        message.success("Conversation archived");
        await fetchConversations(currentPage, searchQuery);
      }
    } catch (error) {
      console.error("Error archiving conversation:", error);
      message.error("Failed to archive conversation");
    }
    setActionMenu(null);
  };

  // Initial load and refetch on filter/accountId change
  useEffect(() => {
    fetchConversations(1, searchQuery);
  }, [filter, accountId, fetchConversations, searchQuery]);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
  };

  // Filter conversations (client-side backup)
  useEffect(() => {
    let result = conversations;

    if (filter === "unread") {
      result = result.filter((c) => c.unreadCount > 0);
    } else if (filter === "spam") {
      result = result.filter((c) => c.isSpam);
    } else if (filter === "priority") {
      result = result.filter((c) => c.isPriority);
    }

    setFilteredConversations(result);
  }, [conversations, filter]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 1) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days < 7) {
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const _getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-500";
      case "negative":
        return "text-red-500";
      case "neutral":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inbox
            </h2>
          </div>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {["all", "unread", "spam", "priority"].map((f) => (
          <button
            key={f}
            onClick={() =>
              setFilter(f as "all" | "unread" | "spam" | "priority")
            }
            className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap transition ${
              filter === f
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`p-3 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-slate-800 border-l-4 ${
                  selectedConversationId === conversation._id
                    ? "border-blue-500 bg-blue-50 dark:bg-slate-800"
                    : "border-transparent"
                } ${conversation.isSpam ? "opacity-60" : ""}`}
                onClick={() => handleSelectConversation(conversation._id)}
              >
                <div className="flex items-start gap-3 relative">
                  {/* Avatar */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      conversation.participantProfilePic ||
                      "https://via.placeholder.com/40"
                    }
                    alt={conversation.participantUsername}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.participantUsername}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {formatDate(conversation.lastMessageAt)}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage || "No messages yet"}
                    </p>

                    {/* Tags and Badges */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                      {conversation.isPriority && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      )}
                      {conversation.isSpam && (
                        <Flag className="w-3 h-3 text-red-500" />
                      )}
                      {!conversation.automationEnabled && (
                        <span title="Automation disabled">
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                        </span>
                      )}
                      {conversation.tags?.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{conversation.tags.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenu(
                          actionMenu === conversation._id
                            ? null
                            : conversation._id,
                        );
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Action Dropdown */}
                    {actionMenu === conversation._id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            handleMarkPriority(
                              conversation._id,
                              conversation.isPriority,
                            )
                          }
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-700"
                        >
                          <Star className="w-4 h-4" />
                          {conversation.isPriority
                            ? "Remove from Priority"
                            : "Mark as Priority"}
                        </button>
                        <button
                          onClick={() =>
                            handleMarkSpam(
                              conversation._id,
                              conversation.isSpam,
                            )
                          }
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-700"
                        >
                          <Flag className="w-4 h-4" />
                          {conversation.isSpam
                            ? "Mark as Not Spam"
                            : "Mark as Spam"}
                        </button>
                        <button
                          onClick={() => handleArchive(conversation._id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-900 dark:text-white flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => fetchConversations(currentPage - 1, searchQuery)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => fetchConversations(currentPage + 1, searchQuery)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
