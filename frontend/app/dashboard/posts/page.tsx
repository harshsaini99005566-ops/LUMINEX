'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ScheduledPost, PostFilters, InstagramAccount } from '@/types';

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PostFilters>({
    page: 1,
    limit: 20,
  });
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch Instagram accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [filters, selectedAccount, selectedStatus]);

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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Build query params
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedAccount !== 'all') params.append('instagramAccountId', selectedAccount);
      params.append('page', filters.page?.toString() || '1');
      params.append('limit', filters.limit?.toString() || '20');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setTotalPosts(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (!confirm('Publish this post now?')) return;

    try {
      const token = localStorage.getItem('authToken');
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
        fetchPosts();
      }
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  const handleCancelSchedule = async (postId: string) => {
    if (!confirm('Cancel scheduled post?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error canceling post:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      publishing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      published: 'bg-green-500/20 text-green-300 border-green-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.draft
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMediaPreview = (post: ScheduledPost) => {
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      return `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrls[0]}`;
    }
    if (post.mediaUrl) {
      return `${process.env.NEXT_PUBLIC_API_URL}${post.mediaUrl}`;
    }
    return null;
  };

  const totalPages = Math.ceil(totalPosts / (filters.limit || 20));

  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      {/* Header */}
      <div className="bg-cyber-darker border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Posts Management
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage your Instagram posts and schedules
              </p>
            </div>
            <Link
              href="/dashboard/posts/create"
              className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              + Create Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Account filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                @{account.username}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="publishing">Publishing</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>

          {/* View mode toggle */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-cyber-darker text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-cyber-darker text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Posts grid/list */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 bg-cyber-darker rounded-lg border border-gray-800">
            <svg
              className="w-16 h-16 mx-auto text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-6">Create your first Instagram post to get started</p>
            <Link
              href="/dashboard/posts/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Create Post
            </Link>
          </div>
        )}

        {!loading && posts.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyber-darker border border-gray-800 rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Media preview */}
                <div className="relative aspect-square bg-black">
                  {getMediaPreview(post) ? (
                    <>
                      {post.mediaType === 'video' ? (
                        <video
                          src={getMediaPreview(post)!}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={getMediaPreview(post)!}
                          alt="Post preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {post.mediaType === 'carousel' && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded-full text-white text-xs">
                          {post.mediaUrls?.length || 0} photos
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Post details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(post.status)}
                    {post.scheduledFor && post.status === 'scheduled' && (
                      <span className="text-xs text-gray-400">
                        {new Date(post.scheduledFor).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-3 mb-4">
                    {post.caption || 'No caption'}
                  </p>

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.hashtags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs text-primary">
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{post.hashtags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {post.errorMessage && (
                    <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
                      {post.errorMessage}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {post.status === 'published' && post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors text-center"
                      >
                        View on IG
                      </a>
                    )}

                    {(post.status === 'draft' || post.status === 'scheduled') && (
                      <>
                        <Link
                          href={`/dashboard/posts/edit/${post._id}`}
                          className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors text-center"
                        >
                          Edit
                        </Link>
                        {post.status !== 'scheduled' && (
                          <button
                            onClick={() => handlePublishNow(post._id)}
                            className="flex-1 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        {post.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelSchedule(post._id)}
                            className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}

                    {post.status === 'failed' && (
                      <button
                        onClick={() => handlePublishNow(post._id)}
                        className="flex-1 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                      >
                        Retry
                      </button>
                    )}

                    {post.status !== 'published' && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() =>
                setFilters({ ...filters, page: Math.min(totalPages, (filters.page || 1) + 1) })
              }
              disabled={filters.page === totalPages}
              className="px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
