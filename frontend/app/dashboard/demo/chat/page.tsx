"use client";

import { useMemo, useState } from "react";

const conversations = [
  { id: "1", user: "sarah_marketing", preview: "Can I upgrade any time?", unread: 0 },
  { id: "2", user: "alex_startup", preview: "Do you support Shopify?", unread: 2 },
  { id: "3", user: "nina_store", preview: "Can you send sample reports?", unread: 1 },
];

export default function DemoManageChatPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("1");
  const [replyText, setReplyText] = useState("Thanks for your message. This is a demo response template.");

  const filtered = useMemo(
    () => conversations.filter((item) => item.user.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Manage Chat</h1>
      <p className="text-sm text-brand-text-secondary mb-6">Demo-only inbox. Messages are static and not synced.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-elevated border-none p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversation"
            className="input-field mb-3"
          />
          <div className="space-y-2">
            {filtered.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedId === chat.id ? "bg-brand-primary-50 border-brand-primary-100" : "bg-white border-brand-border"
                }`}
              >
                <p className="font-medium text-brand-text">@{chat.user}</p>
                <p className="text-xs text-brand-text-secondary mt-1">{chat.preview}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card-elevated border-none p-5">
          <div className="mb-4">
            <p className="text-sm text-brand-text-secondary">Conversation Window</p>
            <p className="font-semibold text-brand-text">Selected Chat ID: {selectedId}</p>
          </div>
          <div className="bg-brand-light rounded-lg p-4 min-h-[240px] mb-4">
            <p className="text-sm text-brand-text-secondary">Chat transcript placeholder for demo presentation.</p>
          </div>
          <textarea
            className="input-field min-h-[90px]"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="mt-3 flex gap-3">
            <button className="btn-primary">Send Reply (Demo)</button>
            <button className="btn-secondary">Assign to Agent</button>
          </div>
        </div>
      </div>
    </div>
  );
}
