"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Instagram, Zap, MessageSquare, MessageCircle, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function AccountsManagerPage() {
      const [replyMode, setReplyMode] = useState<'ai' | 'human'>('ai');
    // Handle all comments for a post
    const handleReplyAllForPost = (postId) => {
      setComments(comments => comments.map(com =>
        com.postId === postId && com.status === 'Open'
          ? {
              ...com,
              status: 'Replied',
              reply: replyMode === 'ai'
                ? { type: 'auto', text: 'Thank you for your comment! (AI)' }
                : { type: 'human', text: 'Thank you for your comment! (Human)' }
            }
          : com
      ));
      runAction(
        replyMode === 'ai'
          ? 'AI replied to all open comments for this post'
          : 'Human replied to all open comments for this post'
      );
    };
  const [activeTab, setActiveTab] = useState('comments');
  // Demo state for comments, DMs, and posts
  // Demo posts and comments
  const postsData = [
    { id: 'p1', title: 'Launch Post', image: '/first.jpg.jpeg' },
    { id: 'p2', title: 'Automation Demo', image: '/second.jpg.png' },
    { id: 'p3', title: 'Milestone', image: '/third.jpg.jpeg' },
  ];
  const [comments, setComments] = useState([
    // Launch Post comments
    { id: 'c1', user: 'john_doe', text: 'Great product! How do I order?', postId: 'p1', time: '2h ago', status: 'Open', reply: null },
    { id: 'c2', user: 'jane_smith', text: 'Congrats on the launch! 🎉', postId: 'p1', time: '1h ago', status: 'Replied', reply: { type: 'auto', text: 'Thank you for your support!' } },
    // Automation Demo comments
    { id: 'c3', user: 'nita_rathore_527', text: 'Clean start. Looking forward to your next update!', postId: 'p2', time: '14m ago', status: 'Replied', reply: { type: 'human', text: 'We appreciate your feedback!' } },
    { id: 'c4', user: 'vexora_labs', text: 'This setup looks clean. What tools are you using?', postId: 'p2', time: '31m ago', status: 'Open', reply: null },
    // Milestone comments
    { id: 'c5', user: 'luminex_fan', text: 'Congrats on 10k followers!', postId: 'p3', time: '10m ago', status: 'Open', reply: null },
  ]);
  const [replyInputs, setReplyInputs] = useState({});
  const [dms, setDms] = useState([]);
  const [posts, setPosts] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedCommentPostId, setSelectedCommentPostId] = useState<string | null>(null);

  const account = {
    profilePicture: "/luminex-logo.png",
    username: "luminex_labs",
    displayName: "luminex_labs",
    followers: 4,
    posts: 3,
    following: 50,
  };

  const runAction = (message: string) => {
    setActionMessage(`${message} • ${new Date().toLocaleTimeString()}`);
  };

  const getCommentsForPost = (postId) => {
    return comments.filter((c) => c.postId === postId);
  };

  const getCommentCountForPost = (postId) => {
    return getCommentsForPost(postId).length;
  };

  const simulateIncomingComment = () => {
    const newComment = {
      id: `c-${Date.now()}`,
      user: "vexora_labs",
      text: "Test comment",
      postId: "p1",
      time: "Just now",
      status: "Open",
      reply: null,
    };
    setComments((items) => [newComment, ...items]);
    runAction("New comment simulated");
  };

  const autoReplyComment = () => {
    setComments((items) =>
      items.map((item) =>
        item.status === "Open" ? { ...item, status: "Replied" } : item
      )
    );
    runAction("Auto-replied to open comments");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Account Manager
            <span className="text-sm px-3 py-1 bg-green-500 text-white rounded-full ml-3">
              LIVE
            </span>
          </h1>
          <p className="text-gray-600">Manage Instagram accounts and automations</p>
        </div>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          onClick={() => runAction("Data synced")}
        >
          <RefreshCw className="w-4 h-4" />
          Sync
        </button>
      </div>

      {/* Action Feedback */}
      {actionMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">LIVE</span>
            <p className="text-sm text-green-800">{actionMessage}</p>
          </div>
        </div>
      )}

      {/* Account Card */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Image
            src={account.profilePicture}
            alt={account.username}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <Instagram className="w-4 h-4" />
              INSTAGRAM • IG
            </p>
            <h2 className="text-xl font-bold">{account.displayName}</h2>
            <p className="text-blue-600 font-semibold">@{account.username}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-right">
            <div>
              <p className="text-xs text-gray-500">Followers</p>
              <p className="text-2xl font-bold">{account.followers}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Posts</p>
              <p className="text-2xl font-bold">{account.posts}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Following</p>
              <p className="text-2xl font-bold">{account.following}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Controls */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold">Automation Features</h3>
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">ACTIVE</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Comment Automation */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Auto Comments
              </span>
              <button className={`px-2 py-1 rounded text-xs font-bold ${activeTab === 'comments' ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('comments')}>
                {activeTab === 'comments' ? 'ON' : 'OFF'}
              </button>
            </div>
            <button className="w-full bg-blue-500 text-white py-2 rounded text-sm mb-2" onClick={simulateIncomingComment}>
              Simulate Comment
            </button>
            <button className="w-full bg-green-500 text-white py-2 rounded text-sm" onClick={autoReplyComment}>
              Auto Reply All
            </button>
          </div>

          {/* DM Automation */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Auto DMs
              </span>
              <button className={`px-2 py-1 rounded text-xs font-bold ${activeTab === 'dms' ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('dms')}>
                {activeTab === 'dms' ? 'ON' : 'OFF'}
              </button>
            </div>
            <button className="w-full bg-blue-500 text-white py-2 rounded text-sm">
              Simulate DM
            </button>
            <button className="w-full bg-green-500 text-white py-2 rounded text-sm">
              Auto Reply All
            </button>
          </div>

          {/* Post Automation */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Auto Posts
              </span>
              <button className={`px-2 py-1 rounded text-xs font-bold ${activeTab === 'posts' ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('posts')}>
                {activeTab === 'posts' ? 'ON' : 'OFF'}
              </button>
            </div>
            <select className="w-full mb-2 p-2 border rounded text-sm">
              <option>Hourly</option>
              <option>Daily</option>
            </select>
            <button className="w-full bg-green-500 text-white py-2 rounded text-sm">
              Post Now
            </button>
          </div>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="border-b mt-8">
        <div className="flex gap-1 overflow-x-auto justify-center">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-indigo-900 mb-3">
                    Instagram Comment Workflow
                  </h3>
                  <div className="grid md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                      <span>New comment posted</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                      <span>Appears instantly</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                      <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                      <span>AI/User reviews</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                      <span>Reply sent</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
                      <span>Live on Instagram</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Total Comments</p>
                <p className="text-3xl font-bold text-blue-900">{comments.length}</p>
                <p className="text-xs text-blue-600 mt-2">All time</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <p className="text-xs font-semibold text-orange-600 uppercase mb-2">Open</p>
                <p className="text-3xl font-bold text-orange-900">{comments.filter(c => c.status === 'Open').length}</p>
                <p className="text-xs text-orange-600 mt-2">Pending reply</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase mb-2">Replied</p>
                <p className="text-3xl font-bold text-green-900">{comments.filter(c => c.status === 'Replied').length}</p>
                <p className="text-xs text-green-600 mt-2">Handled</p>
              </div>
            </div>
          </div>

          {/* Post & Comment List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    Instagram Comments
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Click posts to view comments</p>
                </div>
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm" onClick={simulateIncomingComment}>
                  <MessageSquare className="w-4 h-4" />
                  New Comment
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {postsData.map(post => (
                  <div
                    key={post.id}
                    className={`bg-slate-800 hover:bg-slate-700 p-4 rounded-lg cursor-pointer border ${selectedCommentPostId === post.id ? 'border-cyan-500' : 'hover:border-cyan-500'} transition-all`}
                    onClick={() => setSelectedCommentPostId(post.id)}
                  >
                    <img src={post.image} alt={post.title} className="w-full h-32 object-cover rounded mb-3" />
                    <h4 className="font-semibold mb-2">{post.title}</h4>
                    <p className="text-sm text-slate-400 mb-3">{getCommentCountForPost(post.id)} comments</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {comments.filter(comment => comment.postId === selectedCommentPostId).length === 0 && selectedCommentPostId && (
                  <div className="text-slate-400">No comments for this post.</div>
                )}
                {comments.filter(comment => comment.postId === selectedCommentPostId).map(comment => (
                  <div key={comment.id} className={`p-4 rounded-lg border ${
                    comment.status === 'Open' ? 'border-orange-500 bg-orange-950' : 'border-green-500 bg-green-950'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {comment.user[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">@{comment.user}</span>
                          <span className="text-xs text-slate-400">{comment.time}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        comment.status === 'Replied' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                      }`}>
                        {comment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {selectedCommentPostId && comments.filter(comment => comment.postId === selectedCommentPostId && comment.status === 'Open').length > 0 && (
                  <div className="flex flex-col md:flex-row gap-2 mt-4">
                    <div className="flex gap-2 mb-2 md:mb-0">
                      <button
                        className={`px-4 py-2 rounded font-semibold text-sm border ${replyMode === 'ai' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-600'}`}
                        onClick={() => setReplyMode('ai')}
                      >
                        AI Reply
                      </button>
                      <button
                        className={`px-4 py-2 rounded font-semibold text-sm border ${replyMode === 'human' ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-600'}`}
                        onClick={() => setReplyMode('human')}
                      >
                        Human Reply
                      </button>
                    </div>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-semibold"
                      onClick={() => handleReplyAllForPost(selectedCommentPostId)}
                    >
                      Reply All Comments
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab - Old Demo UI */}
      {activeTab === 'posts' && (
        <div className="p-8 max-w-7xl mx-auto">
          <h1 className="text-2xl font-heading font-bold text-brand-text mb-2">Posts Management</h1>
          <p className="text-sm text-brand-text-secondary mb-6">Demo-only view. Actions are not persisted.</p>
          <div className="card-elevated border-none p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Search posts" className="input-field" />
              <select className="input-field"><option>All Status</option><option>Draft</option><option>Published</option></select>
              <select className="input-field"><option>All Accounts</option><option>luminex_labs</option></select>
              <button className="btn-secondary">Apply Filters</button>
            </div>
          </div>
          <div className="space-y-3">
            {[{ id: 'p1', username: 'luminex_labs', caption: 'Excited to launch our new product!', status: 'Published' }, { id: 'p2', username: 'luminex_labs', caption: 'Automation in action.', status: 'Draft' }].map((item) => (
              <div key={item.id} className="card-elevated border-none p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-text">@{item.username}</p>
                  <p className="text-sm text-brand-text-secondary mt-1">{item.caption}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-brand-light text-brand-text">{item.status}</span>
                  <button className="btn-secondary text-sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Tab - Reply Demo UI */}
      {activeTab === 'comments' && (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {postsData.map(post => {
              const postComments = comments.filter(c => c.postId === post.id);
              return (
                <div key={post.id} className="bg-white rounded-xl border p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <img src={post.image} alt={post.title} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h2 className="font-bold text-lg text-brand-text">{post.title}</h2>
                      <p className="text-xs text-brand-text-secondary">{postComments.length} comments</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-2">
                    {postComments.length === 0 && <p className="text-xs text-brand-text-secondary">No comments yet.</p>}
                    {postComments.map(c => (
                      <div key={c.id} className="border rounded-lg p-3 bg-slate-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-brand-text">@{c.user}</span>
                          <span className="text-xs text-brand-text-secondary">{c.time}</span>
                          <span className={`ml-auto px-2 py-1 text-xs rounded-full ${c.status === 'Open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{c.status}</span>
                        </div>
                        <div className="text-sm text-brand-text-secondary mb-2">{c.text}</div>
                        {c.reply && (
                          <div className="ml-4 p-2 rounded bg-green-50 border border-green-200 text-xs">
                            <span className="font-semibold">{c.reply.type === 'auto' ? 'Auto Reply' : 'Human Reply'}:</span> {c.reply.text}
                          </div>
                        )}
                        {!c.reply && c.status === 'Open' && (
                          <div className="flex flex-col md:flex-row gap-2 mt-2">
                            <input
                              className="input-field flex-1"
                              placeholder="Type a reply..."
                              value={replyInputs[c.id] || ''}
                              onChange={e => setReplyInputs(inputs => ({ ...inputs, [c.id]: e.target.value }))}
                            />
                            <button
                              className="btn-secondary text-xs"
                              onClick={() => {
                                setComments(comments => comments.map(com => com.id === c.id ? { ...com, status: 'Replied', reply: { type: 'human', text: replyInputs[c.id] || 'Thank you!' } } : com));
                                setReplyInputs(inputs => ({ ...inputs, [c.id]: '' }));
                                runAction('Replied manually');
                              }}
                              disabled={!replyInputs[c.id] || replyInputs[c.id].trim() === ''}
                            >Reply</button>
                            <button
                              className="btn-secondary text-xs"
                              onClick={() => {
                                setComments(comments => comments.map(com => com.id === c.id ? { ...com, status: 'Replied', reply: { type: 'auto', text: 'Thank you for your comment!' } } : com));
                                setReplyInputs(inputs => ({ ...inputs, [c.id]: '' }));
                                runAction('Auto replied');
                              }}
                            >Auto Reply</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsManagerPage;
