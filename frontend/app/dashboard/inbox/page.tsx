'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, MessageCircle, Search } from 'lucide-react'
import Link from 'next/link'

interface Conversation {
  _id: string
  conversationId: string
  participantId: string
  participantUsername: string
  participantProfilePic?: string
  messageCount: number
  unreadCount?: number
  lastMessageAt?: string
  lastMessage?: string
}

interface Message {
  _id: string
  instagramSenderId: string
  senderUsername: string
  content: string
  direction: 'incoming' | 'outgoing'
  hasReply?: boolean
  replyType?: 'predefined' | 'ai'
  createdAt: string
}

export default function InboxPage() {
  const searchParams = useSearchParams()
  const accountId = searchParams.get('account')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Declare fetchConversations before useEffect
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token')
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/accounts/${accountId}/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) throw new Error('Failed to fetch conversations')

      const data = await res.json()
      setConversations(data.conversations || [])

      if (data.conversations?.length > 0) {
        setSelectedConversation(data.conversations[0])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching conversations'
      setError(errorMessage)
      console.error('Fetch conversations error:', err)
    } finally {
      setLoading(false)
    }
  }, [accountId])

  // Fetch conversations on mount - fetchConversations is stable via useCallback
  useEffect(() => {
    if (accountId) {
      fetchConversations()
    } else {
      setLoading(false)
      setError('No account selected. Please select an account first.')
    }
  }, [accountId, fetchConversations])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
    }
  }, [selectedConversation])

  const fetchMessages = async (conversationId: string) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) throw new Error('Failed to fetch messages')

      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Fetch messages error:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)
    const token = localStorage.getItem('token')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountId,
            participantId: selectedConversation.participantId,
            message: messageText,
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to send message')

      setMessageText('')
      await fetchMessages(selectedConversation._id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending message'
      setError(errorMessage)
      console.error('Send message error:', err)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participantUsername.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-muted">Loading conversations...</div>
      </div>
    )
  }

  if (!accountId) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <MessageCircle className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-30" />
          <p className="font-heading font-semibold text-brand-text mb-2">No Account Selected</p>
          <p className="text-brand-muted mb-6">Please select an account to view its inbox.</p>
          <Link href="/dashboard">
            <button className="btn-primary">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">
          Inbox
        </h1>
        <p className="text-brand-muted">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-brand-error/10 border border-brand-error rounded-[10px] text-brand-error text-sm flex items-start gap-3">
          <span className="text-lg mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout */}
      {conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageCircle className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-30" />
          <p className="font-heading font-semibold text-brand-text mb-2">No Conversations Yet</p>
          <p className="text-brand-muted">
            Messages from followers will appear here when they send you a message.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Conversations List */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <div className="card p-4 flex-1 flex flex-col">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full text-sm"
                />
              </div>

              {/* Conversation Items */}
              <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-1">
                {filteredConversations.length === 0 ? (
                  <p className="text-sm text-brand-muted text-center py-8">No conversations found</p>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3 rounded-[10px] text-left transition-colors ${
                        selectedConversation?._id === conv._id
                          ? 'bg-brand-primary/10 border border-brand-primary'
                          : 'hover:bg-brand-light border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-text text-sm truncate">
                            @{conv.participantUsername}
                          </p>
                          <p className="text-xs text-brand-muted truncate">
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-semibold">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-brand-muted mt-2">
                        {conv.messageCount} messages
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {selectedConversation ? (
              <div className="card p-0 flex flex-col h-full overflow-hidden">
                {/* Conversation Header */}
                <div className="p-4 border-b border-brand-border">
                  <p className="font-heading font-semibold text-brand-text">
                    @{selectedConversation.participantUsername}
                  </p>
                  <p className="text-xs text-brand-muted mt-1">
                    {selectedConversation.messageCount} messages
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-brand-muted text-sm">No messages in this conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-[12px] ${
                            msg.direction === 'outgoing'
                              ? 'bg-brand-primary text-white'
                              : 'bg-brand-light text-brand-text border border-brand-border'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          <div className="flex items-center justify-between mt-2 gap-2 text-xs opacity-70">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {msg.hasReply && (
                              <span>
                                {msg.replyType === 'predefined' && 'Auto-replied'}
                                {msg.replyType === 'ai' && 'AI replied'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-brand-border">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !sending) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="input flex-1 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sending}
                      className="btn-primary px-4 py-2.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 flex items-center justify-center text-center">
                <div>
                  <p className="font-heading font-semibold text-brand-text mb-2">
                    Select a Conversation
                  </p>
                  <p className="text-brand-muted text-sm">
                    Choose from your inbox to view and reply to messages.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
