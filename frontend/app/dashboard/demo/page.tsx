"use client";

import Link from "next/link";
import {
  MessageSquare,
  MessagesSquare,
  Send,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";

const demoModules = [
  {
    title: "Comment Manage",
    description: "Review comments, apply quick filters, and use canned response templates.",
    href: "/dashboard/demo/comments",
    icon: MessageSquare,
  },
  {
    title: "Manage Chat",
    description: "View conversations, search chats, and simulate agent handoff workflow.",
    href: "/dashboard/demo/chat",
    icon: MessagesSquare,
  },
  {
    title: "Posting",
    description: "Draft posts, select channels, and preview publishing queue.",
    href: "/dashboard/demo/posting",
    icon: Send,
  },
  {
    title: "Automation",
    description: "Toggle auto-replies, keyword routing, and moderation policies.",
    href: "/dashboard/demo/automation",
    icon: Bot,
  },
  {
    title: "Analytics Snapshot",
    description: "See engagement summaries and sample trend panels.",
    href: "/dashboard/demo/analytics",
    icon: BarChart3,
  },
  {
    title: "Feature Settings",
    description: "Control demo visibility, team access, and environment labels.",
    href: "/dashboard/demo/settings",
    icon: Settings,
  },
];

export default function DemoFeaturesHomePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-brand-text">Demo Features</h1>
        <p className="text-brand-text-secondary mt-2">
          Lightweight demo modules restored. These screens are UI placeholders only and do not call backend APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {demoModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <div className="card-elevated border-none hover:shadow-lg transition-all h-full p-6 cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-brand-primary-50 text-brand-primary flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-brand-text">{module.title}</h2>
                <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed">{module.description}</p>
                <p className="text-xs text-brand-primary font-semibold mt-4">Open Module</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
