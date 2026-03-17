"use client";

import { useState } from "react";

export default function DemoAutomationPage() {
  const [autoComment, setAutoComment] = useState(true);
  const [autoDm, setAutoDm] = useState(true);
  const [keywordRouting, setKeywordRouting] = useState(false);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Automation</h1>
      <p className="text-sm text-brand-text-secondary mb-6">Demo control panel. Toggle states are local UI only.</p>

      <div className="space-y-4">
        {[{ label: "Auto Comment Reply", state: autoComment, set: setAutoComment }, { label: "Auto DM Reply", state: autoDm, set: setAutoDm }, { label: "Keyword Routing", state: keywordRouting, set: setKeywordRouting }].map((item) => (
          <div key={item.label} className="card-elevated border-none p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand-text">{item.label}</p>
              <p className="text-sm text-brand-text-secondary">Demo option for presentation mode.</p>
            </div>
            <button
              onClick={() => item.set(!item.state)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${item.state ? "bg-brand-primary text-white" : "bg-brand-light text-brand-text"}`}
            >
              {item.state ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
