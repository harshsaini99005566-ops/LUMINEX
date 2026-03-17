"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Search, Send, Sparkles } from "lucide-react";
import { initialConversations, type ChatMessage } from "./shared-conversations";

const nowLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const generateAiReply = (text: string) => {
  const value = text.toLowerCase();

  if (value.includes("price") || value.includes("pricing") || value.includes("plan")) {
    return "Great question. We have plans from $49/month and can recommend the right one based on your volume.";
  }

  if (value.includes("delivery") || value.includes("time") || value.includes("support")) {
    return "We usually complete onboarding in under 24 hours and support is available throughout setup.";
  }

  if (value.includes("shopify") || value.includes("integration") || value.includes("api")) {
    return "Yes, Shopify and API integrations are supported. I can share quick setup steps if you want.";
  }

  return "Thanks for your message. Please share your exact requirement and we will guide you quickly.";
};

export default function InboxPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState("conv-luminex");
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [replyMode, setReplyMode] = useState<"ai" | "manual">("ai");
  const [statusText, setStatusText] = useState("AI Reply mode active");
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) || conversations[0],
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(
    () =>
      conversations.filter((item) =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  );

  const pushMessage = (conversationId: string, message: ChatMessage) => {
    setConversations((items) => {
      const next = items.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unread:
                message.role === "customer" && selectedConversationId !== conversationId
                  ? conv.unread + 1
                  : conv.unread,
              messages: [...conv.messages, message],
            }
          : conv,
      );

      const updated = next.find((conv) => conv.id === conversationId);
      const others = next.filter((conv) => conv.id !== conversationId);
      return updated ? [updated, ...others] : next;
    });
  };

  const sendAgentReply = () => {
    if (!draft.trim() || !selectedConversation) return;

    pushMessage(selectedConversation.id, {
      id: `agent-${Date.now()}`,
      role: "agent",
      text: draft.trim(),
      time: nowLabel(),
    });

    setDraft("");
    setStatusText("Message posted successfully on Instagram");
    setShowPublishPopup(true);
  };

  const simulateIncoming = () => {
    if (!selectedConversation) return;

    const incomingSamples = [
      "Can you share pricing details?",
      "Do you support multiple team members?",
      "How long does setup take?",
      "Can you send me feature list?",
    ];
    const incomingText = incomingSamples[Math.floor(Math.random() * incomingSamples.length)];

    pushMessage(selectedConversation.id, {
      id: `in-${Date.now()}`,
      role: "customer",
      text: incomingText,
      time: nowLabel(),
    });

    setStatusText(`New message from ${selectedConversation.username}`);

    if (replyMode === "ai") {
      window.setTimeout(() => {
        pushMessage(selectedConversation.id, {
          id: `ai-${Date.now()}`,
          role: "ai",
          text: generateAiReply(incomingText),
          time: nowLabel(),
        });

        setStatusText("Automated reply sent");
      }, 1200);
    } else {
      setStatusText("Message received - Manual reply mode");
    }
  };

  const lastMessage = selectedConversation?.messages[selectedConversation.messages.length - 1];

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [selectedConversationId, selectedConversation?.messages.length]);

  useEffect(() => {
    if (!showPublishPopup) return;
    const timer = window.setTimeout(() => setShowPublishPopup(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showPublishPopup]);

  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <div className="h-full card-elevated border-none p-0 overflow-hidden">
        <div className="h-16 border-b border-brand-border px-6 flex items-center justify-between bg-white">
          <div>
            <h1 className="text-lg font-heading font-bold text-brand-text">Instagram Messages</h1>
            <p className="text-xs text-brand-text-secondary">AI-powered messaging with automated replies</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReplyMode("ai");
                setStatusText("AI Reply mode active");
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                replyMode === "ai" ? "bg-brand-primary text-white" : "bg-brand-light text-brand-text"
              }`}
            >
              <Bot className="w-4 h-4 inline mr-1" />
              AI Reply
            </button>
            <button
              onClick={() => {
                setReplyMode("manual");
                setStatusText("Manual reply mode active");
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                replyMode === "manual" ? "bg-brand-primary text-white" : "bg-brand-light text-brand-text"
              }`}
            >
              <Send className="w-4 h-4 inline mr-1" />
              Manual Reply
            </button>
            <button onClick={simulateIncoming} className="btn-secondary text-xs">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Simulate Incoming
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-4rem)] grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          <aside className="border-r border-brand-border p-4 bg-brand-light/30">
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chat"
                className="input-field pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[calc(100vh-15rem)] overflow-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    setConversations((items) =>
                      items.map((item) =>
                        item.id === conv.id ? { ...item, unread: 0 } : item,
                      ),
                    );
                  }}
                  className={`w-full text-left p-3 rounded-lg border ${
                    selectedConversationId === conv.id
                      ? "bg-brand-primary-50 border-brand-primary-100"
                      : "bg-white border-brand-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {conv.avatarUrl ? (
                        <img
                          src={conv.avatarUrl}
                          alt={`@${conv.username}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {conv.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-text">{conv.username}</p>
                      <p className="text-xs text-brand-text-secondary mt-1 line-clamp-1">
                        {conv.messages[conv.messages.length - 1]?.text || "No messages yet"}
                      </p>
                      {conv.unread > 0 && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] rounded-full bg-brand-primary text-white">
                          {conv.unread} unread
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex flex-col min-h-0">
            <div className="h-14 border-b border-brand-border px-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3 min-w-0">
                {selectedConversation?.avatarUrl ? (
                  <img
                    src={selectedConversation.avatarUrl}
                    alt={`@${selectedConversation.username}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {selectedConversation?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <p className="font-semibold text-brand-text truncate">{selectedConversation?.username}</p>
              </div>
              <p className="text-xs text-brand-text-secondary">{statusText}</p>
            </div>

            <div className="flex-1 min-h-0">
              <div ref={chatScrollRef} className="overflow-auto p-5 space-y-4 bg-white">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Today</span>
                </div>
                {selectedConversation?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "customer" ? "justify-start" : "justify-end"}`}
                  >
                    {msg.role === "customer" && (
                      <div className="relative flex-shrink-0 pt-1">
                        {selectedConversation?.avatarUrl ? (
                          <img
                            src={selectedConversation.avatarUrl}
                            alt={`@${selectedConversation.username}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {selectedConversation?.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-sm ${msg.role === "customer" ? "items-start" : "items-end"} flex flex-col`}>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          msg.role === "customer"
                            ? "bg-gray-200 text-gray-900 rounded-bl-2xl"
                            : "bg-blue-500 text-white rounded-br-2xl shadow-sm"
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                      </div>
                      <p className="text-xs mt-1 text-gray-500">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-border p-4 bg-white">
              {replyMode === "manual" ? (
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendAgentReply();
                      }
                    }}
                    placeholder="Type a manual reply"
                    className="input-field"
                  />
                  <button onClick={sendAgentReply} className="btn-primary px-4">
                    <Send className="w-4 h-4 inline mr-1" />
                    Publish
                  </button>
                </div>
              ) : (
                <div className="text-xs text-brand-text-secondary bg-brand-primary-50 border border-brand-primary-100 rounded-lg px-3 py-2">
                  AI Reply mode is active. New incoming messages are answered automatically.
                </div>
              )}
              {lastMessage && (
                <p className="text-xs text-brand-text-secondary mt-2 inline-flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Last message: {lastMessage.time}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      {showPublishPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
          <div className="min-w-[320px] max-w-[90vw] rounded-2xl bg-green-600 text-white px-8 py-6 shadow-2xl border-2 border-green-500 text-center">
            <p className="text-xl font-extrabold tracking-wide">Posting Success</p>
            <p className="text-base font-semibold mt-2">Message posted successfully on Instagram</p>
          </div>
        </div>
      )}
    </div>
  );
}
