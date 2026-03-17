"use client";

export default function DemoFeatureSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Feature Settings</h1>
      <p className="text-sm text-brand-text-secondary mb-6">Demo settings panel. No configuration is persisted.</p>

      <div className="card-elevated border-none p-5 space-y-4">
        <div>
          <label className="text-sm text-brand-text-secondary">Environment Label</label>
          <input className="input-field mt-1" defaultValue="Demo" />
        </div>
        <div>
          <label className="text-sm text-brand-text-secondary">Visible Modules</label>
          <select className="input-field mt-1">
            <option>All Modules</option>
            <option>Only Chat + Comments</option>
            <option>Only Posting</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary">Save Demo Settings</button>
          <button className="btn-secondary">Reset</button>
        </div>
      </div>
    </div>
  );
}
