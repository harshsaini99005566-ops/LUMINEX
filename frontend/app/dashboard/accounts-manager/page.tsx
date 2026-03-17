"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle,
  MessageSquare,
  Image as ImageIcon,
  Send,
  Settings,
  RefreshCcw,
  Heart,
  BarChart3,
  ShieldCheck,
  Bot,
  Calendar,
  Zap,
  Instagram,
  Upload,
  X,
  Check,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react";

type TabKey = "comments" | "posts" | "dms" | "analytics";

type CommentItem = {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  postId: string;
  time: string;
  status: "Open" | "Replied";
  // Optional fields for UI convenience
  title?: string;
  image?: string;
  reach?: string;
};

type DmItem = {
  id: string;
  user: string;
  preview: string;
  unread: boolean;
};

type PostItem = {
  id: string;
  title: string;
  likes: number;
  comments: number;
  reach: string;
  image?: string;
};

export default function AccountsManagerPage() {
  // --- All state at the top ---
  // State
  const [activeTab, setActiveTab] = useState<TabKey>("comments");
  const defaultCommentReply = "Thanks for your comment! Please check your DM for details.";
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "c1",
      user: "harsh_956",
      avatar: "/profiles/harsh_956.png",
      text: "Love this launch post. Excited to see more.",
      postId: "p1",
      time: "2m ago",
      status: "Open",
    },
    {
      id: "c2",
      user: "nita_rathore_527",
      avatar: "C:/Users/DELL/OneDrive/Desktop 111/nita_rathore_527.jpg",
      text: "Clean start. Looking forward to your next update!",
      postId: "p1",
      time: "14m ago",
      status: "Replied",
    },
    {
      id: "c3",
      user: "vexora_labs",
      text: "This setup looks clean. What tools are you using?",
      postId: "p2",
      time: "31m ago",
      status: "Open",
    },
    {
      id: "c4",
      user: "vexora_labs",
      text: "Impressed by the automation features!",
      postId: "p2",
      time: "just now",
      status: "Open",
    },
    {
      id: "c7",
      user: "vexora_labs",
      text: "How do you handle scaling for multiple accounts?",
      postId: "p2",
      time: "moments ago",
      status: "Open",
    },
    {
      id: "c5",
      user: "vexora_labs",
      text: "Congrats on the milestone post!",
      postId: "p3",
      time: "1h ago",
      status: "Open",
    },
    {
      id: "c6",
      user: "vexora_labs",
      text: "Small account but strong start. Keep going!",
      postId: "p3",
      time: "1h ago",
      status: "Replied",
    },
  ]);
  const [dms, setDms] = useState<DmItem[]>([
    {
      id: "d2",
      user: "jenny.store",
      preview: "Thanks for quick response!",
      unread: false,
    },
    {
      id: "d3",
      user: "mike.agency",
      preview: "Need bulk pricing",
      unread: true,
    },
  ]);
  const [postScheduleTime, setPostScheduleTime] = useState<string>("");
  const [postId, setPostId] = useState<string>("p1");
  const [postTitle, setPostTitle] = useState<string>("Sample Post Title");
  const [showPostUploadSection, setShowPostUploadSection] = useState<boolean>(false);
  const [postScheduleDate, setPostScheduleDate] = useState<string>("");
  const [selectedCommentPostId, setSelectedCommentPostId] = useState<string | null>(null);
  const [replyTargetPostId, setReplyTargetPostId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [selectedCommentPost, setSelectedCommentPost] = useState<CommentItem | null>(null);
  const [autoCommentEnabled, setAutoCommentEnabled] = useState<boolean>(false);
  const [dmReply, setDmReply] = useState<string>("Thank you for your DM!");
  const [postCaption, setPostCaption] = useState<string>("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [autoDmEnabled, setAutoDmEnabled] = useState<boolean>(false);
  const [isUploadingPost, setIsUploadingPost] = useState<boolean>(false);
  const [uploadPostProgress, setUploadPostProgress] = useState<number>(0);
  const [uploadedPostImages, setUploadedPostImages] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [autoPostSchedule, setAutoPostSchedule] = useState("hourly");
  const [currentPostStep, setCurrentPostStep] = useState<number>(1);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [newPostCaption, setNewPostCaption] = useState<string>("");
  const [showPublishedPost, setShowPublishedPost] = useState<boolean>(false);

  // --- Derived variables and helpers (after state) ---
    // Additional state for analytics and post visibility
    const [selectedDayRange, setSelectedDayRange] = useState<number>(7);
    const [liveFollowersToday, setLiveFollowersToday] = useState<number>(4);
    const [followersChange, setFollowersChange] = useState<number>(0);
    const [liveCommentsReceived, setLiveCommentsReceived] = useState<number>(0);
    const [commentsChange, setCommentsChange] = useState<number>(0);
    const [liveAvgReplyTime, setLiveAvgReplyTime] = useState<number>(0);
    const [replyTimeChange, setReplyTimeChange] = useState<number>(0);
    const [liveTick, setLiveTick] = useState<number>(0);
    const [chartData, setChartData] = useState<{ points: number[]; step: number }>({ points: [24, 20, 18, 15, 12, 10, 8, 6, 8, 10, 12, 15, 18, 20, 24], step: 7 });
    const [postVisibility, setPostVisibility] = useState<'public' | 'private' | 'friends'>('public');
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState<boolean>(false);
  const account = {
    profilePicture: "/default-profile.png",
    username: "demo_user",
    displayName: "Demo User",
    connectedSince: "2023-01-01",
    followers: 1234,
    posts: 56,
    following: 78,
  };
  const visibleComments = comments;
  const commentPosts = posts.length > 0 ? posts : [
    { id: "p1", title: "Demo Post 1", likes: 0, comments: 0, reach: "0", image: "/posts/333.png" },
    { id: "p2", title: "Demo Post 2", likes: 0, comments: 0, reach: "0", image: "/posts/444.jpg" },
    { id: "p3", title: "Demo Post 3", likes: 0, comments: 0, reach: "0", image: "/posts/555.jpg" },
  ];
  // Helper: get comments for a post
  function getCommentsForPost(postId: string) {
    return comments.filter((c) => c.postId === postId);
  }
  // Helper: open comments for a post
  function openCommentsForPost(postId: string, postTitle: string) {
    setSelectedCommentPostId(postId);
    setSelectedCommentPost(
      comments.find((c) => c.postId === postId) || null
    );
    runAction(`Opened comments for ${postTitle}`);
  }
  // Helper: get reply template for a post
  function getReplyTemplateForPost(postId: string | null) {
    // For demo, return a static template
    return `Thank you for your comment on post ${postId || ''}!`;
  }
  function getCommentCountForPost(postId: string) {
    return comments.filter((c) => c.postId === postId).length;
  }
  function aiReplyAllCommentsForPost(postId: string, postTitle: string) {
    setComments((items) => items.map((item) => item.postId === postId ? { ...item, status: "Replied" } : item));
    runAction(`AI replied to all comments on ${postTitle}`);
  }
  // Ensure selectedCommentPost has the right shape for all usages
  const selectedCommentPostSafe = selectedCommentPost
    ? { ...selectedCommentPost, title: (selectedCommentPost as any).title || "Instagram Post", image: (selectedCommentPost as any).image, reach: (selectedCommentPost as any).reach || "0" }
    : undefined;
  const selectedReplyTargetPost = { title: "Demo Post" };
  function updateReplyTemplateForPost(postId: string | null, value: string) {
    // For demo, this is a stub. In a real app, this would update a template map.
    runAction(`Reply template updated for post ${postId}`);
  }


  const runAction = (message: string) => {
    setActionMessage(`${message} • ${new Date().toLocaleTimeString()}`);
  };

  // Auto-reply to comment
  const autoReplyComment = () => {
    const targetPostId = selectedCommentPost?.id;
    const openComments = comments.filter(
      (c) => c.status === "Open" && (!targetPostId || c.postId === targetPostId),
    );
    if (openComments.length === 0) {
      runAction(
        targetPostId
          ? "No open comments to reply to for the selected auto-reply post"
          : "No open comments to reply to",
      );
      return;
    }

    const comment = openComments[0];
    setComments((items) =>
      items.map((item) =>
        item.id === comment.id ? { ...item, status: "Replied" } : item,
      ),
    );
    runAction(
      `Auto-replied to @${comment.user}: "${getReplyTemplateForPost(comment.postId).slice(0, 30)}..."`,
    );
  };

  // Auto-reply to DM
  const autoReplyDm = () => {
    const unreadDms = dms.filter((d) => d.unread);
    if (unreadDms.length === 0) {
      runAction("No unread DMs to reply to");
      return;
    }

    const dm = unreadDms[0];
    setDms((items) =>
      items.map((item) =>
        item.id === dm.id ? { ...item, unread: false } : item,
      ),
    );
    runAction(`Auto-replied to @${dm.user}: "${dmReply.slice(0, 30)}..."`);
  };

  // Auto-post
  const autoPost = () => {
    const newPost: PostItem = {
      id: `p-${Date.now()}`,
      title: postCaption.slice(0, 40) + (postCaption.length > 40 ? "..." : ""),
      likes: 0,
      comments: 0,
      reach: "0",
    };
    setPosts((items) => [newPost, ...items]);
    runAction(`Auto-posted: "${postCaption.slice(0, 30)}..."`);
  };

  // Simulate incoming comment
  const simulateIncomingComment = () => {
    const texts = [
      "Interested in this!",
      "Can I get more info?",
      "Love your content!",
      "How much does this cost?",
    ];
    const incomingUser = "vexora_labs";
    const randomText = texts[Math.floor(Math.random() * texts.length)];

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      user: incomingUser,
      text: randomText,
      postId: selectedCommentPost?.id || "p1",
      time: "Just now",
      status: "Open",
    };

    setComments((items) => [newComment, ...items]);
    runAction(`New comment from @${incomingUser}`);

    // Auto-reply if enabled
    const shouldAutoReply = autoCommentEnabled;

    if (shouldAutoReply) {
      setTimeout(() => {
        setComments((items) =>
          items.map((item) =>
            item.id === newComment.id ? { ...item, status: "Replied" } : item,
          ),
        );
        runAction(`Auto-replied to @${incomingUser}`);
      }, 1500);
    }
  };

  // Simulate incoming DM
  const simulateIncomingDm = () => {
    const users = [
      "startup.founder",
      "agency.owner",
      "ecom.store",
      "content.creator",
    ];
    const messages = [
      "Hi, I need help!",
      "Can you share pricing?",
      "Interested in your service",
      "How does this work?",
    ];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const newDm: DmItem = {
      id: `d-${Date.now()}`,
      user: randomUser,
      preview: randomMessage,
      unread: true,
    };

    setDms((items) => [newDm, ...items]);
    runAction(`New DM from @${randomUser}`);

    // Auto-reply if enabled
    if (autoDmEnabled) {
      setTimeout(() => {
        setDms((items) =>
          items.map((item) =>
            item.id === newDm.id ? { ...item, unread: false } : item,
          ),
        );
        runAction(`Auto-replied to DM from @${randomUser}`);
      }, 1500);
    }
  };

  // Hashtag suggestions
  const suggestedHashtags = [
    "#luminex",
    "#socialmedia",
    "#marketing",
    "#business",
    "#entrepreneur",
    "#growth",
    "#automation",
    "#ai",
  ];

  // Handle post image upload
  const handlePostImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPost(true);
    setUploadPostProgress(0);

    const interval = setInterval(() => {
      setUploadPostProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setUploadedPostImages([...uploadedPostImages, ...newImages]);
              setIsUploadingPost(false);
              setUploadPostProgress(0);
              runAction(`${files.length} image(s) uploaded`);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }, 1000);
  };

  // Remove post image
  const removePostImage = (index: number) => {
    setUploadedPostImages(uploadedPostImages.filter((_, i) => i !== index));
    runAction("Image removed");
  };

  // Toggle hashtag
  const toggleHashtag = (hashtag: string) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(selectedHashtags.filter((h) => h !== hashtag));
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  // Publish or schedule post
  const publishOrSchedulePost = (action: "publish" | "schedule") => {
    if (uploadedPostImages.length === 0 && !postCaption.trim()) {
      runAction("Please add at least an image or caption");
      return;
    }

    const newPost: PostItem = {
      id: `p-${Date.now()}`,
      title:
        postCaption.slice(0, 50) ||
        `Post with ${uploadedPostImages.length} image(s)`,
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 100),
      reach: `${(Math.random() * 10 + 1).toFixed(1)}K`,
    };

    setPosts([newPost, ...posts]);
    setUploadedPostImages([]);
    setPostCaption("Launching something exciting this week. Stay tuned! 🚀");
    setSelectedHashtags([]);
    setShowPostUploadSection(false);
    setPostScheduleDate("");
    setPostScheduleTime("");

    if (action === "schedule") {
      runAction(
        `Post scheduled for ${postScheduleDate} at ${postScheduleTime}`,
      );
    } else {
      runAction("Post published successfully!");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/accounts"
            className="text-sm text-brand-primary hover:underline"
          >
            ← Back to Accounts
          </Link>
          <h1 className="text-3xl font-heading font-bold text-brand-text mt-2 inline-flex items-center gap-3">
            Account Manager
            <span className="text-sm px-3 py-1 bg-green-600 text-white rounded-full font-normal">
              LIVE
            </span>
          </h1>
          <p className="text-brand-text-secondary">
            ✅ Manage posting, comments, and analytics from one account workspace
          </p>
        </div>
        <button
          className="btn-secondary inline-flex items-center gap-2 relative"
          onClick={() => runAction("Account data synced successfully")}
        >
          <RefreshCcw className="w-4 h-4" />
          Sync Data
        </button>
      </div>

      <div className="card-elevated border-none bg-gradient-to-r from-purple-50 to-brand-primary-50 border-2 border-purple-300">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
            ACTIVE
          </span>
          <p className="text-sm font-medium text-brand-text flex-1">
            {actionMessage}
          </p>
        </div>
      </div>

      <div className="card-elevated border-none">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-brand-text inline-flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-primary" />
              luminex_labs Assistant
            </p>
            <p className="text-sm text-brand-text-secondary mt-1">
              Generate replies, route DMs, and manage comment actions with
              AI-powered workflows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary text-sm px-3 py-2 inline-flex items-center gap-2 relative"
              onClick={() => {
                if (activeTab === "comments") {
                  updateReplyTemplateForPost(
                    replyTargetPostId,
                    "Thank you for your comment! Our team will assist you right away. 🙌",
                  );
                }
                if (activeTab === "dms") {
                  setDmReply(
                    "Thanks for your message! Please share your requirement and we will guide you quickly.",
                  );
                }
                if (activeTab === "posts") {
                  setPostCaption(
                    "Big update coming soon with luminex_labs. Turn on notifications! 🔔",
                  );
                }
                runAction("Smart reply generated for active section");
              }}
            >
              <Zap className="w-4 h-4" />
              Generate Smart Reply
            </button>
            <button
              className="btn-primary text-sm px-3 py-2 relative"
              onClick={() =>
                runAction(`Applied automation to ${activeTab} tab`)
              }
            >
              Apply to Active Tab
            </button>
          </div>
        </div>
      </div>

      <div className="card-elevated border-none">
        <div className="flex items-center gap-4">
          <img
            src={account.profilePicture}
            alt={account.username}
            className="w-16 h-16 rounded-full border border-brand-border"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-primary mb-1 inline-flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5" /> INSTAGRAM ACCOUNT •
              Shortcut: IG
            </p>
            <p className="text-xl font-heading font-bold text-brand-text">
              {account.displayName}
            </p>
            <p className="text-brand-primary">@{account.username}</p>
            <p className="text-sm text-brand-text-secondary mt-1">
              Connected since {account.connectedSince}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/dashboard/accounts-manager/instagram"
                className="btn-secondary text-xs px-3 py-1"
              >
                Open Full Instagram Page
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-right">
            <div>
              <p className="text-xs text-brand-text-secondary">Followers</p>
              <p className="font-bold text-brand-text">
                {account.followers.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary">Posts</p>
              <p className="font-bold text-brand-text">{account.posts}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary">Following</p>
              <p className="font-bold text-brand-text">{account.following}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated border-none bg-gradient-to-r from-purple-50 via-brand-primary-50 to-brand-light-2 border-2 border-purple-300">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-brand-text inline-flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                🚀 Automation Features
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  ACTIVE
                </span>
              </p>
              <p className="text-sm text-brand-text-secondary mt-1">
                ✅ All buttons are fully functional - Test auto-reply for
                comments, DMs, and scheduled posting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Auto Comment Reply */}
            <div className="bg-white rounded-lg p-4 border border-brand-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-brand-text inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                  Auto Comment Reply
                </p>
                <button
                  className={`px-2 py-1 rounded text-xs ${autoCommentEnabled ? "bg-brand-success text-white" : "bg-brand-border text-brand-text-secondary"}`}
                  onClick={() => {
                    setAutoCommentEnabled(!autoCommentEnabled);
                    runAction(
                      `Auto comment reply ${!autoCommentEnabled ? "enabled" : "disabled"}`,
                    );
                  }}
                >
                  {autoCommentEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <p className="text-xs text-brand-text-secondary mb-3">
                Automatically reply to incoming comments
              </p>
              <div className="space-y-2">
                <button
                  className="btn-secondary w-full text-xs"
                  onClick={simulateIncomingComment}
                >
                  ✅ Simulate New Comment
                </button>
                <button
                  className="btn-primary w-full text-xs"
                  onClick={autoReplyComment}
                >
                  ✅ Send Auto Reply Now
                </button>
              </div>
            </div>

            {/* Auto DM Reply */}
            <div className="bg-white rounded-lg p-4 border border-brand-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-brand-text inline-flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-brand-primary" />
                  Auto DM Reply
                </p>
                <button
                  className={`px-2 py-1 rounded text-xs ${autoDmEnabled ? "bg-brand-success text-white" : "bg-brand-border text-brand-text-secondary"}`}
                  onClick={() => {
                    setAutoDmEnabled(!autoDmEnabled);
                    runAction(
                      `Auto DM reply ${!autoDmEnabled ? "enabled" : "disabled"}`,
                    );
                  }}
                >
                  {autoDmEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <p className="text-xs text-brand-text-secondary mb-3">
                Automatically reply to incoming DMs
              </p>
              <div className="space-y-2">
                <button
                  className="btn-secondary w-full text-xs"
                  onClick={simulateIncomingDm}
                >
                  ✅ Simulate New DM
                </button>
                <button
                  className="btn-primary w-full text-xs"
                  onClick={autoReplyDm}
                >
                  ✅ Send Auto Reply Now
                </button>
              </div>
            </div>

            {/* Auto Post */}
            <div className="bg-white rounded-lg p-4 border border-brand-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-brand-text inline-flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-primary" />
                  Auto Post
                </p>
                <button
                  className={`px-2 py-1 rounded text-xs ${autoPostEnabled ? "bg-brand-success text-white" : "bg-brand-border text-brand-text-secondary"}`}
                  onClick={() => {
                    setAutoPostEnabled(!autoPostEnabled);
                    runAction(
                      `Auto posting ${!autoPostEnabled ? "enabled" : "disabled"}`,
                    );
                  }}
                >
                  {autoPostEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <p className="text-xs text-brand-text-secondary mb-3">
                Schedule and auto-publish posts
              </p>
              <select
                value={autoPostSchedule}
                onChange={(e) => {
                  setAutoPostSchedule(e.target.value);
                  runAction(`Auto post schedule set to ${e.target.value}`);
                }}
                className="w-full mb-2 px-2 py-1 text-xs border border-brand-border rounded"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <button className="btn-primary w-full text-xs" onClick={autoPost}>
                ✅ Post Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-brand-border">
        <div className="flex gap-4 overflow-x-auto">
          {(["posts", "comments", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-text-secondary hover:text-brand-text"
              }`}
            >
              {tab === "comments" && (
                <>
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Comments
                </>
              )}
              {tab === "posts" && (
                <>
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Posting
                </>
              )}
              {tab === "analytics" && (
                <>
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Analytics
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "comments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Workflow Info Banner */}
          <div className="lg:col-span-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-indigo-900 mb-2">
                  📱 Instagram Comment Management Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">
                      1
                    </span>
                    <span className="text-indigo-800">
                      New comment posted on Instagram
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs">
                      2
                    </span>
                    <span className="text-purple-800">
                      Appears in dashboard instantly
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white font-bold text-xs">
                      3
                    </span>
                    <span className="text-pink-800">
                      User or AI reviews comment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold text-xs">
                      4
                    </span>
                    <span className="text-green-800">Reply sent (User/AI)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">
                      5
                    </span>
                    <span className="text-blue-800">
                      Reply appears publicly on Instagram
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">
                TOTAL COMMENTS
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {visibleComments.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {selectedCommentPost
                  ? `On ${selectedCommentPost.title}`
                  : "For selected Instagram post"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-orange-600 font-semibold mb-1">
                OPEN / PENDING
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {visibleComments.filter((c) => c.status === "Open").length}
              </p>
              <p className="text-xs text-orange-600 mt-1">Awaiting response</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-600 font-semibold mb-1">
                REPLIED
              </p>
              <p className="text-2xl font-bold text-green-900">
                {visibleComments.filter((c) => c.status === "Replied").length}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Successfully handled
              </p>
            </div>
          </div>

          <div className="card-elevated border border-slate-700 bg-slate-900 p-5 space-y-3 lg:col-span-2 text-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-cyan-300 font-semibold">
                  <MessageSquare className="w-4 h-4" /> Instagram Post Comments
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Click any post below to view the comments for that post.
                </p>
              </div>
              <button
                className="btn-primary text-xs px-3 py-2 inline-flex items-center gap-2"
                onClick={simulateIncomingComment}
              >
                <MessageSquare className="w-3 h-3" />
                Simulate New Comment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {commentPosts.slice(0, 3).map((post) => (
                <button
                  key={`comment-post-${post.id}`}
                  onClick={() => setSelectedCommentPostId(post.id)}
                  className={`rounded-lg border overflow-hidden text-left transition-all ${
                    selectedCommentPostId === post.id
                      ? "border-cyan-400 bg-slate-800 shadow-sm"
                      : "border-slate-700 bg-slate-950 hover:border-cyan-400"
                  }`}
                >
                  <img
                    src={post.image || "/default-image.png"}
                    alt={post.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/default-image.png";
                    }}
                  />
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {post.title}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span>{getCommentCountForPost(post.id)} comments</span>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        aiReplyAllCommentsForPost(post.id, post.title);
                      }}
                      className="mt-3 w-full rounded-md bg-brand-primary px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
                    >
                      AI Reply Enable
                    </button>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {selectedCommentPost && (
                <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-950">
                  {selectedCommentPost.image && (
                    <img
                      src={selectedCommentPost.image}
                      alt={selectedCommentPost.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{selectedCommentPost.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {getCommentCountForPost(selectedCommentPost.id)} comments · {selectedCommentPost.reach} reach
                      </p>
                    </div>
                    <span className="text-xs text-slate-300 bg-slate-900 border border-slate-700 px-2 py-1 rounded-full">
                      Viewing comments
                    </span>
                  </div>
                </div>
              )}
              {visibleComments.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950 px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-100">No comments for this post yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select another post or click Simulate New Comment to add one for this post.
                  </p>
                </div>
              )}
              {visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg border ${
                    comment.time === "Just now"
                      ? "bg-cyan-950 border-cyan-600 animate-pulse"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {comment.avatar ? (
                          <img
                            src={comment.avatar}
                            alt={comment.user}
                            className="w-6 h-6 rounded-full object-cover border border-brand-border"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                            {comment.user.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-slate-100">
                          @{comment.user}
                        </p>
                        {comment.time === "Just now" && (
                          <span className="px-2 py-0.5 bg-brand-primary text-white text-[10px] rounded-full font-semibold animate-bounce">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {comment.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        📸 Instagram • {comment.time}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${comment.status === "Replied" ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300"}`}
                    >
                      {comment.status}
                    </span>
                  </div>
                  {comment.status === "Open" && (
                    <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                      <p className="text-xs text-slate-400 font-semibold">
                        {autoCommentEnabled ? "Auto Reply Options:" : "Reply Options:"}
                      </p>
                      <div className="flex gap-2">
                        {!autoCommentEnabled && (
                          <button
                            className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1 flex-1"
                            onClick={() => {
                              setComments((items) =>
                                items.map((item) =>
                                  item.id === comment.id
                                    ? { ...item, status: "Replied" }
                                    : item,
                                ),
                              );
                              runAction(
                                `✅ User manually replied to @${comment.user}: "${getReplyTemplateForPost(comment.postId).slice(0, 30)}..."`,
                              );
                            }}
                          >
                            <Send className="w-3 h-3" />
                            Reply as User
                          </button>
                        )}
                        <button
                          className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1 flex-1"
                          onClick={() => {
                            setComments((items) =>
                              items.map((item) =>
                                item.id === comment.id
                                  ? { ...item, status: "Replied" }
                                  : item,
                              ),
                            );
                            runAction(
                              `🤖 AI auto-replied to @${comment.user} with intelligent response`,
                            );
                          }}
                        >
                          <Bot className="w-3 h-3" />
                          AI Reply
                        </button>
                      </div>
                    </div>
                  )}
                  {comment.status === "Replied" && (
                    <div className="mt-3 space-y-2">
                      <div className="pt-3 border-t border-emerald-700 bg-emerald-950 rounded p-3">
                        <p className="text-xs text-green-700 font-semibold mb-1">
                          ✓ Your Reply:
                        </p>
                        <p className="text-xs text-emerald-200 italic">
                          "{getReplyTemplateForPost(comment.postId)}"
                        </p>
                        <p className="text-[10px] text-emerald-400 mt-1">
                          ✅ Synced to Instagram post
                        </p>
                      </div>

                      {/* Instagram Public Preview */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Instagram className="w-4 h-4 text-purple-600" />
                          <p className="text-xs font-bold text-purple-900">
                            Public Instagram View:
                          </p>
                        </div>

                        {/* Mock Instagram Comment Thread */}
                        <div className="bg-white rounded-lg p-3 space-y-3 border border-purple-200">
                          {/* Original Comment */}
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                              {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs">
                                <span className="font-semibold text-gray-900">
                                  @{comment.user}
                                </span>
                                <span className="text-gray-700 ml-1">
                                  {comment.text}
                                </span>
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {comment.time}
                              </p>
                            </div>
                          </div>

                          {/* Your Public Reply */}
                          <div className="flex gap-2 ml-8 bg-purple-50 rounded p-2 border-l-2 border-purple-400">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              L
                            </div>
                            <div className="flex-1">
                              <p className="text-xs">
                                <span className="font-semibold text-gray-900">
                                  @luminex_labs
                                </span>
                                <span className="text-gray-700 ml-1">
                                  {getReplyTemplateForPost(comment.postId)}
                                </span>
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {comment.time === "Just now"
                                  ? "30s ago"
                                  : comment.time === "2m ago"
                                    ? "1m ago"
                                    : comment.time === "14m ago"
                                      ? "10m ago"
                                      : comment.time === "27m ago"
                                        ? "22m ago"
                                        : "2m ago"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-purple-700 mt-2 font-semibold text-center">
                          👆 This is how your reply appears publicly on
                          Instagram
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated border-none p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-brand-primary flex items-center gap-2 mb-1">
                Reply Template By Post
              </p>
              <p className="text-xs text-brand-text-secondary">
                {autoCommentEnabled
                  ? "Automatic reply mode is active"
                  : "Choose a post and customize its reply message"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-text-secondary">
                Reply Target Post
              </label>
              <select
                value={replyTargetPostId || ""}
                onChange={(event) => setReplyTargetPostId(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Select a post
                </option>
                {posts.map((post) => (
                  <option key={`reply-target-${post.id}`} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-brand-text-secondary">
                Reply template currently editing for: {selectedReplyTargetPost?.title || "No post selected"}
              </p>
            </div>
            {!autoCommentEnabled ? (
              <textarea
                value={getReplyTemplateForPost(replyTargetPostId)}
                onChange={(event) =>
                  updateReplyTemplateForPost(replyTargetPostId, event.target.value)
                }
                rows={4}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
                placeholder="Your reply message..."
              />
            ) : (
              <div className="w-full rounded-lg border border-brand-border bg-slate-50 px-3 py-3 text-sm text-brand-text-secondary">
                Manual typing is disabled while Auto Comment Reply is ON.
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-900">
                💡 How it works:
              </p>
              <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                <li>New Instagram comment appears above</li>
                <li>
                  {autoCommentEnabled
                    ? "Auto mode replies with AI automatically"
                    : "Click \"Reply as User\" to send your template"}
                </li>
                <li>
                  {autoCommentEnabled
                    ? "Use \"AI Reply\" for a manual AI-triggered response"
                    : "Or click \"AI Reply\" for intelligent auto-response"}
                </li>
                <li>Comment status changes to "Replied"</li>
                <li>Reply appears publicly on Instagram post</li>
                <li>Check "Live Instagram Post Preview" below</li>
              </ol>
            </div>

            <button
              className="btn-primary w-full text-sm inline-flex items-center justify-center gap-2"
              onClick={() => {
                const openComment = comments.find(
                  (comment) =>
                    comment.postId === replyTargetPostId &&
                    comment.status === "Open",
                );
                if (openComment) {
                  setSelectedCommentPostId(replyTargetPostId);
                  setComments((items) =>
                    items.map((item) =>
                      item.id === openComment.id
                        ? { ...item, status: "Replied" }
                        : item,
                    ),
                  );
                  runAction(
                    `Quick reply sent to @${openComment.user} on ${selectedReplyTargetPost?.title || "selected post"}`,
                  );
                } else {
                  runAction(
                    'No open comments in selected post. Choose another post or click "Simulate New Comment" first!',
                  );
                }
              }}
            >
              <Send className="w-4 h-4" />
              Quick Reply to Oldest
            </button>
          </div>

          {/* Instagram Post Preview - Shows how replies appear publicly */}
          <div className="lg:col-span-3 card-elevated border-none p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-purple-600" />
                  Live Instagram Post Preview
                </p>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Real-time view of how your replies appear publicly on
                  Instagram
                </p>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                PUBLIC VIEW
              </span>
            </div>

            {/* Mock Instagram Post */}
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden max-w-2xl mx-auto">
              {/* Post Header */}
              <div className="flex items-center gap-3 p-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  L
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    luminex_labs
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedCommentPost?.title || "Instagram Post"}
                  </p>
                </div>
                <Instagram className="w-5 h-5 text-gray-400" />
              </div>

              {/* Selected Post Media */}
              {selectedCommentPost?.image ? (
                <img
                  src={selectedCommentPost.image}
                  alt={selectedCommentPost.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 h-48 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-purple-300" />
                </div>
              )}

              <div className="px-3 py-2 border-b border-gray-100 bg-white">
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCommentPost?.title || "No post selected"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCommentPost
                    ? `${getCommentCountForPost(selectedCommentPost.id)} comments • ${selectedCommentPost.reach} reach`
                    : "Select a post to preview it here"}
                </p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-4 p-3 border-b border-gray-100">
                <Heart className="w-6 h-6 text-gray-700" />
                <MessageCircle className="w-6 h-6 text-gray-700" />
                <Send className="w-6 h-6 text-gray-700" />
              </div>

              {/* Comments Section - Shows PUBLIC replies */}
              <div className="p-3 space-y-3 max-h-80 overflow-y-auto bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  COMMENTS ({visibleComments.length}) - {selectedCommentPost?.title || "No post selected"}:
                </p>

                {visibleComments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* Original User Comment */}
                    <div className="flex gap-2 items-start">
                      {comment.avatar ? (
                        <img
                          src={comment.avatar}
                          alt={comment.user}
                          className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {comment.user.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-gray-900">
                            @{comment.user}
                          </span>
                          <span className="text-gray-700 ml-1">
                            {comment.text}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {comment.time}
                          </span>
                          {comment.status === "Replied" && (
                            <span className="text-xs text-green-600 font-semibold">
                              ✓ Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Your Public Reply */}
                    {comment.status === "Replied" && (
                      <div className="flex gap-2 items-start ml-9 bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          L
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900">
                              @luminex_labs
                            </span>
                            <span className="text-gray-700 ml-1">
                              {getReplyTemplateForPost(comment.postId)}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {comment.time === "Just now"
                                ? "30s ago"
                                : comment.time === "2m ago"
                                  ? "1m ago"
                                  : comment.time === "14m ago"
                                    ? "10m ago"
                                    : comment.time === "27m ago"
                                      ? "22m ago"
                                      : "2m ago"}
                            </span>
                            <span className="text-xs text-purple-600 font-semibold">
                              • PUBLIC REPLY
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Instagram Footer */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <p className="text-xs text-gray-500 text-center">
                  👆 All replies appear publicly in this Instagram comment
                  thread
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "posts" && (
        <div className="space-y-6">
          {/* Post Publishing Workflow */}
          <div className="card-elevated border-none p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Instagram Post Publishing Workflow
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                  ACTIVE
                </span>
                <button
                  onClick={() => {
                    setCurrentPostStep(1);
                    setUploadedImage("");
                    setNewPostCaption(
                      "Launching something exciting this week. Stay tuned! 🚀",
                    );
                    setIsPublishing(false);
                    setShowPublishedPost(false);
                  }}
                  className="px-3 py-1 bg-white text-purple-600 text-xs font-bold rounded-full border-2 border-purple-600 hover:bg-purple-50 transition-colors"
                >
                  Reset Workflow
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {/* Step 1: Open Create Post Page */}
              <div
                className={`bg-white rounded-lg border-2 p-4 relative transition-all duration-300 ${
                  currentPostStep === 1
                    ? "border-purple-500 shadow-lg scale-105"
                    : "border-purple-200"
                }`}
              >
                <div
                  className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentPostStep >= 1
                      ? "bg-purple-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {currentPostStep > 1 ? "✓" : "1"}
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-text">
                      Open Create Post
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-1">
                      Click "Create Post" button
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPostStep(2)}
                    disabled={currentPostStep > 1}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      currentPostStep === 1
                        ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {currentPostStep === 1 ? "📱 Open Page" : "✓ Opened"}
                  </button>
                </div>
              </div>

              {/* Step 2: Upload Image and Add Caption */}
              <div
                className={`bg-white rounded-lg border-2 p-4 relative transition-all duration-300 ${
                  currentPostStep === 2
                    ? "border-pink-500 shadow-lg scale-105"
                    : "border-pink-200"
                }`}
              >
                <div
                  className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentPostStep >= 2
                      ? currentPostStep > 2
                        ? "bg-pink-600 text-white"
                        : "bg-pink-600 text-white animate-pulse"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {currentPostStep > 2 ? "✓" : "2"}
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-text">
                      Upload & Caption
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-1">
                      Add your content
                    </p>
                  </div>
                  {currentPostStep >= 2 && (
                    <>
                      <button
                        onClick={() => setUploadedImage("product.jpg")}
                        disabled={uploadedImage !== "" || currentPostStep > 2}
                        className={`w-full py-1.5 rounded text-[10px] font-bold transition-all ${
                          uploadedImage === "" && currentPostStep === 2
                            ? "bg-pink-500 text-white hover:bg-pink-600"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {uploadedImage ? "✓ Image Uploaded" : "📷 Upload Image"}
                      </button>
                      <textarea
                        value={newPostCaption}
                        onChange={(e) => setNewPostCaption(e.target.value)}
                        disabled={currentPostStep > 2}
                        rows={2}
                        className="w-full text-[9px] p-1.5 border border-pink-200 rounded resize-none"
                        placeholder="Write caption..."
                      />
                      <button
                        onClick={() => setCurrentPostStep(3)}
                        disabled={!uploadedImage || currentPostStep > 2}
                        className={`w-full py-1.5 rounded text-[10px] font-bold transition-all ${
                          uploadedImage && currentPostStep === 2
                            ? "bg-pink-600 text-white hover:bg-pink-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {currentPostStep > 2 ? "✓ Ready" : "Continue →"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Click Publish */}
              <div
                className={`bg-white rounded-lg border-2 p-4 relative transition-all duration-300 ${
                  currentPostStep === 3
                    ? "border-green-500 shadow-lg scale-105"
                    : "border-green-200"
                }`}
              >
                <div
                  className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentPostStep >= 3
                      ? currentPostStep > 3 || showPublishedPost
                        ? "bg-green-600 text-white"
                        : "bg-green-600 text-white animate-pulse"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {showPublishedPost ? "✓" : "3"}
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-text">
                      Click Publish
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-1">
                      Publish to Instagram
                    </p>
                  </div>
                  {currentPostStep >= 3 && (
                    <>
                      <button
                        onClick={() => {
                          setIsPublishing(true);
                          setTimeout(() => {
                            setIsPublishing(false);
                            setCurrentPostStep(4);
                            setShowPublishedPost(true);
                            const newPost: PostItem = {
                              id: `p-${Date.now()}`,
                              title: newPostCaption.slice(0, 40),
                              likes: 234,
                              comments: 18,
                              reach: "2.4K",
                            };
                            setPosts((items) => [newPost, ...items]);
                            runAction("✓ Post published to Instagram!");
                          }, 2000);
                        }}
                        disabled={isPublishing || showPublishedPost}
                        className={`w-full text-xs font-bold py-2.5 rounded-lg shadow-lg transition-all ${
                          !isPublishing && !showPublishedPost
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 cursor-pointer"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {isPublishing
                          ? "⏳ Publishing..."
                          : showPublishedPost
                            ? "✓ Published"
                            : "🚀 Publish Now"}
                      </button>
                      {isPublishing && (
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Processing...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Step 4: Post Appears on Instagram */}
              <div
                className={`bg-white rounded-lg border-2 p-4 relative transition-all duration-500 ${
                  showPublishedPost
                    ? "border-blue-500 shadow-xl scale-105 animate-pulse"
                    : "border-blue-200"
                }`}
              >
                <div
                  className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    showPublishedPost
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {showPublishedPost ? "✓" : "4"}
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center transition-all ${
                      showPublishedPost ? "animate-bounce" : ""
                    }`}
                  >
                    <Instagram className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-text">
                      Live on Instagram
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-1">
                      {showPublishedPost
                        ? "Post published! 🎉"
                        : "Waiting to publish..."}
                    </p>
                  </div>
                  {showPublishedPost ? (
                    <div className="w-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-3 border-2 border-blue-400 shadow-lg animate-in">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full"></div>
                        <p className="text-[9px] font-bold text-gray-800">
                          @luminex_labs
                        </p>
                        <span className="ml-auto text-[8px] text-blue-600 font-bold">
                          NEW
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded h-12 mb-2 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-[8px] text-gray-700 mb-2 text-left line-clamp-2">
                        {newPostCaption}
                      </p>
                      <div className="flex gap-3 text-[10px] font-semibold">
                        <span className="text-red-500">❤️ 234</span>
                        <span className="text-gray-600">💬 18</span>
                        <span className="text-gray-600">📤 42</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 rounded-lg p-3 border-2 border-gray-300 opacity-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        <div className="h-2 w-16 bg-gray-300 rounded"></div>
                      </div>
                      <div className="bg-gray-300 rounded h-12 mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-2 w-8 bg-gray-300 rounded"></div>
                        <div className="h-2 w-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  )}
                  {showPublishedPost && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold animate-pulse">
                      <ShieldCheck className="w-3 h-3" />
                      Published ✓
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-xs text-center text-brand-text-secondary">
                <strong className="text-green-600">✓ Active Feature:</strong>{" "}
                This workflow handles the complete posting process. Instagram
                posting requires Meta API approval and authentication.
              </p>
            </div>
          </div>

          {/* Complete Post Management Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create New Post Card */}
              <div className="card-elevated border-none p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Create Instagram Post
                  </h3>
                  <button
                    onClick={() =>
                      setShowPostUploadSection(!showPostUploadSection)
                    }
                    className={`btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm ${
                      showPostUploadSection ? "bg-gray-600" : ""
                    }`}
                  >
                    {showPostUploadSection ? (
                      <>
                        <X className="w-4 h-4" /> Close
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> New Post
                      </>
                    )}
                  </button>
                </div>

                {showPostUploadSection ? (
                  <div className="space-y-6">
                    {/* Image Upload Area */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-brand-text">
                        Upload Images/Video
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handlePostImageUpload}
                          className="hidden"
                          id="post-image-upload"
                          disabled={isUploadingPost}
                        />
                        <label
                          htmlFor="post-image-upload"
                          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                            isUploadingPost
                              ? "border-purple-400 bg-purple-100"
                              : "border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-500"
                          }`}
                        >
                          {isUploadingPost ? (
                            <div className="text-center">
                              <Upload className="w-12 h-12 text-purple-600 animate-bounce mx-auto mb-3" />
                              <p className="text-base font-semibold text-purple-600">
                                Uploading... {uploadPostProgress}%
                              </p>
                              <div className="w-48 h-3 bg-purple-200 rounded-full mt-3 overflow-hidden mx-auto">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                                  style={{ width: `${uploadPostProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-8 h-8 text-purple-600" />
                              </div>
                              <p className="text-base font-semibold text-brand-text">
                                Drag & drop or click to upload
                              </p>
                              <p className="text-sm text-brand-text-secondary mt-2">
                                Supports: JPG, PNG, MP4 • Max 10MB • Multiple
                                files
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Image Preview Grid */}
                    {uploadedPostImages.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-brand-text">
                            Preview ({uploadedPostImages.length}{" "}
                            {uploadedPostImages.length === 1 ? "file" : "files"}
                            )
                          </label>
                          <span className="text-xs text-brand-text-secondary">
                            {uploadedPostImages.length > 1
                              ? "Carousel post"
                              : "Single post"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {uploadedPostImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-28 object-cover rounded-lg border-2 border-purple-300 shadow-md"
                              />
                              <button
                                onClick={() => removePostImage(index)}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700 shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {index === 0 && (
                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                                  Cover
                                </span>
                              )}
                              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-bold rounded-full">
                                {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Caption and Hashtags */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-brand-text">
                        Caption
                      </label>
                      <textarea
                        value={postCaption}
                        onChange={(e) => setPostCaption(e.target.value)}
                        rows={6}
                        className="w-full rounded-lg border-2 border-purple-300 bg-white px-4 py-3 text-sm focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Write a caption for your post... Add hashtags, mentions, and emojis 🎉"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-brand-text-secondary">
                          {postCaption.length} / 2,200 characters
                        </span>
                        <button
                          onClick={() =>
                            setPostCaption(
                              postCaption + " " + selectedHashtags.join(" "),
                            )
                          }
                          className="text-purple-600 hover:text-purple-700 font-semibold"
                          disabled={selectedHashtags.length === 0}
                        >
                          {selectedHashtags.length > 0 &&
                            `Add ${selectedHashtags.length} hashtags to caption`}
                        </button>
                      </div>
                    </div>

                    {/* Hashtag Suggestions */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-brand-text">
                        Quick Hashtags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {suggestedHashtags.map((hashtag) => (
                          <button
                            key={hashtag}
                            onClick={() => toggleHashtag(hashtag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              selectedHashtags.includes(hashtag)
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                                : "bg-white border border-purple-300 text-purple-600 hover:border-purple-500"
                            }`}
                          >
                            {hashtag}
                          </button>
                        ))}
                      </div>
                      {selectedHashtags.length > 0 && (
                        <p className="text-xs text-brand-text-secondary">
                          Selected: {selectedHashtags.join(" ")}
                        </p>
                      )}
                    </div>

                    {/* Schedule Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-brand-text flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          Schedule Date
                        </label>
                        <input
                          type="date"
                          value={postScheduleDate}
                          onChange={(e) => setPostScheduleDate(e.target.value)}
                          className="w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-brand-text flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          Schedule Time
                        </label>
                        <input
                          type="time"
                          value={postScheduleTime}
                          onChange={(e) => setPostScheduleTime(e.target.value)}
                          className="w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Visibility Options */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-brand-text flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-600" />
                        Post Visibility
                      </label>
                      <div className="flex gap-3">
                        {(["public", "private", "friends"] as const).map(
                          (option) => (
                            <button
                              key={option}
                              onClick={() => setPostVisibility(option)}
                              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold capitalize transition-all ${
                                postVisibility === option
                                  ? "bg-purple-600 text-white shadow-md"
                                  : "bg-white border border-purple-300 text-purple-600 hover:border-purple-500"
                              }`}
                            >
                              {option}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => publishOrSchedulePost("publish")}
                        className="flex-1 btn-primary inline-flex items-center justify-center gap-2 py-3 text-base font-semibold"
                        disabled={
                          uploadedPostImages.length === 0 && !postCaption.trim()
                        }
                      >
                        <Send className="w-5 h-5" />
                        Publish Now
                      </button>
                      <button
                        onClick={() => publishOrSchedulePost("schedule")}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg inline-flex items-center justify-center gap-2 py-3 text-base font-semibold hover:shadow-lg transition-all"
                        disabled={
                          !postScheduleDate ||
                          !postScheduleTime ||
                          (uploadedPostImages.length === 0 &&
                            !postCaption.trim())
                        }
                      >
                        <Calendar className="w-5 h-5" />
                        Schedule Post
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-brand-text-secondary mb-4">
                      Click "New Post" to create your next Instagram post
                    </p>
                    <button
                      onClick={() => setShowPostUploadSection(true)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Start Creating
                    </button>
                  </div>
                )}
              </div>

              {/* Posts Analytics */}
              <div className="card-elevated border-none p-6">
                <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Post Performance Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-2">
                      Total Posts
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {posts.length}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">All time</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                    <p className="text-xs font-semibold text-red-600 uppercase mb-2">
                      Total Likes
                    </p>
                    <p className="text-3xl font-bold text-red-900">
                      {posts
                        .reduce((sum, p) => sum + p.likes, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600 mt-1">+12% this week</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <p className="text-xs font-semibold text-green-600 uppercase mb-2">
                      Total Comments
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {posts.reduce((sum, p) => sum + p.comments, 0)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">+8% this week</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-2">
                      Engagement
                    </p>
                    <p className="text-3xl font-bold text-purple-900">4.8%</p>
                    <p className="text-xs text-purple-600 mt-1">
                      Above average
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Posts List */}
              <div className="card-elevated border-none p-6">
                <h3 className="text-base font-bold text-brand-text mb-4">
                  Recent Posts
                </h3>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-brand-text-secondary">
                      No posts yet. Create your first post!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.slice(0, 5).map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-200 hover:border-purple-400 transition-all hover:shadow-md space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-brand-text mb-2">
                              {post.title}
                            </p>
                            <div className="flex gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="font-bold text-brand-text">
                                  {post.likes.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                <span className="font-bold text-brand-text">
                                  {getCommentsForPost(post.id).length}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-green-500" />
                                <span className="font-bold text-brand-text">
                                  {post.reach}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="btn-primary text-xs px-3 py-1"
                              onClick={() => openCommentsForPost(post.id, post.title)}
                            >
                              Check Comments
                            </button>
                            <button className="btn-secondary text-xs px-3 py-1">
                              View Insights
                            </button>
                          </div>
                        </div>

                        <div className="rounded-lg border border-purple-200 bg-white/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-brand-text uppercase tracking-wide">
                              Comment Section
                            </p>
                            <span className="text-[11px] text-brand-text-secondary">
                              {getCommentsForPost(post.id).length} comments
                            </span>
                          </div>

                          {getCommentsForPost(post.id).length === 0 ? (
                            <p className="text-xs text-brand-text-secondary">
                              No comments on this post yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {getCommentsForPost(post.id).map((comment) => (
                                <div
                                  key={`post-card-comment-${comment.id}`}
                                  className="rounded-md bg-brand-light/40 border border-brand-border px-3 py-2"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold text-brand-text">
                                      @{comment.user}
                                    </p>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        comment.status === "Replied"
                                          ? "bg-brand-success bg-opacity-20 text-brand-success"
                                          : "bg-brand-warning bg-opacity-20 text-brand-warning"
                                      }`}
                                    >
                                      {comment.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-brand-text-secondary mt-1">
                                    {comment.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div className="space-y-4">
              {/* Quick Post */}
              <div className="card-elevated border-none p-5 space-y-3">
                <p className="text-sm font-semibold text-brand-text flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Quick Post
                </p>
                <textarea
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
                  placeholder="Quick caption..."
                />
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    const newPost: PostItem = {
                      id: `p-${Date.now()}`,
                      title: postCaption.slice(0, 30),
                      likes: 0,
                      comments: 0,
                      reach: "0",
                    };
                    setPosts([newPost, ...posts]);
                    runAction("Quick post published!");
                  }}
                >
                  Quick Publish
                </button>
              </div>

              {/* Scheduled Posts */}
              <div className="card-elevated border-none p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-text flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Scheduled Posts
                  </p>
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                    2
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-xs font-semibold text-brand-text">
                      Product Launch Post
                    </p>
                    <p className="text-[10px] text-brand-text-secondary mt-1">
                      📅 Mar 10, 2026 • 10:00 AM
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-xs font-semibold text-brand-text">
                      Weekend Special
                    </p>
                    <p className="text-[10px] text-brand-text-secondary mt-1">
                      📅 Mar 11, 2026 • 2:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Tips */}
              <div className="card-elevated border-none p-5 space-y-3 bg-gradient-to-br from-green-50 to-teal-50">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  💡 Pro Tips
                </p>
                <div className="space-y-2 text-xs text-green-700">
                  <p>✓ Best time to post: 11 AM - 1 PM</p>
                  <p>✓ Use 5-10 relevant hashtags</p>
                  <p>✓ Include call-to-action</p>
                  <p>✓ Add location tags for reach</p>
                  <p>✓ Engage with comments quickly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "dms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-elevated border-none p-5 space-y-3 lg:col-span-2">
            <p className="inline-flex items-center gap-2 text-brand-primary font-semibold">
              <MessageCircle className="w-4 h-4" /> Incoming DMs
            </p>
            <div className="space-y-3">
              {dms.map((dm) => (
                <div
                  key={dm.id}
                  className={`p-3 rounded-lg border ${dm.unread ? "bg-brand-primary-50 border-brand-primary" : "bg-brand-light-2 border-brand-border"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-text">
                        @{dm.user}
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        {dm.preview}
                      </p>
                    </div>
                    {dm.unread && (
                      <span className="text-xs px-2 py-1 rounded bg-brand-primary text-white">
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "dms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-elevated border-none p-5 space-y-3 lg:col-span-2">
            <p className="inline-flex items-center gap-2 text-brand-primary font-semibold">
              <MessageCircle className="w-4 h-4" /> Incoming DMs
            </p>
            <div className="space-y-3">
              {dms.map((dm) => (
                <div
                  key={dm.id}
                  className={`p-3 rounded-lg border ${dm.unread ? "bg-brand-primary-50 border-brand-primary" : "bg-brand-light-2 border-brand-border"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-text">
                        @{dm.user}
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        {dm.preview}
                      </p>
                    </div>
                    {dm.unread && (
                      <span className="text-xs px-2 py-1 rounded bg-brand-primary text-white">
                        New
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-secondary text-xs px-2 py-1 mt-2"
                    onClick={() => {
                      setDms((items) =>
                        items.map((item) =>
                          item.id === dm.id ? { ...item, unread: false } : item,
                        ),
                      );
                      runAction(`Auto reply sent to @${dm.user}`);
                    }}
                  >
                    Send Auto Reply
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated border-none p-5 space-y-3">
            <p className="text-sm font-semibold text-brand-primary flex items-center gap-2">
              Auto DM Template
            </p>
            <div className="flex items-center justify-between p-2 rounded-lg bg-brand-light-2 border border-brand-border mb-3">
              <p className="text-sm text-brand-text-secondary">
                Auto Reply Status
              </p>
              <button
                className={`text-xs px-2 py-1 rounded ${isAutoReplyEnabled ? "bg-brand-success text-white" : "bg-brand-border text-brand-text-secondary"}`}
                onClick={() => {
                  setIsAutoReplyEnabled(!isAutoReplyEnabled);
                  runAction(
                    `Auto DM ${isAutoReplyEnabled ? "disabled" : "enabled"}`,
                  );
                }}
              >
                {isAutoReplyEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <textarea
              value={dmReply}
              onChange={(event) => setDmReply(event.target.value)}
              rows={6}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
              placeholder="Auto DM template..."
            />
            <button
              className="btn-secondary w-full text-sm inline-flex items-center justify-center gap-1"
              onClick={() => runAction("Auto DM template saved")}
            >
              <Zap className="w-3 h-3" /> Save Template
            </button>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Analytics Header */}
          <div className="card-elevated border-none p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brand-text flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-brand-primary" />
                  Instagram Analytics Dashboard
                </h2>
                <p className="text-sm text-brand-text-secondary mt-1">
                  Account: @luminex_labs
                </p>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                LIVE DATA
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="card-elevated border-none p-5 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-blue-600 uppercase">
                  Followers
                </p>
                <Instagram className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">4</p>
              <p className="text-xs text-blue-600 mt-1">Current total</p>
            </div>

            <div className="card-elevated border-none p-5 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-purple-600 uppercase">
                  Following
                </p>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">50</p>
              <p className="text-xs text-purple-600 mt-1">Current total</p>
            </div>

            <div className="card-elevated border-none p-5 bg-gradient-to-br from-pink-50 to-pink-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-pink-600 uppercase">
                  Posts
                </p>
                <Heart className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-pink-900">{posts.length}</p>
              <p className="text-xs text-pink-600 mt-1">Published posts</p>
            </div>

            <div className="card-elevated border-none p-5 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-green-600 uppercase">
                  Engagement Rate
                </p>
                <Zap className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-900">2.1%</p>
              <p className="text-xs text-green-600 mt-1">Small account baseline</p>
            </div>

            <div className="card-elevated border-none p-5 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-orange-600 uppercase">
                  Profile Visits
                </p>
                <MessageSquare className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-900">18</p>
              <p className="text-xs text-orange-600 mt-1">Last 7 days</p>
            </div>
          </div>

          {/* Real-Time Analytics */}
          <div className="card-elevated border-none p-5 bg-gradient-to-r from-slate-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-text">
                  Real-Time Analytics
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Live engagement metrics and trends
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-green-600 text-white animate-pulse">
                  LIVE
                </span>
              </div>
            </div>

            {/* Day Range Selector */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">
                Time Range:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedDayRange(7)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    selectedDayRange === 7
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setSelectedDayRange(14)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    selectedDayRange === 14
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  14 Days
                </button>
                <button
                  onClick={() => setSelectedDayRange(30)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    selectedDayRange === 30
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-lg bg-white border border-indigo-100 p-4">
                <p className="text-xs text-gray-500">Followers</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {liveFollowersToday}
                </p>
                <p
                  className={`text-xs mt-1 ${Number(followersChange) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {Number(followersChange) >= 0 ? "+" : ""}
                  {followersChange}% vs last period
                </p>
              </div>
              <div className="rounded-lg bg-white border border-indigo-100 p-4">
                <p className="text-xs text-gray-500">Comments Received</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {liveCommentsReceived}
                </p>
                <p
                  className={`text-xs mt-1 ${Number(commentsChange) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {Number(commentsChange) >= 0 ? "+" : ""}
                  {commentsChange}% vs last period
                </p>
              </div>
              <div className="rounded-lg bg-white border border-indigo-100 p-4">
                <p className="text-xs text-gray-500">Average Reply Time</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {liveAvgReplyTime}m
                </p>
                <p
                  className={`text-xs mt-1 ${Number(replyTimeChange) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {Number(replyTimeChange) >= 0 ? "+" : ""}
                  {replyTimeChange}% improved
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-white border border-indigo-100 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                {selectedDayRange}-Day Engagement Trend
              </p>
              <svg
                viewBox="0 0 100 24"
                className="w-full h-20"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${selectedDayRange} day engagement trend`}
              >
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="1.8"
                  points={chartData.points
                    .map((y, i) => `${i * chartData.step},${y}`)
                    .join(" ")}
                />
                <polyline
                  fill="rgba(79,70,229,0.12)"
                  stroke="none"
                  points={`0,24 ${chartData.points.map((y, i) => `${i * chartData.step},${y}`).join(" ")} 100,24`}
                />
              </svg>
              <p className="text-[10px] text-gray-500 mt-1">
                Auto-refreshing every 1 second • Tick #{liveTick} •{" "}
                {new Date().toLocaleTimeString()}
              </p>
              <div className="mt-2 text-[10px] text-gray-500 text-center">
                <span>
                  Showing last {selectedDayRange} days of engagement data
                </span>
              </div>
            </div>
          </div>

          {/* Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-elevated border-none p-5">
              <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-primary" />
                Follower Growth (Last 30 Days)
              </h3>
              <div className="space-y-2">
                {[
                  {
                    day: "Week 1",
                    followers: 1,
                    color: "bg-blue-500",
                    width: "25%",
                  },
                  {
                    day: "Week 2",
                    followers: 2,
                    color: "bg-blue-600",
                    width: "50%",
                  },
                  {
                    day: "Week 3",
                    followers: 3,
                    color: "bg-blue-700",
                    width: "75%",
                  },
                  {
                    day: "Week 4",
                    followers: 4,
                    color: "bg-blue-800",
                    width: "100%",
                  },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-brand-text-secondary">
                        {item.day}
                      </span>
                      <span className="text-xs font-bold text-brand-text">
                        {item.followers.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: item.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-elevated border-none p-5">
              <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Engagement Trends (Last 7 Days)
              </h3>
              <div className="space-y-2">
                {[
                  {
                    day: "Mon",
                    likes: 4,
                    comments: 1,
                    color: "bg-pink-500",
                    width: "44%",
                  },
                  {
                    day: "Tue",
                    likes: 3,
                    comments: 1,
                    color: "bg-pink-600",
                    width: "33%",
                  },
                  {
                    day: "Wed",
                    likes: 5,
                    comments: 1,
                    color: "bg-pink-700",
                    width: "56%",
                  },
                  {
                    day: "Thu",
                    likes: 6,
                    comments: 2,
                    color: "bg-pink-800",
                    width: "67%",
                  },
                  {
                    day: "Fri",
                    likes: 7,
                    comments: 2,
                    color: "bg-pink-900",
                    width: "78%",
                  },
                  {
                    day: "Sat",
                    likes: 9,
                    comments: 3,
                    color: "bg-pink-600",
                    width: "100%",
                  },
                  {
                    day: "Sun",
                    likes: 8,
                    comments: 2,
                    color: "bg-pink-700",
                    width: "89%",
                  },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-brand-text-secondary font-semibold">
                        {item.day}
                      </span>
                      <span className="text-xs font-bold text-brand-text">
                        ❤️ {item.likes} 💬 {item.comments}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: item.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Post Engagement Stats */}
          <div className="card-elevated border-none p-5">
            <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-primary" />
              Top Performing Posts
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  title: "Welcome to Luminex Labs",
                  likes: 6,
                  comments: 2,
                  reach: "54",
                  saves: 1,
                  engagement: "14.8%",
                },
              ].map((post, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-brand-text text-sm">
                      {post.title}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      {post.engagement}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Likes</p>
                      <p className="font-bold text-gray-900">
                        {post.likes.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Comments</p>
                      <p className="font-bold text-gray-900">{post.comments}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reach</p>
                      <p className="font-bold text-gray-900">{post.reach}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Saves</p>
                      <p className="font-bold text-gray-900">{post.saves}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story Performance */}
          <div className="card-elevated border-none p-5">
            <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
              <Instagram className="w-5 h-5 text-purple-600" />
              Story Performance (Last 7 Days)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-xs font-semibold text-purple-600 mb-2">
                  TOTAL STORIES
                </p>
                <p className="text-3xl font-bold text-purple-900">1</p>
                <p className="text-xs text-purple-600 mt-1">Published this week</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  STORY VIEWS
                </p>
                <p className="text-3xl font-bold text-blue-900">42</p>
                <p className="text-xs text-blue-600 mt-1">Avg 42/story</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                <p className="text-xs font-semibold text-pink-600 mb-2">
                  REPLIES
                </p>
                <p className="text-3xl font-bold text-pink-900">3</p>
                <p className="text-xs text-pink-600 mt-1">7.1% reply rate</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-xs font-semibold text-green-600 mb-2">
                  LINK CLICKS
                </p>
                <p className="text-3xl font-bold text-green-900">5</p>
                <p className="text-xs text-green-600 mt-1">11.9% CTR</p>
              </div>
            </div>
          </div>

          {/* Individual Post Insights */}
          <div className="card-elevated border-none p-5">
            <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-primary" />
              Detailed Post Insights
            </h3>
            <div className="space-y-4">
              {[
                {
                  post: "Welcome to Luminex Labs",
                  image: "🚀",
                  likes: 6,
                  comments: 2,
                  reach: 54,
                  saves: 1,
                  shares: 1,
                  impressions: 61,
                  engagement: "14.8%",
                  date: "This week",
                },
              ].map((post, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 border-2 border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl">
                        {post.image}
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-text">
                          {post.post}
                        </h4>
                        <p className="text-xs text-brand-text-secondary">
                          {post.date}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      {post.engagement} Engagement
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Likes</p>
                      <p className="text-lg font-bold text-pink-600">
                        ❤️ {post.likes.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Comments</p>
                      <p className="text-lg font-bold text-blue-600">
                        💬 {post.comments}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Reach</p>
                      <p className="text-lg font-bold text-purple-600">
                        👁️ {post.reach.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Saves</p>
                      <p className="text-lg font-bold text-green-600">
                        🔖 {post.saves}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Shares</p>
                      <p className="text-lg font-bold text-orange-600">
                        📤 {post.shares}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Impressions</p>
                      <p className="text-lg font-bold text-indigo-600">
                        📊 {post.impressions.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Report Button */}
          <div className="card-elevated border-none p-5 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-text">
                  Analytics Report
                </h3>
                <p className="text-sm text-brand-text-secondary mt-1">
                  Download comprehensive analytics report for Meta review
                </p>
              </div>
              <button className="btn-primary inline-flex items-center gap-2 px-4 py-2">
                <BarChart3 className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
