"use client";

import { useState } from "react";
import MediaUploader from "@/components/MediaUploader";
import PostPreview from "@/components/PostPreview";

// Mock user data for demo
const mockUser = {
  username: "demo_user",
  profilePic: "/demo-profile.jpg",
  followers: 1240,
  following: 312,
};

// Mock feed for published posts
import type { FC } from "react";
type MediaFile = { url: string; type: "image" | "video" };
type DemoPost = {
  mediaFiles: MediaFile[];
  caption: string;
  hashtags: string[];
  location: string;
  publishedAt: string;
};

const DemoFeed: FC<{ posts: DemoPost[] }> = ({ posts }) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Demo Feed</h2>
      <div className="space-y-6">
        {posts.length === 0 && (
          <div className="text-gray-400">No posts yet. Publish to see your post here!</div>
        )}
        {posts.map((post, idx) => (
          <div key={idx} className="bg-cyber-darker border border-gray-800 rounded-lg p-6">
            <PostPreview
              mediaUrl={post.mediaFiles[0]?.url}
              mediaType={post.mediaFiles.length > 1 ? 'carousel' : post.mediaFiles[0]?.type ?? 'image'}
              mediaFiles={post.mediaFiles}
              caption={post.caption}
              hashtags={post.hashtags}
              location={post.location ? { name: post.location } : undefined}
              username={mockUser.username}
            />
            <div className="flex items-center gap-4 mt-4 text-gray-400 text-xs">
              <span>❤️ {Math.floor(Math.random() * 1000)}</span>
              <span>💬 {Math.floor(Math.random() * 200)}</span>
              <span>Published: {post.publishedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PostingDemoPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [feed, setFeed] = useState<DemoPost[]>([]);

  const handleUpload = (files) => setMediaFiles(files);
  const handleAddHashtag = () => {
    const cleanTag = hashtagInput.replace('#', '').trim();
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags([...hashtags, cleanTag]);
      setHashtagInput("");
    }
  };
  const handleRemoveHashtag = (tag) => setHashtags(hashtags.filter((h) => h !== tag));
  // tag is string, so no change needed

  const handlePublishNow = () => {
    if (!mediaFiles.length) return setError("Please upload at least one media file.");
    setPublishing(true);
    setTimeout(() => {
      setFeed([
        {
          mediaFiles,
          caption,
          hashtags,
          location,
          publishedAt: new Date().toLocaleString(),
        },
        ...feed,
      ]);
      setMediaFiles([]);
      setCaption("");
      setHashtags([]);
      setLocation("");
      setScheduledDate("");
      setScheduledTime("");
      setError("");
      setPublishing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <img src={mockUser.profilePic} alt="Profile" className="w-14 h-14 rounded-full border-2 border-primary" />
          <div>
            <div className="font-bold text-lg">{mockUser.username}</div>
            <div className="text-xs text-gray-400">{mockUser.followers} followers • {mockUser.following} following</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Editor */}
          <div className="space-y-6">
            <div className="bg-cyber-darker border border-gray-800 rounded-lg p-6">
              <h1 className="text-2xl font-bold mb-4">Demo: Create a Post</h1>
              <MediaUploader onUpload={handleUpload} />
            </div>
            <div className="bg-cyber-darker border border-gray-800 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Write your caption here..."
              />
            </div>
            <div className="bg-cyber-darker border border-gray-800 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                  placeholder="Add hashtag..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleAddHashtag}
                  className="px-4 py-2 bg-primary rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      className="ml-2 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-cyber-darker border border-gray-800 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-300 mb-4">Schedule (Optional)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={handlePublishNow}
                disabled={publishing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? 'Publishing...' : 'Publish Now (Demo)'}
              </button>
            </div>
          </div>
          {/* Right column - Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
            <PostPreview
              mediaUrl={mediaFiles[0]?.url}
              mediaType={mediaFiles.length > 1 ? 'carousel' : mediaFiles[0]?.type ?? 'image'}
              mediaFiles={mediaFiles}
              caption={caption}
              hashtags={hashtags}
              location={location ? { name: location } : undefined}
              username={mockUser.username}
            />
          </div>
        </div>
        <DemoFeed posts={feed} />
      </div>
    </div>
  );
}
