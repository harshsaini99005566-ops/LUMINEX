import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Dummy Data
const user = {
  username: "harsh.dev",
  profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
  verified: true,
  location: "Bangalore, India",
  timestamp: "2 hours ago",
};
const post = {
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  likes: 1287,
  caption: "Exploring the beauty of nature! #travel #adventure #naturelovers",
  hashtags: ["#travel", "#adventure", "#naturelovers"],
  comments: [
    {
      username: "john_doe",
      profilePic: "https://randomuser.me/api/portraits/men/45.jpg",
      text: "Amazing view! 😍",
      liked: false,
    },
    {
      username: "jane.smith",
      profilePic: "https://randomuser.me/api/portraits/women/65.jpg",
      text: "Wish I was there!",
      liked: true,
    },
  ],
};
const suggestedUsers = [
  {
    username: "alex99",
    profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
    followed: false,
  },
  {
    username: "sara_lee",
    profilePic: "https://randomuser.me/api/portraits/women/22.jpg",
    followed: false,
  },
];
const trendingHashtags = ["#reactjs", "#frontend", "#webdev", "#tailwindcss", "#design"];

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/2" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}

function PostHeader({ user }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <div className="flex items-center gap-3">
        <img src={user.profilePic} alt="profile" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{user.username}</span>
            {user.verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2l2.39 4.84L18 7.27l-3.91 3.81L15.18 18 10 14.77 4.82 18l1.09-6.92L2 7.27l5.61-.43L10 2z" />
              </svg>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{user.location} • {user.timestamp}</div>
        </div>
      </div>
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="4" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="16" cy="10" r="2" />
        </svg>
      </button>
    </div>
  );
}

function PostImage({ src }) {
  return (
    <div className="relative group">
      <img
        src={src}
        alt="post"
        className="w-full aspect-square object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

function PostActions({ liked, onLike, likesCount, onNotify }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onLike}
          className="focus:outline-none"
        >
          <motion.svg
            className={`w-7 h-7 ${liked ? "text-red-500" : "text-gray-500"}`}
            fill={liked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            whileTap={{ scale: 1.2 }}
            onAnimationComplete={onNotify}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 19.364l7.071-7.071a4 4 0 015.657 0l7.071 7.071M5.121 19.364A4 4 0 0112 12.293a4 4 0 016.879 7.071"
            />
          </motion.svg>
        </button>
        <button className="hover:text-blue-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z" />
          </svg>
        </button>
        <button className="hover:text-green-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-2" />
            <path d="M15 3l-6 6m0 0l6 6m-6-6h12" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 dark:text-gray-300 font-semibold">{likesCount} likes</span>
        <button className="hover:text-yellow-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Caption({ username, text, hashtags }) {
  const [expanded, setExpanded] = useState(false);
  const shortText = text.length > 80 && !expanded ? text.slice(0, 80) + "..." : text;
  return (
    <div className="px-4 pb-2">
      <span className="font-bold mr-2">{username}</span>
      <span>
        {shortText}
        {text.length > 80 && !expanded && (
          <button className="text-blue-500 ml-1" onClick={() => setExpanded(true)}>
            Read more
          </button>
        )}
      </span>
      <div className="mt-1 space-x-2">
        {hashtags.map((tag) => (
          <span key={tag} className="text-blue-500">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function Comments({ comments }) {
  return (
    <div className="px-4 pb-2">
      <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">View all comments</a>
      <div className="space-y-2 mt-2">
        {comments.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <img src={c.profilePic} alt="profile" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-sm">{c.username}</span>
            <span className="text-sm">{c.text}</span>
            <button className="ml-auto hover:text-red-500 transition">
              <svg className={`w-4 h-4 ${c.liked ? "fill-red-500" : "fill-gray-400"}`} viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddComment() {
  const [comment, setComment] = useState("");
  return (
    <div className="flex items-center px-4 py-2 border-t border-gray-200 dark:border-gray-700">
      <button className="mr-2">
        <span role="img" aria-label="emoji">😊</span>
      </button>
      <input
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button
        className={`ml-2 text-blue-500 font-semibold ${!comment && "opacity-50 cursor-not-allowed"}`}
        disabled={!comment}
      >
        Post
      </button>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:block w-80 ml-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6">
        <h3 className="font-bold mb-4">Suggested for you</h3>
        {suggestedUsers.map((u) => (
          <div key={u.username} className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={u.profilePic} alt="profile" className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{u.username}</span>
            </div>
            <button className="text-blue-500 font-semibold hover:underline">Follow</button>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Trending Hashtags</h3>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((tag) => (
            <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Notification({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
        >
          Post liked! ❤️
          <button className="ml-4" onClick={onClose}>✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DarkModeToggle({ dark, setDark }) {
  return (
    <button
      className="fixed top-6 right-6 z-50 bg-gray-200 dark:bg-gray-800 p-2 rounded-full shadow hover:scale-110 transition"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle dark mode"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

export default function PostPage() {
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const handleLike = () => {
    setLiked((l) => !l);
    setLikes((l) => (liked ? l - 1 : l + 1));
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex justify-center py-10 transition-colors duration-300">
      <DarkModeToggle dark={dark} setDark={setDark} />
      <Notification show={showNotif} onClose={() => setShowNotif(false)} />
      <div className="flex w-full max-w-5xl">
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-xl">
            {loading ? (
              <Skeleton />
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                <PostHeader user={user} />
                <PostImage src={post.image} />
                <PostActions liked={liked} onLike={handleLike} likesCount={likes} onNotify={() => {}} />
                <Caption username={user.username} text={post.caption} hashtags={post.hashtags} />
                <Comments comments={post.comments} />
                <AddComment />
              </div>
            )}
          </div>
        </main>
        <Sidebar />
      </div>
    </div>
  );
}
