"use client";

import { useState } from "react";

export default function DemoPostingPage() {
  const [caption, setCaption] = useState("Launching new campaign this week. Stay tuned.");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Posting</h1>
      <p className="text-sm text-brand-text-secondary mb-6">Demo composer with mock scheduling controls only.</p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 card-elevated border-none p-5 space-y-4">
          <label className="block text-sm text-brand-text-secondary">Caption</label>
          <textarea
            className="input-field min-h-[140px]"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="date" className="input-field" />
            <input type="time" className="input-field" />
            <select className="input-field"><option>Instagram</option><option>Facebook</option><option>LinkedIn</option></select>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary">Schedule Post (Demo)</button>
            <button className="btn-secondary">Save Draft</button>
          </div>
        </div>

        <div className="card-elevated border-none p-5">
          <p className="font-semibold text-brand-text mb-2">Preview</p>
          <div className="bg-brand-light rounded-lg p-4 min-h-[240px]">
            <p className="text-sm text-brand-text-secondary">Mock media area</p>
            <p className="text-sm text-brand-text mt-4">{caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
