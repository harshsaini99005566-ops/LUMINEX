"use client";

import { useState } from "react";

const initialComments = [
  { id: "c1", username: "rahul.design", comment: "Price please?", status: "Open", priority: "High" },
  { id: "c2", username: "anna.marketing", comment: "Can you share details?", status: "Replied", priority: "Normal" },
  { id: "c3", username: "sara.shop", comment: "Available in black?", status: "Open", priority: "Normal" },
];

export default function DemoCommentManagePage() {
  const [comments] = useState(initialComments);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Comment Manage</h1>
      <p className="text-sm text-brand-text-secondary mb-6">Demo-only view. Actions are not persisted.</p>

      <div className="card-elevated border-none p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input placeholder="Search comments" className="input-field" />
          <select className="input-field"><option>All Status</option><option>Open</option><option>Replied</option></select>
          <select className="input-field"><option>All Priority</option><option>High</option><option>Normal</option></select>
          <button className="btn-secondary">Apply Filters</button>
        </div>
      </div>

      <div className="space-y-3">
        {comments.map((item) => (
          <div key={item.id} className="card-elevated border-none p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">@{item.username}</p>
              <p className="text-sm text-brand-text-secondary mt-1">{item.comment}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-brand-light text-brand-text">{item.status}</span>
              <span className="px-2 py-1 text-xs rounded-full bg-brand-primary-50 text-brand-primary">{item.priority}</span>
              <button className="btn-secondary text-sm">Quick Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
