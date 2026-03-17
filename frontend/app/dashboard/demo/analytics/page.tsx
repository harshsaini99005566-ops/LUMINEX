"use client";

const cards = [
  { label: "Demo Reach", value: "124.5K" },
  { label: "Demo Comments", value: "3,480" },
  { label: "Demo DM Replies", value: "2,190" },
  { label: "Demo Conversion", value: "7.8%" },
];

export default function DemoAnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Analytics Snapshot</h1>
      <p className="text-sm text-brand-text-secondary mb-6">Static sample metrics for demo walkthrough.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="card-elevated border-none p-5">
            <p className="text-sm text-brand-text-secondary">{card.label}</p>
            <p className="text-2xl font-bold text-brand-text mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated border-none p-5">
        <p className="font-semibold text-brand-text mb-2">Trend Chart (Placeholder)</p>
        <div className="h-56 rounded-lg bg-brand-light flex items-center justify-center text-brand-text-secondary text-sm">
          Chart area reserved for demo visualization
        </div>
      </div>
    </div>
  );
}
