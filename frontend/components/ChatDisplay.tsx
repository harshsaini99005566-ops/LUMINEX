/**
 * ChatDisplay Component
 * Shows message history in a modern chat interface with real-time updates,
 * message composition, and conversation management
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message as antMessage } from 'antd';
import {
  Send,
  Loader,
  AlertCircle,
  Settings as _Settings,
  PauseCircle,
  PlayCircle,
  MoreVertical,
  Paperclip,
  Smile,
  Clock,
  CheckCheck,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  replyType?: 'manual' | 'automated' | 'ai' | 'handoff';
  mediaUrls?: string[];
  sentiment?: string;
  createdAt: Date;
  isRead?: boolean;
}

interface Conversation {
  _id: string;
  participantUsername: string;
  participantProfilePic?: string;
  automationEnabled: boolean;
  isPriority: boolean;
  isSpam: boolean;
  tags: string[];
  unreadCount: number;
  messageCount: number;
  overallSentiment?: string;
}

interface ChatDisplayProps {
  conversationId: string;
  accountId: string;
  onBack?: () => void;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({
  conversationId,
  accountId,
  onBack,
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation and messages
  const fetchConversationData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/conversations/${conversationId}`,
          {
            params: {
              accountId,
              page,
              limit: 50,
            },
          }
        );

        const { success, conversation: conv, messages: msgs, pagination } = response.data;

        if (success) {
          setConversation(conv);
          setMessages(msgs || []);
          setCurrentPage(page);
          setTotalPages(pagination?.pages || 1);
          setAutomationEnabled(conv.automationEnabled);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        antMessage.error('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    },
    [conversationId, accountId]
  );

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/conversations/${conversationId}/reply`,
        {
          accountId,
          content: newMessage.trim(),
        }
      );

      if (response.data.success) {
        setNewMessage('');
        await fetchConversationData(totalPages);
        scrollToBottom();
        antMessage.success('Message sent');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      antMessage.error(
        error.response?.data?.error || 'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  // Toggle automation
  const handleToggleAutomation = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/conversations/${conversationId}/automation`,
        {
          accountId,
          enabled: !automationEnabled,
        }
      );

      if (response.data.success) {
        setAutomationEnabled(!automationEnabled);
        antMessage.success(
          `Automation ${!automationEnabled ? 'enabled' : 'disabled'}`
        );
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
      antMessage.error('Failed to toggle automation');
    }
  };

  // Load more messages
  const handleLoadMore = async () => {
    if (currentPage < totalPages) {
      await fetchConversationData(currentPage + 1);
    }
  };

  // Initial load - fetchConversationData is stable via useCallback
  useEffect(() => {
    fetchConversationData(1);
  }, [fetchConversationData]);

  const formatMessageTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatSentiment = (sentiment?: string) => {
    if (!sentiment) return null;
    const colors: Record<string, string> = {
      positive: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      negative: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    };
    return colors[sentiment.toLowerCase()] || '';
  };

  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              ←
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              conversation?.participantProfilePic ||
              'https://via.placeholder.com/40'
            }
            alt={conversation?.participantUsername}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">
              {conversation?.participantUsername}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {conversation?.messageCount} messages
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAutomation}
            className={`p-2 rounded-lg transition ${
              automationEnabled
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
            title={automationEnabled ? 'Automation enabled' : 'Automation disabled'}
          >
            {automationEnabled ? (
              <PlayCircle className="w-5 h-5" />
            ) : (
              <PauseCircle className="w-5 h-5" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700">
                  View Details
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700">
                  Manage Tags
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-red-600">
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        {/* Load More Button */}
        {currentPage < totalPages && (
          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 font-medium"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((msg, _index) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'
              } animate-fade-in`} 
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.direction === 'outgoing'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none'
                } shadow-sm`}
              >
                {/* Message Type Badge */}
                {msg.direction === 'outgoing' && msg.replyType && (
                  <div className="flex items-center gap-1 mb-1 text-xs opacity-90">
                    {msg.replyType === 'automated' ? (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>Automated</span>
                      </>
                    ) : msg.replyType === 'ai' ? (
                      <>
                        <span>🤖 AI</span>
                      </>
                    ) : (
                      <>
                        <span>✏️ Manual</span>
                      </>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <p className="text-sm break-words">{msg.content}</p>

                {/* Media (if any) */}
                {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {msg.mediaUrls.map((url, idx) => (
                      <div key={idx} className="inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="Message media"
                          className="max-w-xs rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Footer */}
                <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                  <span>{formatMessageTime(msg.createdAt)}</span>
                  {msg.direction === 'outgoing' && msg.isRead && (
                    <CheckCheck className="w-3 h-3" />
                  )}
                </div>

                {/* Sentiment Badge */}
                {msg.sentiment && msg.direction === 'incoming' && (
                  <div
                    className={`mt-2 text-xs px-2 py-1 rounded w-fit ${formatSentiment(
                      msg.sentiment
                    )}`}
                  >
                    {msg.sentiment.charAt(0).toUpperCase() +
                      msg.sentiment.slice(1)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {!automationEnabled && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-700 dark:text-orange-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Automation is paused for this conversation</span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <button
            type="button"
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as React.KeyboardEvent<HTMLTextAreaElement>);
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            rows={1}
            disabled={sending}
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition disabled:cursor-not-allowed flex items-center justify-center"
            title="Send message"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Character count */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {newMessage.length} / 4096 characters
        </p>
      </div>
    </div>
  );
};

export default ChatDisplay;
