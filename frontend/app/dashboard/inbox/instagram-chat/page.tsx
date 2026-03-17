"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Phone, Video, Plus, Smile, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { initialConversations } from "../shared-conversations";

export default function InstagramChatPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState("conv-luminex");
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [showPublishPopup, setShowPublishPopup] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) || conversations[0],
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(
    () =>
      conversations.filter((item) =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery],
  );

  const handleSendMessage = () => {
    if (!draft.trim() || !selectedConversation) return;

    setConversations((items) =>
      items.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: `msg-${Date.now()}`,
                  role: "agent",
                  text: draft.trim(),
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : conv,
      ),
    );
    setDraft("");
    setShowPublishPopup(true);
  };

  useEffect(() => {
    if (!showPublishPopup) return;
    const timer = window.setTimeout(() => setShowPublishPopup(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showPublishPopup]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
      {/* Back Button Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <Link
          href="/dashboard/inbox"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition font-semibold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
      </div>

      {/* Main Instagram Chat Interface */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Sidebar - Conversations List */}
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col shadow-sm">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">chats</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition" title="New message">
                <Plus className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Direct"
                className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-gray-200 transition"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full px-3 py-2 hover:bg-gray-50 transition border-b border-gray-100 text-left ${
                    selectedConversationId === conv.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 p-2">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conv.avatarUrl ? (
                        <img
                          src={conv.avatarUrl}
                          alt={`@${conv.username}`}
                          className="w-14 h-14 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {conv.username[0].toUpperCase()}
                        </div>
                      )}
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <p className="font-500 text-gray-900 text-sm">{conv.username}</p>
                        <p className="text-xs text-gray-500 ml-2">3:45 PM</p>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                        {conv.messages[conv.messages.length - 1]?.text}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedConversation.avatarUrl ? (
                    <img
                      src={selectedConversation.avatarUrl}
                      alt={`@${selectedConversation.username}`}
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {selectedConversation.username[0].toUpperCase()}
                    </div>
                  )}
                  {selectedConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-600 text-gray-900 text-sm">{selectedConversation.username}</p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.isOnline ? "Active now" : "Active 2h ago"}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-gray-100 rounded-full transition text-gray-700" title="Call">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-gray-100 rounded-full transition text-gray-700" title="Video call">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-gray-100 rounded-full transition text-lg" title="Info">
                  ℹ️
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white">
              {/* Date Separator */}
              <div className="flex justify-center mb-4">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Today</span>
              </div>

              {selectedConversation.messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "customer" ? "justify-start" : "justify-end"}`}
                >
                  {msg.role === "customer" && (
                    <div className="relative flex-shrink-0 pt-1">
                      {selectedConversation.avatarUrl ? (
                        <img
                          src={selectedConversation.avatarUrl}
                          alt={`@${selectedConversation.username}`}
                          className="w-8 h-8 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {selectedConversation.username[0].toUpperCase()}
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
                    <p className={`text-xs mt-1 ${msg.role === "customer" ? "text-gray-500" : "text-gray-500"}`}>
                      {msg.time}
                    </p>
                  </div>

                  {msg.role !== "customer" && (
                    <div className="flex-shrink-0 flex items-end pt-1">
                      {idx === selectedConversation.messages.length - 1 && (
                        <span className="text-xs text-gray-400">✓✓</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white">
              <div className="flex items-end gap-3">
                <button className="p-2.5 hover:bg-gray-100 rounded-full transition text-blue-500 flex-shrink-0" title="Add attachment">
                  <Plus className="w-6 h-6" />
                </button>

                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3 focus-within:bg-gray-200 transition">
                  <button className="text-gray-600 transition" title="Emoji">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Aa"
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500 text-gray-900"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 hover:bg-gray-100 rounded-full transition text-blue-500 disabled:text-gray-300 disabled:hover:bg-transparent flex-shrink-0"
                  title="Publish"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-semibold">Publish</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Messages are end-to-end encrypted</p>
            </div>
          </div>
        )}
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
