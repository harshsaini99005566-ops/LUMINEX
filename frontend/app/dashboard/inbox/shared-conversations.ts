export type Role = "customer" | "ai" | "agent";

export type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  time: string;
};

export type ConversationThread = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  unread: number;
  isOnline: boolean;
  messages: ChatMessage[];
};

export const initialConversations: ConversationThread[] = [
  {
    id: "conv-luminex",
    username: "luminex_labs",
    displayName: "luminex_labs",
    avatarUrl: "/luminex-labs-profile.png",
    isOnline: true,
    unread: 1,
    messages: [
      {
        id: "m-luminex-1",
        role: "customer",
        text: "Hey, can you help me set up automated replies for our Instagram messages?",
        time: "4:12 PM",
      },
    ],
  },
  {
    id: "conv-1",
    username: "sarah_marketing",
    displayName: "sarah_marketing",
    avatarUrl: "https://i.pravatar.cc/128?img=47",
    isOnline: true,
    unread: 0,
    messages: [
      {
        id: "m-1",
        role: "customer",
        text: "Hey! Just checking out your platform",
        time: "3:15 PM",
      },
      {
        id: "m-2",
        role: "customer",
        text: "Looks really cool 😊",
        time: "3:15 PM",
      },
      {
        id: "m-3",
        role: "ai",
        text: "Hey Sarah! Thanks for your interest! 🙌",
        time: "3:16 PM",
      },
      {
        id: "m-4",
        role: "ai",
        text: "We have some amazing features that could really help your business. How many team members do you have?",
        time: "3:16 PM",
      },
      {
        id: "m-5",
        role: "customer",
        text: "About 5 people right now. We're a small startup focused on social media management",
        time: "3:18 PM",
      },
      {
        id: "m-6",
        role: "ai",
        text: "Perfect! Our Starter Plan at $49/month is ideal for teams your size. It includes unlimited posts, bulk scheduling, and team collaboration.",
        time: "3:19 PM",
      },
      {
        id: "m-7",
        role: "customer",
        text: "Can I get a demo?",
        time: "3:20 PM",
      },
      {
        id: "m-8",
        role: "ai",
        text: "Absolutely! Let me schedule a call with you. How does tomorrow at 2 PM work?",
        time: "3:21 PM",
      },
    ],
  },
  {
    id: "conv-2",
    username: "alex_startup",
    displayName: "alex_startup",
    avatarUrl: "https://i.pravatar.cc/128?img=12",
    isOnline: true,
    unread: 2,
    messages: [
      {
        id: "m-9",
        role: "customer",
        text: "Does your platform support API integration?",
        time: "10:35 AM",
      },
      {
        id: "m-10",
        role: "ai",
        text: "Yes! We have a comprehensive REST API with webhook support. What integration are you looking for?",
        time: "10:36 AM",
      },
      {
        id: "m-11",
        role: "customer",
        text: "Shopify connection mainly",
        time: "10:40 AM",
      },
      {
        id: "m-12",
        role: "ai",
        text: "Great! Shopify integration is one of our most popular features. You can automatically sync products and customer data.",
        time: "10:41 AM",
      },
    ],
  },
  {
    id: "conv-3",
    username: "nina_store",
    displayName: "nina_store",
    avatarUrl: "https://i.pravatar.cc/128?img=32",
    isOnline: false,
    unread: 1,
    messages: [
      {
        id: "m-13",
        role: "customer",
        text: "What's your onboarding process like?",
        time: "10:29 AM",
      },
      {
        id: "m-14",
        role: "ai",
        text: "We handle everything! Setup typically takes less than 24 hours. You'll get a dedicated onboarding specialist.",
        time: "10:30 AM",
      },
    ],
  },
];