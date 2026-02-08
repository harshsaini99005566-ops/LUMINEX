import { useState } from 'react';
import { useConversationStore } from '../lib/store';
import { conversationsAPI } from '../lib/api';
import { Conversation, Message, ApiResponse, PaginatedResponse } from '../types';

export function useConversations() {
  const {
    conversations,
    selectedConversationId,
    messages,
    isLoading,
    setConversations,
    addConversation,
    setMessages,
    selectConversation,
    updateConversation,
    addMessage: _addMessage,
  } = useConversationStore();
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async (page = 1, limit = 20) => {
    setError(null);
    try {
      const response: ApiResponse<PaginatedResponse<Conversation>> =
        await conversationsAPI.getConversations(page, limit);
      const items = response.data?.items || [];
      setConversations(items);
      return response.data || { items, total: items.length, page: 1, pageSize: limit, hasMore: false };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch conversations';
      setError(errorMessage);
      throw err;
    }
  };

  const getConversation = async (conversationId: string) => {
    setError(null);
    try {
      const response: ApiResponse<Conversation> = await conversationsAPI.getConversation(
        conversationId
      );
      const conv = conversations.find((c: Conversation) => c.id === conversationId);
      if (conv) {
        updateConversation(conversationId, response.data);
      } else {
        addConversation(response.data);
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch conversation';
      setError(errorMessage);
      throw err;
    }
  };

  const getMessages = async (conversationId: string, page = 1, limit = 50) => {
    setError(null);
    try {
      const response: ApiResponse<PaginatedResponse<Message>> = await conversationsAPI.getMessages(
        conversationId,
        page,
        limit
      );
      const items = response.data?.items || [];
      setMessages(conversationId, items);
      return response.data || { items, total: items.length, page: 1, pageSize: limit, hasMore: false };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch messages';
      setError(errorMessage);
      throw err;
    }
  };

  const markAsRead = async (conversationId: string) => {
    setError(null);
    try {
      await conversationsAPI.markAsRead(conversationId);
      updateConversation(conversationId, { unreadCount: 0 });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to mark as read';
      setError(errorMessage);
      throw err;
    }
  };

  const searchConversations = async (query: string) => {
    setError(null);
    try {
      const response: ApiResponse<Conversation[]> = await conversationsAPI.searchConversations(
        query
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to search conversations';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    conversations,
    selectedConversationId,
    selectedConversation: conversations.find((c: Conversation) => c.id === selectedConversationId) || null,
    selectedMessages: selectedConversationId ? messages[selectedConversationId] || [] : [],
    isLoading,
    error,
    fetchConversations,
    getConversation,
    getMessages,
    markAsRead,
    searchConversations,
    selectConversation,
  };
}
