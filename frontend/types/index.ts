// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  limits: PlanLimits;
  usage: UserUsage;
  createdAt: string;
  lastLogin?: string;
}

export interface PlanLimits {
  instagramAccounts: number;
  automationRules: number;
  aiReplies: number;
  monthlyMessages: number;
}

export interface UserUsage {
  accountsUsed: number;
  rulesUsed: number;
  aiRepliesUsed: number;
  messagesThisMonth: number;
  lastResetDate: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// INSTAGRAM ACCOUNT TYPES
// ============================================

export interface InstagramAccount {
  id: string;
  instagramId: string;
  username: string;
  name?: string;
  profilePicture?: string;
  biography?: string;
  followersCount: number;
  accessToken: string;
  isActive: boolean;
  connectedAt: string;
  lastSyncedAt?: string;
  syncStatus: 'syncing' | 'synced' | 'failed';
}

// ============================================
// AUTOMATION RULE TYPES
// ============================================

export interface AutomationRule {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  triggerType: 'keyword' | 'direct_message' | 'comment' | 'mention';
  keywords: string[];
  hashtags: string[];
  mentions: boolean;
  matchType: 'exact' | 'contains' | 'starts_with';
  caseSensitive: boolean;
  replyType: 'predefined' | 'ai' | 'handoff';
  predefinedReply?: string;
  useAI: boolean;
  aiPrompt?: string;
  aiTemperature: number;
  handoffEmail?: string;
  delaySeconds: number;
  doNotReplyToReplies: boolean;
  maxRepliesPerUser: number;
  triggerCount: number;
  successCount: number;
  failureCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleInput {
  name: string;
  keywords: string[];
  hashtags: string[];
  replyType: 'predefined' | 'ai' | 'handoff';
  predefinedReply?: string;
  aiPrompt?: string;
  priority?: number;
}

// ============================================
// MESSAGE & CONVERSATION TYPES
// ============================================

export interface Message {
  id: string;
  conversationId: string;
  instagramMessageId: string;
  senderUsername: string;
  senderProfilePic?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'carousel' | 'unknown';
  direction: 'incoming' | 'outgoing';
  hasReply: boolean;
  replyType?: 'predefined' | 'ai' | 'handoff';
  replyContent?: string;
  automatedBy?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  createdAt: string;
  sentAt?: string;
}

export interface Conversation {
  id: string;
  conversationId: string;
  accountId: string;
  participantId: string;
  participantUsername: string;
  participantProfilePic?: string;
  participantBio?: string;
  isActive: boolean;
  isSpam: boolean;
  isPriority: boolean;
  messageCount: number;
  automatedReplies: number;
  manualReplies: number;
  lastMessageAt: string;
  lastReplyAt?: string;
  unreadCount: number;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SUBSCRIPTION & BILLING TYPES
// ============================================

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  status: 'active' | 'paused' | 'canceled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  isOnTrial: boolean;
  trialEndsAt?: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
  createdAt: string;
}

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface LoginFormInput {
  email: string;
  password: string;
}

export interface RegisterFormInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms: boolean;
}

export interface RuleFormInput {
  name: string;
  description?: string;
  keywords: string[];
  hashtags: string[];
  mentions: boolean;
  matchType: 'exact' | 'contains' | 'starts_with';
  replyType: 'predefined' | 'ai' | 'handoff';
  predefinedReply?: string;
  aiPrompt?: string;
  handoffEmail?: string;
  priority: number;
  delaySeconds: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AccountStats {
  accountId: string;
  totalMessages: number;
  automatedReplies: number;
  manualReplies: number;
  averageResponseTime: number;
  successRate: number;
  topRules: Array<{
    ruleId: string;
    ruleName: string;
    triggerCount: number;
  }>;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  messagesTrend: Array<{
    date: string;
    count: number;
  }>;
}

// ============================================
// POST PUBLISHING TYPES
// ============================================

export interface ScheduledPost {
  _id: string;
  userId: string;
  instagramAccountId: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'carousel';
  mediaUrls?: string[];
  caption: string;
  hashtags: string[];
  location?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  instagramPostId?: string;
  permalink?: string;
  publishedAt?: string;
  errorMessage?: string;
  attempts: number;
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  instagramAccountId: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'carousel';
  mediaUrls?: string[];
  caption: string;
  hashtags?: string[];
  location?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
  scheduledFor?: string;
  publishNow?: boolean;
}

export interface UpdatePostInput {
  caption?: string;
  hashtags?: string[];
  location?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
  scheduledFor?: string;
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
}

export interface HashtagSuggestion {
  tag: string;
  popularity: 'high' | 'medium' | 'low';
  category: string;
}

export interface LocationResult {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface PostFilters {
  status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  instagramAccountId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface UIState {
  isLoading: boolean;
  error?: string;
  success?: string;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}
