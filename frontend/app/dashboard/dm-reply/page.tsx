"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCircle2, Instagram, MessageCircle, Send, Sparkles, UserRound, Zap } from "lucide-react";

type MessageRole = "user" | "ai" | "manual";

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  username: string;
  unread: number;
  messages: ChatMessage[];
};

const nowLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const generateAiReply = (text: string) => {
  const value = text.toLowerCase();

  if (value.includes("price") || value.includes("pricing") || value.includes("plan")) {
    return "Great question. Our plans start at $49/month and scale based on usage. I can send you the full comparison table.";
  }

  if (value.includes("integration") || value.includes("shopify") || value.includes("api")) {
    return "Yes, we support Shopify, API access, and webhook automation. I can share setup steps in 2 minutes.";
  }

  if (value.includes("team") || value.includes("agency") || value.includes("member")) {
    return "Yes. Team and agency workspaces include role permissions, shared inbox, and client-level access controls.";
  }

  return "Thanks for reaching out. Please share your requirement and our team will guide you with the right setup.";
};

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    username: "sarah_marketing",
    unread: 0,
    messages: [
      {
        id: "m-1",
        role: "user",
        text: "Hi, do you have monthly plans for small teams?",
        time: "10:49 AM",
      },
      {
        id: "m-2",
        role: "ai",
        text: "Yes, our Starter plan begins at $49/month. I can share a quick side-by-side plan comparison.",
        time: "10:49 AM",
      },
      {
        id: "m-3",
        role: "user",
        text: "Great, can I upgrade any time?",
        time: "10:50 AM",
      },
      {
        id: "m-4",
        role: "ai",
        text: "Absolutely. You can upgrade instantly from your dashboard with no downtime.",
        time: "10:50 AM",
      },
    ],
  },
  {
    id: "conv-2",
    username: "alex_startup",
    unread: 2,
    messages: [
      {
        id: "m-5",
        role: "user",
        text: "Can I connect this with Shopify?",
        time: "10:42 AM",
      },
      {
        id: "m-6",
        role: "ai",
        text: "Yes. Shopify integration is supported and webhook sync is included.",
        time: "10:42 AM",
      },
      {
        id: "m-7",
        role: "user",
        text: "Nice. Is setup hard?",
        time: "10:43 AM",
      },
    ],
  },
  {
    id: "conv-3",
    username: "lisa_agency",
    unread: 0,
    messages: [
      {
        id: "m-8",
        role: "user",
        text: "Do you support multiple team members?",
        time: "10:37 AM",
      },
      {
        id: "m-9",
        role: "manual",
        text: "Yes, we support multi-user workspaces with role-based permissions.",
        time: "10:38 AM",
      },
    ],
  },
  {
    id: "conv-4",
    username: "nina_store",
    unread: 1,
    messages: [
      {
        id: "m-10",
        role: "user",
        text: "Do you provide analytics for replies and conversions?",
        time: "10:24 AM",
      },
      {
        id: "m-11",
        role: "ai",
        text: "Yes. You get reply rate, response time, and conversion tracking in one dashboard.",
        time: "10:24 AM",
      },
      {
        id: "m-12",
        role: "user",
        text: "Perfect. Can you send sample reports?",
        time: "10:25 AM",
      },
    ],
  },
];

export default function DmReplyPage() {
  const [autoDmEnabled, setAutoDmEnabled] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingAiConversationId, setTypingAiConversationId] = useState<string | null>(null);
  const [dashboardReply, setDashboardReply] = useState("");
  const [isHumanAgentMode, setIsHumanAgentMode] = useState(false);
  const [autoReplyPopup, setAutoReplyPopup] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState(
    "Open Messages Inbox and use the flow controls to simulate real Instagram DM handling.",
  );

  // Instagram Business Account Info (Mock Data - Replace with API data)
  const instagramAccount = {
    connected: true,
    username: "luminex_labs",
    displayName: "luminex_labs",
    profilePicture: "/luminex-logo.png",
    followersCount: 12847,
    followingCount: 342,
    mediaCount: 156,
    biography: "AI-Powered Social Media Automation | DM Management | Analytics",
    accountType: "Business",
    isVerified: false,
  };

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) || conversations[0],
    [conversations, selectedConversationId],
  );

  const automaticReplyPreview = useMemo(() => {
    if (!selectedConversation) return null;

    const latestCustomerMessage = [...selectedConversation.messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (!latestCustomerMessage) {
      return null;
    }

    return generateAiReply(latestCustomerMessage.text);
  }, [selectedConversation]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((item) =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  );

  const applyMessageToConversation = (conversationId: string, message: ChatMessage) => {
    setConversations((items) => {
      const next = items.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unread:
                selectedConversationId === conversationId
                  ? 0
                  : message.role === "user"
                    ? conv.unread + 1
                    : conv.unread,
              messages: [...conv.messages, message],
            }
          : conv,
      );

      // Keep most recently updated conversation at top, like real inboxes.
      const updated = next.find((conv) => conv.id === conversationId);
      const others = next.filter((conv) => conv.id !== conversationId);
      return updated ? [updated, ...others] : next;
    });
  };

  const enableAutoReplyMode = () => {
    setAutoDmEnabled(true);
    setIsHumanAgentMode(false);
    setDeliveryStatus("Automatic AI reply mode on");

    if (!selectedConversation) {
      setAutoReplyPopup(null);
      return;
    }

    if (!automaticReplyPreview) {
      setAutoReplyPopup(null);
      return;
    }

    setAutoReplyPopup(automaticReplyPreview);
    window.setTimeout(() => {
      setAutoReplyPopup(null);
    }, 3500);
  };

  const enableManualReplyMode = () => {
    setAutoDmEnabled(false);
    setIsHumanAgentMode(true);
    setAutoReplyPopup(null);
    setDeliveryStatus("");
  };

  const sendManualReply = () => {
    if (!dashboardReply.trim() || !selectedConversation) return;

    applyMessageToConversation(selectedConversation.id, {
      id: `msg-manual-${Date.now()}`,
      role: "manual",
      text: dashboardReply.trim(),
      time: nowLabel(),
    });
    setDeliveryStatus("Human agent reply sent. The reply appears in Instagram DM.");
    setDashboardReply("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50/50 overflow-x-hidden">
      <div className="max-w-[2000px] mx-auto p-4 md:p-6 space-y-5">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Instagram Messages Inbox</h1>
            <p className="text-sm text-gray-600 mt-1">Manage DM conversations with AI-powered auto-replies</p>
          </div>
          <label className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border-2 border-rose-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer w-fit">
            <Zap className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-gray-800">Auto-DM</span>
            <input
              type="checkbox"
              checked={autoDmEnabled}
              onChange={(event) => {
                if (event.target.checked) {
                  enableAutoReplyMode();
                  return;
                }
                enableManualReplyMode();
              }}
              className="w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* ===== INSTAGRAM BUSINESS ACCOUNT ===== */}
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-xl border-2 border-purple-200 shadow-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Instagram className="w-6 h-6 text-purple-600" />
              <h2 className="text-base font-bold text-gray-900">Connected Instagram Business Account</h2>
              {instagramAccount.connected && (
                <span className="ml-auto flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold border border-green-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              )}
            </div>

            {instagramAccount.connected ? (
              <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Profile Info */}
                <div className="lg:col-span-8 bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white flex-shrink-0">
                      {instagramAccount.profilePicture ? (
                        <img 
                          src={instagramAccount.profilePicture} 
                          alt={instagramAccount.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Instagram className="w-10 h-10" />
                      )}
                    </div>

                    {/* Account Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{instagramAccount.displayName}</h3>
                        {instagramAccount.isVerified && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">@{instagramAccount.username}</p>
                      <div className="inline-flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold mb-3">
                        {instagramAccount.accountType} Account
                      </div>
                      
                      {instagramAccount.biography && (
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {instagramAccount.biography}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{instagramAccount.mediaCount}</p>
                          <p className="text-xs text-gray-500">Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{instagramAccount.followersCount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{instagramAccount.followingCount}</p>
                          <p className="text-xs text-gray-500">Following</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <Instagram className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-base font-semibold text-gray-900 mb-2">No Instagram Account Connected</p>
                <p className="text-sm text-gray-600 mb-4">Connect your Instagram Business account to start managing DMs</p>
                <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                  Connect Instagram Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== DM FLOW CONTROLS ===== */}
        <div className="bg-white rounded-xl border-2 border-rose-200 shadow-md p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2 p-1 rounded-lg bg-rose-50 border border-rose-200 w-fit">
              <button
                onClick={enableAutoReplyMode}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all ${
                  autoDmEnabled && !isHumanAgentMode
                    ? "bg-violet-600 text-white shadow"
                    : "text-violet-700 hover:bg-violet-100"
                }`}
              >
                Auto Reply
              </button>
              <button
                onClick={enableManualReplyMode}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all ${
                  isHumanAgentMode
                    ? "bg-amber-600 text-white shadow"
                    : "text-amber-700 hover:bg-amber-100"
                }`}
              >
                Manual Reply
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
            </div>
          </div>
        </div>

        {/* ===== MAIN INBOX LAYOUT ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" style={{ minHeight: '700px' }}>
          
          {/* ========== LEFT: CONVERSATIONS LIST ========== */}
          <div className="xl:col-span-3 bg-white rounded-xl border-2 border-gray-200 shadow-lg flex flex-col h-[700px] overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-orange-50 border-b-2 border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">Conversations</h2>
                <span className="text-xs bg-rose-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
                  {conversations.length}
                </span>
              </div>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all"
                placeholder="Search conversations..."
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const last = conv.messages[conv.messages.length - 1];
                  const isActive = selectedConversation?.id === conv.id;

                  return (
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isActive
                          ? "border-rose-500 bg-gradient-to-r from-rose-50 to-orange-50 shadow-md scale-[1.01]"
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-rose-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white text-sm font-bold flex items-center justify-center shadow-md flex-shrink-0">
                          {(conv.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-sm font-bold text-gray-900 truncate">@{conv.username}</p>
                            <span className="text-[11px] text-gray-500 font-medium">{last?.time || "Now"}</span>
                          </div>
                          <p className="text-xs text-gray-600 truncate leading-relaxed">
                            {last?.text || "No messages yet"}
                          </p>
                          {conv.unread > 0 && (
                            <span className="inline-flex mt-2 text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold shadow-sm">
                              {conv.unread} new
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ========== MIDDLE: DASHBOARD CHAT INTERFACE ========== */}
          <div className="xl:col-span-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden flex flex-col h-[700px]">
            <div className="px-5 py-4 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b-2 border-gray-200 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900">Dashboard Chat Interface</h2>
              <p className="text-xs text-gray-600 mt-1">Manage and reply to Instagram DMs from your dashboard</p>
            </div>
          
          {selectedConversation ? (
            <>
              <div className="px-5 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white text-base font-bold flex items-center justify-center shadow-lg ring-2 ring-white">
                    {selectedConversation.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">@{selectedConversation.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <p className="text-xs text-gray-600 font-medium">Active now</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white via-orange-50/20 to-rose-50/30">
                {autoDmEnabled && !isHumanAgentMode && autoReplyPopup && (
                  <div className="flex justify-end animate-fadeIn">
                    <div className="max-w-[72%] rounded-2xl px-5 py-3.5 border-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 border-transparent shadow-lg text-white">
                      <p className="text-xs mb-2 inline-flex items-center gap-2 font-bold">
                        <Sparkles className="w-4 h-4" />
                        Automatic Reply (Popup)
                      </p>
                      <p className="text-sm leading-relaxed">{autoReplyPopup}</p>
                    </div>
                  </div>
                )}

                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No messages in this conversation yet</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[72%] rounded-2xl px-5 py-3.5 border-2 ${
                          msg.role === "user"
                            ? "bg-white border-gray-300 shadow-sm"
                            : "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 border-transparent shadow-lg"
                        }`}
                      >
                        <p className={`text-xs mb-2 inline-flex items-center gap-2 font-bold ${
                          msg.role === "user" ? "text-gray-600" : "text-white/95"
                        }`}>
                          {msg.role === "user" ? <UserRound className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          {msg.role === "user" && `@${selectedConversation.username}`}
                          {msg.role === "ai" && (
                            <>
                              AI Assistant
                              <Sparkles className="w-4 h-4" />
                            </>
                          )}
                          {msg.role === "manual" && "You"}
                        </p>
                        <p className={`text-sm leading-relaxed ${
                          msg.role === "user" ? "text-gray-900 font-normal" : "text-white font-normal"
                        }`}>
                          {msg.text || "(No message)"}
                        </p>
                        <p className={`text-xs mt-2.5 font-medium ${
                          msg.role === "user" ? "text-gray-500" : "text-white/80"
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {typingAiConversationId === selectedConversation.id && (
                  <div className="flex justify-end animate-fadeIn">
                    <div className="rounded-2xl px-5 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white shadow-lg border-2 border-transparent">
                      <p className="text-xs mb-2 inline-flex items-center gap-2 font-bold">
                        <Bot className="w-4 h-4 animate-pulse" />
                        AI is typing
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-5 border-t-2 border-gray-200 bg-gray-50 space-y-4 flex-shrink-0">
                {autoDmEnabled && !isHumanAgentMode && (
                  <div className="flex justify-center animate-fadeIn">
                    <div className="px-4 py-2 rounded-full bg-violet-100 border border-violet-300 text-violet-800 text-xs font-semibold">
                      {deliveryStatus || "Automatic AI reply mode on"}
                    </div>
                  </div>
                )}

                {isHumanAgentMode && (
                  <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-300">
                    <p className="text-xs font-bold text-amber-800">Human Agent Active</p>
                    <p className="text-xs text-amber-700 mt-1">AI auto replies are paused for this handoff.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    value={dashboardReply}
                    onChange={(event) => setDashboardReply(event.target.value)}
                    className="flex-1 input text-sm bg-white border-2 border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 px-4 py-3"
                    placeholder="Type your reply here..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && dashboardReply.trim()) {
                        sendManualReply();
                      }
                    }}
                  />
                  <button
                    onClick={sendManualReply}
                    disabled={!dashboardReply.trim()}
                    className="px-6 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-rose-400" />
                </div>
                <p className="font-bold text-gray-900 text-lg">No conversation selected</p>
                <p className="text-sm text-gray-500 mt-2">Choose a conversation from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>

          {/* ========== RIGHT: INSTAGRAM DM PREVIEW ========== */}
          <div className="xl:col-span-3 bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[700px]">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-900 to-black border-b-2 border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg ring-2 ring-slate-700">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Instagram DM</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Live conversation preview</p>
                </div>
              </div>
            </div>

          {selectedConversation ? (
            <>
              <div className="px-4 py-3.5 border-b-2 border-slate-700/80 bg-slate-800/70 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white text-base font-bold flex items-center justify-center shadow-xl ring-2 ring-slate-600">
                    {selectedConversation.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">@{selectedConversation.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <p className="text-xs text-slate-300 font-medium">Active now</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-900 via-slate-950 to-black">
                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No messages yet</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((msg) => (
                    <div
                      key={`ig-${msg.id}`}
                      className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs shadow-lg ${
                          msg.role === "user"
                            ? "bg-slate-700 border-2 border-slate-600"
                            : "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 border-2 border-transparent"
                        }`}
                      >
                        <p className={`font-bold mb-2 text-xs ${
                          msg.role === "user" ? "text-slate-200" : "text-white"
                        }`}>
                          {msg.role === "user"
                            ? `@${selectedConversation.username}`
                            : "@luminex_ai"}
                        </p>
                        <p className={`leading-relaxed text-sm ${
                          msg.role === "user" ? "text-slate-100 font-normal" : "text-white font-normal"
                        }`}>
                          {msg.text || "(No message)"}
                        </p>
                        <p className={`text-[10px] mt-2 font-medium ${
                          msg.role === "user" ? "text-slate-400" : "text-white/75"
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {typingAiConversationId === selectedConversation.id && (
                  <div className="flex justify-end animate-fadeIn">
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 shadow-xl border-2 border-transparent">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t-2 border-slate-700 bg-slate-900/90 flex-shrink-0">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-bold">Synced</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-medium">Instagram Direct</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 ring-2 ring-slate-700">
                  <MessageCircle className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-sm text-slate-300 font-bold">Select a conversation</p>
                <p className="text-xs text-slate-500 mt-2">Instagram preview will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
