"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageCircle, Search } from "lucide-react";
import Link from "next/link";

interface Conversation {
  _id: string;
  conversationId: string;
  participantId: string;
  participantUsername: string;
  participantProfilePic?: string;
  messageCount: number;
  unreadCount?: number;
  lastMessageAt?: string;
  lastMessage?: string;
}

interface Message {
  _id: string;
  instagramSenderId: string;
  senderUsername: string;
  content: string;
  direction: "incoming" | "outgoing";
  hasReply?: boolean;
  replyType?: "predefined" | "ai";
  createdAt: string;
  deliveryStatus?: "sending" | "sent" | "failed";
}

export default function InboxPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);
  const [autoDmEnabled, setAutoDmEnabled] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoAutoRunning, setDemoAutoRunning] = useState(false);
  const [demoExternalUser, setDemoExternalUser] = useState("new_customer_01");
  const [demoExternalMessage, setDemoExternalMessage] = useState(
    "Hi, can you share pricing details?",
  );
  const [demoConversation, setDemoConversation] = useState<Conversation | null>(
    null,
  );
  const [demoMessages, setDemoMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  const isDemoConversation =
    selectedConversation?._id === demoConversation?._id;
  const incomingDemoCount = demoMessages.filter(
    (msg) => msg.direction === "incoming",
  ).length;
  const outgoingDemoCount = demoMessages.filter(
    (msg) => msg.direction === "outgoing",
  ).length;

  const formatRelativeTime = (value?: string) => {
    if (!value) return "Just now";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";

    const diffMs = Date.now() - date.getTime();
    const sec = Math.max(1, Math.floor(diffMs / 1000));
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);

    if (sec < 60) return `${sec}s ago`;
    if (min < 60) return `${min}m ago`;
    if (hour < 24) return `${hour}h ago`;
    if (day < 7) return `${day}d ago`;

    return date.toLocaleDateString();
  };

  const buildAiSuggestion = (incomingText: string) => {
    const text = incomingText.toLowerCase();

    // Monthly/Pricing plans
    if (
      text.includes("monthly") ||
      text.includes("plan") ||
      text.includes("pricing")
    ) {
      return "Great question! We offer flexible monthly plans starting at $49/month. Our pricing scales with your needs. Would you like a personalized recommendation?";
    }

    // Features inquiry
    if (text.includes("feature")) {
      return "Our platform includes: AI-powered content suggestions, multi-channel posting, analytics dashboard, team collaboration, and automated scheduling. Happy to dive deeper into what matters most to you!";
    }

    // Integration questions
    if (
      text.includes("integrat") ||
      text.includes("shopify") ||
      text.includes("api")
    ) {
      return "Yes! We integrate with Shopify, WooCommerce, Stripe, and major social platforms. We also have a REST API for custom integrations. What integration would be most useful for you?";
    }

    // Team/White-label
    if (
      text.includes("team") ||
      text.includes("white-label") ||
      text.includes("agency")
    ) {
      return "Definitely. We offer team accounts with role-based permissions and white-label options for agencies. You can manage unlimited team members and clients. Let's discuss your specific needs!";
    }

    // Volume/Pricing
    if (text.includes("500") || text.includes("volume")) {
      return "For 500 posts/month with our Team plan, you're looking at around $199/month with priority support. We can also discuss custom enterprise pricing if needed.";
    }

    // General availability
    if (text.includes("available") || text.includes("stock")) {
      return "Yes, we're fully operational and ready to help! We offer 24/7 onboarding support to get you up and running in minutes.";
    }

    // Default friendly response
    return "Thanks for reaching out! We're here to help. Could you share a bit more about what you're looking for?";
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    const latestIncoming = [...messages]
      .reverse()
      .find((msg) => msg.direction === "incoming");
    setAiSuggestion(
      latestIncoming ? buildAiSuggestion(latestIncoming.content) : "",
    );
  }, [messages, selectedConversation?._id]);

  // Declare fetchConversations before useEffect
  const fetchConversations = useCallback(
    async (options: { showLoader?: boolean } = {}) => {
      const { showLoader = true } = options;
      const token = localStorage.getItem("token");
      const previouslySelectedId = selectedConversationRef.current?._id;

      try {
        if (showLoader) {
          setLoading(true);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/accounts/${accountId}/conversations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch conversations");

        const data = await res.json();
        const nextConversations: Conversation[] = data.conversations || [];
        setConversations(nextConversations);

        if (nextConversations.length > 0) {
          if (previouslySelectedId) {
            const selectedStillExists = nextConversations.find(
              (conv) => conv._id === previouslySelectedId,
            );
            if (selectedStillExists) {
              setSelectedConversation(selectedStillExists);
            }
          } else {
            setSelectedConversation(nextConversations[0]);
          }
        }

        setLastRefreshAt(new Date().toISOString());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error fetching conversations";
        setError(errorMessage);
        console.error("Fetch conversations error:", err);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [accountId],
  );

  // Fetch conversations on mount - fetchConversations is stable via useCallback
  useEffect(() => {
    if (accountId) {
      fetchConversations();
    } else {
      setLoading(false);
      setError("No account selected. Please select an account first.");
    }
  }, [accountId, fetchConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (
        demoMode &&
        demoConversation &&
        conversationId === demoConversation._id
      ) {
        setMessages(demoMessages);
        return;
      }

      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/conversations/${conversationId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        setMessages(
          (data.messages || []).map((msg: Message) => ({
            ...msg,
            deliveryStatus: "sent",
          })),
        );
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    },
    [demoConversation, demoMessages, demoMode],
  );

  // Real-time updates via polling to surface incoming Instagram DMs quickly.
  useEffect(() => {
    if (!accountId || demoMode) return;

    const interval = setInterval(async () => {
      await fetchConversations({ showLoader: false });

      const current = selectedConversationRef.current;
      if (current?._id) {
        await fetchMessages(current._id);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [accountId, demoMode, fetchConversations, fetchMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    if (
      demoMode &&
      demoConversation &&
      selectedConversation._id === demoConversation._id
    ) {
      const now = new Date();
      const newOutgoingMessage: Message = {
        _id: `demo-out-${Date.now()}`,
        instagramSenderId: accountId || "demo-account",
        senderUsername: "dashboard_agent",
        content: messageText.trim(),
        direction: "outgoing",
        createdAt: now.toISOString(),
      };

      const nextMessages = [...demoMessages, newOutgoingMessage];
      setDemoMessages(nextMessages);
      setMessages(nextMessages);
      setMessageText("");

      setDemoConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messageCount: (prev.messageCount || 0) + 1,
          lastMessage: newOutgoingMessage.content,
          lastMessageAt: newOutgoingMessage.createdAt,
        };
      });

      setConversations((items) =>
        items.map((conv) =>
          conv._id === selectedConversation._id
            ? {
                ...conv,
                messageCount: (conv.messageCount || 0) + 1,
                lastMessage: newOutgoingMessage.content,
                lastMessageAt: newOutgoingMessage.createdAt,
              }
            : conv,
        ),
      );
      return;
    }

    const trimmedMessage = messageText.trim();
    const optimisticId = `local-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const optimisticMessage: Message = {
      _id: optimisticId,
      instagramSenderId: accountId || "account",
      senderUsername: "You",
      content: trimmedMessage,
      direction: "outgoing",
      createdAt,
      deliveryStatus: "sending",
    };

    setMessages((items) => [...items, optimisticMessage]);
    setConversations((items) =>
      items.map((conv) =>
        conv._id === selectedConversation._id
          ? {
              ...conv,
              lastMessage: trimmedMessage,
              lastMessageAt: createdAt,
              messageCount: (conv.messageCount || 0) + 1,
            }
          : conv,
      ),
    );
    setMessageText("");
    setSending(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountId,
            participantId: selectedConversation.participantId,
            message: trimmedMessage,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to send message");

      setMessages((items) =>
        items.map((msg) =>
          msg._id === optimisticId ? { ...msg, deliveryStatus: "sent" } : msg,
        ),
      );
      await fetchMessages(selectedConversation._id);
    } catch (err) {
      setMessages((items) =>
        items.map((msg) =>
          msg._id === optimisticId ? { ...msg, deliveryStatus: "failed" } : msg,
        ),
      );
      const errorMessage =
        err instanceof Error ? err.message : "Error sending message";
      setError(errorMessage);
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantUsername.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const startDmDemo = () => {
    const now = new Date().toISOString();
    const conv: Conversation = {
      _id: "demo-conversation-1",
      conversationId: "demo-conversation-1",
      participantId: "demo-participant-1",
      participantUsername: demoExternalUser,
      messageCount: 0,
      unreadCount: 0,
      lastMessage:
        "Demo mode ready. Simulate an incoming Instagram DM to start.",
      lastMessageAt: now,
    };

    setDemoMode(true);
    setDemoConversation(conv);
    setDemoMessages([]);
    setSelectedConversation(conv);
    setMessages([]);
    setError(null);
  };

  const simulateIncomingInstagramMessage = () => {
    if (
      !demoMode ||
      !demoConversation ||
      !demoExternalUser.trim() ||
      !demoExternalMessage.trim()
    )
      return;

    const now = new Date().toISOString();
    const incomingMessage: Message = {
      _id: `demo-in-${Date.now()}`,
      instagramSenderId: "ig-user-live-demo",
      senderUsername: demoExternalUser.trim(),
      content: demoExternalMessage.trim(),
      direction: "incoming",
      createdAt: now,
    };

    const nextMessages = [...demoMessages, incomingMessage];
    const nextConversation: Conversation = {
      ...demoConversation,
      participantUsername: demoExternalUser.trim(),
      unreadCount: 1,
      messageCount: (demoConversation.messageCount || 0) + 1,
      lastMessage: incomingMessage.content,
      lastMessageAt: now,
    };

    setDemoMessages(nextMessages);
    setDemoConversation(nextConversation);
    setSelectedConversation(nextConversation);
    setMessages(nextMessages);
    setConversations((items) => {
      const filtered = items.filter(
        (conv) => conv._id !== nextConversation._id,
      );
      return [nextConversation, ...filtered];
    });

    // Auto-reply if auto-DM is enabled
    if (autoDmEnabled) {
      setTimeout(() => {
        const aiReply: Message = {
          _id: `demo-auto-${Date.now()}`,
          instagramSenderId: accountId || "demo-account",
          senderUsername: "dashboard_agent",
          content: buildAiSuggestion(demoExternalMessage.trim()),
          direction: "outgoing",
          createdAt: new Date().toISOString(),
          hasReply: true,
          replyType: "ai",
        };

        const messagesWithReply = [...nextMessages, aiReply];
        setDemoMessages(messagesWithReply);
        setMessages(messagesWithReply);

        setDemoConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messageCount: (prev.messageCount || 0) + 1,
            lastMessage: aiReply.content,
            lastMessageAt: aiReply.createdAt,
          };
        });

        setConversations((items) =>
          items.map((conv) =>
            conv._id === nextConversation._id
              ? {
                  ...conv,
                  messageCount: (conv.messageCount || 0) + 1,
                  lastMessage: aiReply.content,
                  lastMessageAt: aiReply.createdAt,
                }
              : conv,
          ),
        );
      }, 2000);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setMessageText(aiSuggestion);
  };

  const runAutoDemo = () => {
    if (demoAutoRunning) return;
    if (!demoMode) {
      startDmDemo();
    }

    setDemoAutoRunning(true);

    // Demo sequence with realistic customer inquiries and AI auto-replies
    const demoSequence = [
      {
        delayMs: 500,
        user: "sarah_marketing",
        message: "Hi! Do you have monthly plans?",
      },
      {
        delayMs: 3000,
        user: "alex_startup",
        message: "What features are included in your service?",
      },
      {
        delayMs: 6000,
        user: "james_ecommerce",
        message: "Can I integrate this with Shopify?",
      },
      {
        delayMs: 9000,
        user: "lisa_agency",
        message: "Do you offer team accounts and white-label options?",
      },
      {
        delayMs: 12000,
        user: "mike_startup",
        message: "What's your pricing for 500 posts per month?",
      },
    ];

    // Process each demo message
    demoSequence.forEach((item) => {
      setTimeout(() => {
        setDemoExternalUser(item.user);
        setDemoExternalMessage(item.message);
        simulateIncomingInstagramMessage();
      }, item.delayMs);
    });

    // Final completion
    setTimeout(() => {
      setDemoAutoRunning(false);
    }, 14000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-muted">Loading conversations...</div>
      </div>
    );
  }

  if (!accountId && !demoMode) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center space-y-4">
          <MessageCircle className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-30" />
          <p className="font-heading font-semibold text-brand-text mb-2">
            No Account Selected
          </p>
          <p className="text-brand-muted">
            Please select an account to view its inbox.
          </p>
          <p className="text-brand-muted text-sm">
            Or start a built-in live DM demo without connecting an account.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={startDmDemo} className="btn-secondary">
              Start Live DM Demo
            </button>
            <Link href="/dashboard">
              <button className="btn-primary">Go to Dashboard</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">
          Messages Inbox
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-brand-muted text-sm">
          <p>
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </p>
          {lastRefreshAt && (
            <p>Live sync: {formatRelativeTime(lastRefreshAt)}</p>
          )}
          <p className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Webhook stream active
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-4 border border-brand-border">
          <p className="text-xs text-brand-muted">Connected Channel</p>
          <p className="text-sm font-semibold text-brand-text mt-1">
            Instagram DM API
          </p>
        </div>
        <div className="card p-4 border border-brand-border">
          <p className="text-xs text-brand-muted">Average Response Time</p>
          <p className="text-sm font-semibold text-brand-text mt-1">1m 42s</p>
        </div>
        <div className="card p-4 border border-brand-border">
          <p className="text-xs text-brand-muted">SLA Health</p>
          <p className="text-sm font-semibold text-green-700 mt-1">
            97.8% within 5 mins
          </p>
        </div>
      </div>

      {/* Auto-DM Features Demo */}
      <div className="mb-6 card p-5 border border-brand-primary/30 bg-brand-primary/5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <p className="font-heading font-semibold text-brand-text">
              Auto-DM Features (AI Auto-Reply)
            </p>
            <p className="text-sm text-brand-muted mt-1">
              Incoming user messages automatically trigger AI-generated responses. Watch the live conversation flow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDmEnabled}
                onChange={(e) => setAutoDmEnabled(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm font-semibold text-brand-text">
                Enable Auto-DM
              </span>
            </label>
            <button onClick={startDmDemo} className="btn-primary">
              {demoMode ? "Reset Demo" : "Start Demo"}
            </button>
          </div>
        </div>

        {demoMode && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={demoExternalUser}
                onChange={(e) => setDemoExternalUser(e.target.value)}
                placeholder="Incoming user (e.g., new_customer_01)"
                className="input text-sm"
              />
              <input
                type="text"
                value={demoExternalMessage}
                onChange={(e) => setDemoExternalMessage(e.target.value)}
                placeholder="User message"
                className="input text-sm md:col-span-2"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={simulateIncomingInstagramMessage}
                disabled={
                  !demoMode ||
                  !demoExternalUser.trim() ||
                  !demoExternalMessage.trim()
                }
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send User Message
              </button>
              <button
                onClick={runAutoDemo}
                disabled={demoAutoRunning}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoAutoRunning ? "Running Demo..." : "Run Full Auto-Reply Demo"}
              </button>
              {autoDmEnabled && (
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Auto-DM is active - User messages will auto-reply with AI
                </span>
              )}
            </div>
          </div>
        )}
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
          <p className="font-heading font-semibold text-brand-text mb-2">
            No Conversations Yet
          </p>
          <p className="text-brand-muted">
            Messages from followers will appear here when they send you a
            message.
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
                  <p className="text-sm text-brand-muted text-center py-8">
                    No conversations found
                  </p>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3 rounded-[10px] text-left transition-colors ${
                        selectedConversation?._id === conv._id
                          ? "bg-brand-primary/10 border border-brand-primary"
                          : "hover:bg-brand-light border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/15 text-brand-primary font-semibold text-xs flex items-center justify-center flex-shrink-0">
                          {(conv.participantUsername || "U")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-text text-sm truncate">
                            @{conv.participantUsername}
                          </p>
                          <p className="text-xs text-brand-muted truncate">
                            {conv.lastMessage || "No messages yet"}
                          </p>
                          <p className="text-[11px] text-brand-muted mt-1">
                            {formatRelativeTime(conv.lastMessageAt)}
                          </p>
                          <p className="text-[10px] text-brand-primary mt-1">
                            Instagram Direct Message
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
                  <div className="flex flex-wrap gap-3 text-xs text-brand-muted mt-1">
                    <p>{selectedConversation.messageCount} messages</p>
                    <p className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Live conversation
                    </p>
                    <p>
                      Last active:{" "}
                      {formatRelativeTime(selectedConversation.lastMessageAt)}
                    </p>
                  </div>
                  {demoMode && isDemoConversation && (
                    <p className="text-xs text-brand-primary mt-1 font-semibold">
                      🔴 DEMO MODE - Live Auto-DM Conversation
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-brand-muted text-sm">
                        No messages in this conversation
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg._id}>
                        <div
                          className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-[12px] ${
                              msg.direction === "outgoing"
                                ? "bg-brand-primary text-white"
                                : "bg-brand-light text-brand-text border border-brand-border"
                            }`}
                          >
                            <p className="text-sm break-words">{msg.content}</p>
                            <div className="flex items-center justify-between mt-2 gap-2 text-xs opacity-70">
                              <span>{formatRelativeTime(msg.createdAt)}</span>
                              {msg.direction === "outgoing" &&
                                msg.deliveryStatus && (
                                  <span>
                                    {msg.deliveryStatus === "sending" &&
                                      "Sending..."}
                                    {msg.deliveryStatus === "sent" && "Sent"}
                                    {msg.deliveryStatus === "failed" && "Failed"}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        {msg.direction === "outgoing" && msg.hasReply && (
                          <div className="flex justify-end mt-2 mr-2">
                            <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                              ✓ {msg.replyType === "ai" ? "AI Auto-Reply Sent" : "Auto-Reply Sent"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-brand-border">
                  <p className="text-[11px] text-brand-muted mb-2">
                    Replies are synced to Instagram and saved in
                    conversation history automatically.
                  </p>
                  {isDemoConversation && autoDmEnabled && (
                    <div className="mb-3 p-3 rounded-[10px] bg-green-50 border border-green-200">
                      <p className="text-xs font-semibold text-green-800 flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Auto-DM Active
                      </p>
                      <p className="text-xs text-green-700">
                        When a user sends a message, AI will automatically generate and send a reply.
                      </p>
                    </div>
                  )}
                  <div className="mb-3 p-3 rounded-[10px] bg-brand-light border border-brand-border">
                    <p className="text-xs font-semibold text-brand-text mb-1">
                      AI Suggested Reply
                    </p>
                    <p className="text-sm text-brand-muted">
                      {aiSuggestion ||
                        "Select a conversation with incoming messages to get AI suggestions."}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={applyAiSuggestion}
                        disabled={!aiSuggestion || sending}
                        className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Use Suggestion
                      </button>
                      <button
                        onClick={() => {
                          if (!aiSuggestion) return;
                          setMessageText(aiSuggestion);
                          setTimeout(() => {
                            handleSendMessage();
                          }, 0);
                        }}
                        disabled={!aiSuggestion || sending}
                        className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Use and Send
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !sending) {
                          e.preventDefault();
                          handleSendMessage();
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
  );
}
