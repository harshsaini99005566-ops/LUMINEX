import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  User,
  InstagramAccount,
  AutomationRule,
  Conversation,
  Message,
} from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

interface InstagramStore {
  accounts: InstagramAccount[];
  selectedAccountId: string | null;
  isLoading: boolean;
  setAccounts: (accounts: InstagramAccount[]) => void;
  addAccount: (account: InstagramAccount) => void;
  removeAccount: (accountId: string) => void;
  selectAccount: (accountId: string) => void;
  updateAccount: (accountId: string, data: Partial<InstagramAccount>) => void;
}

interface RuleStore {
  rules: AutomationRule[];
  selectedRuleId: string | null;
  isLoading: boolean;
  setRules: (rules: AutomationRule[]) => void;
  addRule: (rule: AutomationRule) => void;
  updateRule: (ruleId: string, data: Partial<AutomationRule>) => void;
  deleteRule: (ruleId: string) => void;
  selectRule: (ruleId: string | null) => void;
}

interface ConversationStore {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  selectConversation: (conversationId: string | null) => void;
  updateConversation: (conversationId: string, data: Partial<Conversation>) => void;
}

interface UIStore {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

// Auth Store
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        login: (user, token) =>
          set({
            user,
            token,
            isAuthenticated: true,
          }),
        logout: () => {
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },
        updateUser: (userData) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          })),
        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: 'auth-store',
      }
    )
  )
);

// Instagram Store
export const useInstagramStore = create<InstagramStore>()(
  devtools((set) => ({
    accounts: [],
    selectedAccountId: null,
    isLoading: false,
    setAccounts: (accounts) => set({ accounts }),
    addAccount: (account) =>
      set((state) => ({
        accounts: [...state.accounts, account],
      })),
    removeAccount: (accountId) =>
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== accountId),
      })),
    selectAccount: (accountId) => set({ selectedAccountId: accountId }),
    updateAccount: (accountId, data) =>
      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === accountId ? { ...a, ...data } : a
        ),
      })),
  }))
);

// Rules Store
export const useRuleStore = create<RuleStore>()(
  devtools((set) => ({
    rules: [],
    selectedRuleId: null,
    isLoading: false,
    setRules: (rules) => set({ rules }),
    addRule: (rule) =>
      set((state) => ({
        rules: [...state.rules, rule],
      })),
    updateRule: (ruleId, data) =>
      set((state) => ({
        rules: state.rules.map((r) =>
          r.id === ruleId ? { ...r, ...data } : r
        ),
      })),
    deleteRule: (ruleId) =>
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== ruleId),
      })),
    selectRule: (ruleId) => set({ selectedRuleId: ruleId }),
  }))
);

// Conversation Store
export const useConversationStore = create<ConversationStore>()(
  devtools((set) => ({
    conversations: [],
    selectedConversationId: null,
    messages: {},
    isLoading: false,
    setConversations: (conversations) => set({ conversations }),
    addConversation: (conversation) =>
      set((state) => ({
        conversations: [...state.conversations, conversation],
      })),
    setMessages: (conversationId, messages) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      })),
    addMessage: (conversationId, message) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            message,
          ],
        },
      })),
    selectConversation: (conversationId) =>
      set({ selectedConversationId: conversationId }),
    updateConversation: (conversationId, data) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, ...data } : c
        ),
      })),
  }))
);

// UI Store
export const useUIStore = create<UIStore>()((set) => ({
  darkMode: true,
  sidebarOpen: true,
  toggleDarkMode: () =>
    set((state) => ({
      darkMode: !state.darkMode,
    })),
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
}));
