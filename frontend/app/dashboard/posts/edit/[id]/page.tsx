'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MediaUploader from '@/components/MediaUploader';
import PostPreview from '@/components/PostPreview';
import { ScheduledPost, InstagramAccount, MediaFile, HashtagSuggestion, LocationResult } from '@/types';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  // State declarations to fix errors
  const [post, setPost] = useState<ScheduledPost | null>(null);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState<string>('');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // Mock previous posts and comments data for display
  const previousPosts = [
    { id: "p1", title: "Demo Post 1", likes: 0, comments: 2, reach: "0", image: "/posts/333.png" },
    { id: "p2", title: "Demo Post 2", likes: 0, comments: 3, reach: "0", image: "/posts/444.jpg" },
    { id: "p3", title: "Demo Post 3", likes: 0, comments: 2, reach: "0", image: "/posts/555.jpg" },
  ];
  const previousComments = [
    { id: "c1", user: "harsh_956", avatar: "/profiles/harsh_956.png", text: "Love this launch post. Excited to see more.", postId: "p1", time: "2m ago", status: "Open" },
    { id: "c2", user: "nita_rathore_527", avatar: "C:/Users/DELL/OneDrive/Desktop 111/nita_rathore_527.jpg", text: "Clean start. Looking forward to your next update!", postId: "p1", time: "14m ago", status: "Replied" },
    { id: "c3", user: "vexora_labs", text: "This setup looks clean. What tools are you using?", postId: "p2", time: "31m ago", status: "Open" },
    { id: "c4", user: "vexora_labs", text: "Impressed by the automation features!", postId: "p2", time: "just now", status: "Open" },
    { id: "c7", user: "vexora_labs", text: "How do you handle scaling for multiple accounts?", postId: "p2", time: "moments ago", status: "Open" },
    { id: "c5", user: "vexora_labs", text: "Congrats on the milestone post!", postId: "p3", time: "1h ago", status: "Open" },
    { id: "c6", user: "vexora_labs", text: "Small account but strong start. Keep going!", postId: "p3", time: "1h ago", status: "Replied" },
  ];
  // ...existing code...

  // Fetch post data
  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Fetch Instagram accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const postData = data.post || data;
        setPost(postData);

        // Populate form fields
        setSelectedAccountId(postData.instagramAccountId);
        setCaption(postData.caption || '');
        setHashtags(postData.hashtags || []);
        setLocation(postData.location || null);

        // Set media files
        if (postData.mediaUrls && postData.mediaUrls.length > 0) {
          setUploadedFiles(
            postData.mediaUrls.map((url: string, index: number) => ({
              url,
              type: 'image' as const,
              filename: `media-${index + 1}`,
              size: 0,
            }))
          );
        } else if (postData.mediaUrl) {
          setUploadedFiles([
            {
              url: postData.mediaUrl,
              type: postData.mediaType === 'video' ? 'video' : 'image',
              filename: 'media-1',
              size: 0,
            },
          ]);
        }

        // Set scheduled date/time
        if (postData.scheduledFor) {
          const scheduleDate = new Date(postData.scheduledFor);
          setScheduledDate(scheduleDate.toISOString().split('T')[0]);
          setScheduledTime(scheduleDate.toTimeString().slice(0, 5));
        }
      } else {
        setError('Failed to load post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instagram/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleAddHashtag = () => {
    if (hashtagInput && !hashtags.includes(hashtagInput)) {
      const cleanTag = hashtagInput.replace('#', '').trim();
      if (cleanTag) {
        setHashtags([...hashtags, cleanTag]);
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleSaveDraft = async () => {
    if (!selectedAccountId) {
      setError('Please select an Instagram account');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const updateData = {
        caption,
        hashtags,
        location,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push('/dashboard/posts');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedAccountId) {
      setError('Please select an Instagram account');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setError('Please select date and time for scheduling');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      // First update the post
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption,
          hashtags,
          location,
        }),
      });

      // Then schedule it
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ scheduledFor }),
        }
      );

      if (response.ok) {
        router.push('/dashboard/posts');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to schedule post');
      }
    } catch (err) {
      console.error('Error scheduling post:', err);
      setError('Failed to schedule post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishNow = async () => {
    if (!selectedAccountId) {
      setError('Please select an Instagram account');
      return;
    }

    if (!confirm('Publish this post to Instagram now?')) {
      return;
    }

    setPublishing(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');

      // First update the post
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption,
          hashtags,
          location,
        }),
      });

      // Then publish it
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/publish`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        router.push('/dashboard/posts');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to publish post');
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      setError('Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const captionLength = caption.length + hashtags.reduce((acc, tag) => acc + tag.length + 2, 0);
  const maxCaptionLength = 2200;

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/posts')}
            className="px-6 py-3 bg-primary rounded-lg font-semibold hover:opacity-90"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      {/* Header */}
      <div className="bg-cyber-darker border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Edit Post
              </h1>
              <p className="mt-1 text-sm text-gray-400">Update your Instagram post</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/posts')}
              className="px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Editor */}
          <div className="space-y-6">
            {/* Account selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyber-darker border border-gray-800 rounded-lg p-6"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram Account *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                disabled
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary opacity-50 cursor-not-allowed"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    @{account.username}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Cannot change account for existing posts
              </p>
            </motion.div>

            {/* Caption editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-cyber-darker border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Caption</label>
                <span
                  className={`text-xs ${
                    captionLength > maxCaptionLength ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {captionLength}/{maxCaptionLength}
                </span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Write your caption here..."
              />
            </motion.div>

            {/* Hashtags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-cyber-darker border border-gray-800 rounded-lg p-6"
            >
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
            </motion.div>

            {/* Schedule section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-cyber-darker border border-gray-800 rounded-lg p-6"
            >
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Schedule (Optional)
              </label>
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
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
              >
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <button
                onClick={handleSaveDraft}
                disabled={saving || publishing}
                className="flex-1 px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleSchedule}
                disabled={saving || publishing || !scheduledDate || !scheduledTime}
                className="flex-1 px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule
              </button>
              <button
                onClick={handlePublishNow}
                disabled={saving || publishing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? 'Publishing...' : 'Publish Now'}
              </button>
            </motion.div>
          </div>

          {/* Right column - Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4">Preview</h3>
              <PostPreview
                mediaUrl={uploadedFiles[0]?.url}
                mediaType={
                  uploadedFiles.length > 1
                    ? 'carousel'
                    : uploadedFiles[0]?.type === 'video'
                    ? 'video'
                    : 'image'
                }
                mediaFiles={uploadedFiles}
                caption={caption}
                hashtags={hashtags}
                location={location || undefined}
                username={selectedAccount?.username}
                profilePic={selectedAccount?.profilePicture}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
