"use client";

import { useMemo, useState } from "react";
import { Instagram, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Role = "customer" | "ai" | "agent";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  time: string;
};

type DemoConversation = {
  id: string;
  username: string;
  avatarUrl?: string;
  unread: number;
  messages: ChatMessage[];
};

const initialConversations: DemoConversation[] = [
  {
    id: "conv-1",
    username: "sarah_marketing",
    avatarUrl: "https://i.pravatar.cc/128?img=47",
    unread: 0,
    messages: [
      {
        id: "m-1",
        role: "customer",
        text: "Hi, do you have monthly plans for a small team?",
        time: "10:41 AM",
      },
      {
        id: "m-2",
        role: "ai",
        text: "Yes, we do. Plans start at $49/month and scale with your usage.",
        time: "10:41 AM",
      },
    ],
  },
  {
    id: "conv-2",
    username: "alex_startup",
    avatarUrl: "https://i.pravatar.cc/128?img=12",
    unread: 2,
    messages: [
      {
        id: "m-3",
        role: "customer",
        text: "Can this connect with Shopify?",
        time: "10:35 AM",
      },
      {
        id: "m-4",
        role: "ai",
        text: "Yes, Shopify integration is available with webhook sync.",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: "conv-3",
    username: "nina_store",
    avatarUrl: "https://i.pravatar.cc/128?img=32",
    unread: 1,
    messages: [
      {
        id: "m-5",
        role: "customer",
        text: "How fast can I get started?",
        time: "10:29 AM",
      },
    ],
  },
];

export default function InstagramMessagePreviewPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState("conv-1");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="h-[calc(100vh-4rem)] p-6 bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/inbox"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition font-semibold text-sm mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Inbox
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instagram Preview</h1>
            <p className="text-gray-600 text-sm mt-1">See exactly how your conversations appear on Instagram Direct Messages</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          {/* Conversation List - Hidden on mobile */}
          <aside className="hidden lg:flex lg:flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Instagram Header */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-xl font-bold text-gray-900">Messages</p>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Messages"
                  className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2 pl-10 text-sm outline-none focus:bg-white transition"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition flex items-center gap-3 ${
                    selectedConversationId === conv.id ? "bg-gray-100" : ""
                  }`}
                >
                  {/* Avatar */}
                  {conv.avatarUrl ? (
                    <img
                      src={conv.avatarUrl}
                      alt={conv.username}
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {conv.username[0].toUpperCase()}
                    </div>
                  )}
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{conv.username}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {conv.messages[conv.messages.length - 1]?.text || "No messages yet"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Instagram Phone Preview */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-full max-w-sm">
              {/* Phone Mockup */}
              <div className="relative rounded-3xl border-8 border-gray-900 bg-gray-900 shadow-2xl overflow-hidden"
                style={{
                  aspectRatio: "9/19.5",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                }}>
                
                {/* Status Bar + Notch */}
                <div className="absolute inset-0 top-0 h-6 bg-black z-50 flex items-center justify-between px-4">
                  <span className="text-[10px] text-white font-bold">9:41</span>
                  <div className="absolute left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl"></div>
                  <span className="text-[10px] text-white">📶</span>
                </div>

                {/* Screen Content */}
                <div className="absolute inset-0 pt-6 bg-white flex flex-col">
                  {/* DM Header - Real Instagram Style */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      {selectedConversation?.avatarUrl ? (
                        <img
                          src={selectedConversation.avatarUrl}
                          alt={selectedConversation.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {selectedConversation?.username[0].toUpperCase()}
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{selectedConversation?.username}</p>
                        <p className="text-xs text-gray-500">Active 4m ago</p>
                      </div>
                      {/* Header Icons */}
                      <div className="flex gap-3 text-gray-600">
                        <button className="p-1.5 hover:bg-gray-100 rounded-full transition">📞</button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-full transition">🎥</button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-full transition">ℹ️</button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-white">
                    {/* Date Separator */}
                    <div className="flex justify-center">
                      <span className="text-[11px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Today</span>
                    </div>

                    {/* Messages */}
                    {selectedConversation?.messages.map((msg, idx) => (
                      <div
                        key={`ig-${msg.id}`}
                        className={`flex ${msg.role === "customer" ? "justify-start" : "justify-end"} gap-2`}
                      >
                        <div
                          className={`max-w-xs ${
                            msg.role === "customer"
                              ? "bg-gray-200 text-gray-900"
                              : "bg-blue-500 text-white"
                          } rounded-2xl px-3 py-2 text-sm leading-5 break-words shadow-sm`}
                          style={{
                            borderRadius: msg.role === "customer" 
                              ? "18px 18px 18px 4px" 
                              : "18px 18px 4px 18px"
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area - Real Instagram Style */}
                  <div className="px-3 py-3 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-2">
                      {/* Text Input */}
                      <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                        <input
                          type="text"
                          placeholder="Aa"
                          disabled
                          className="bg-transparent flex-1 text-sm outline-none placeholder-gray-500"
                        />
                      </div>
                      {/* Action Buttons */}
                      <button className="text-blue-500 text-lg p-1.5 hover:bg-gray-100 rounded-full transition">
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-3">
                  <div className="text-2xl">📱</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Real Instagram Experience</p>
                    <p className="text-xs text-gray-600 mt-1.5">
                      This preview shows exactly how your conversations will look when customers view them on Instagram DMs. The styling, message bubbles, and header match Instagram's authentic design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
