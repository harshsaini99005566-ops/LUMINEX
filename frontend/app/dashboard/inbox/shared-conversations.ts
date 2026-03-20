// Demo conversation data for Instagram chat
// Prevents import error in instagram-chat/page.tsx

export interface Conversation {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null; // Fixed: allows null
  isOnline: boolean;
  messages: Array<{
    id: string;
    role: "customer" | "agent";
    text: string;
    time: string;
  }>;
}

export const initialConversations: Conversation[] = [
  {
    id: "conv-luminex",
    username: "@luminex_labs",
    displayName: "Luminex Labs",
    avatarUrl: "/luminex-logo.png",
    isOnline: true,
    messages: [
      {
        id: "msg1",
        role: "customer",
        text: "Hey! Interested in your automation tool.",
        time: "3:45 PM",
      },
      {
        id: "msg2",
        role: "agent",
        text: "Thanks for reaching out! What would you like to automate?",
        time: "3:46 PM",
      },
    ],
  },
  {
    id: "conv-vexora",
    username: "@vexora_labs",
    displayName: "Vexora Labs",
    avatarUrl: null, // Fixed: null allowed
    isOnline: false,
    messages: [
      {
        id: "msg3",
        role: "customer",
        text: "Demo request for Instagram DM automation.",
        time: "2:30 PM",
      },
    ],
  },
];
