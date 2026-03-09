'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Image as ImageIcon, MessageCircle, RefreshCcw, Send, Zap, Upload, X, Check } from 'lucide-react'

type CommentItem = {
  id: string
  user: string
  text: string
  status: 'Open' | 'Processing' | 'Replied'
  receivedAt?: string
}

type PostItem = {
  id: string
  title: string
  likes: number
  comments: number
}

type DmItem = {
  id: string
  user: string
  message: string
  unread: boolean
}

type ThreadComment = {
  id: string
  user: string
  text: string
  reply?: string
  replySource?: 'AI' | 'Manual'
  receivedAt?: string
}

export default function InstagramAccountPage() {
  const [actionMessage, setActionMessage] = useState('Instagram manager ready.')
  const [commentReply, setCommentReply] = useState('Thanks for your comment! Please check DM for details.')
  const [postCaption, setPostCaption] = useState('New update from Luminex Labs. Stay tuned! 🚀')
  const [autoDmReply, setAutoDmReply] = useState('Hi! Thanks for messaging us. We will share details shortly.')
  const [autoDmEnabled, setAutoDmEnabled] = useState(true)
  const [externalUser, setExternalUser] = useState('new_customer_01')
  const [externalCommentText, setExternalCommentText] = useState('Is this available in India?')
  const [dashboardReply, setDashboardReply] = useState('Yes, available in India. Please check your DM for details.')
  const [selectedCommentId, setSelectedCommentId] = useState<string>('')
  const [isLiveIncoming, setIsLiveIncoming] = useState(false)
  const [isAiAutoHandleEnabled, setIsAiAutoHandleEnabled] = useState(true)
  const [latestIncomingId, setLatestIncomingId] = useState<string>('')
  
  // Post upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadSection, setShowUploadSection] = useState(false)

  const [comments, setComments] = useState<CommentItem[]>([
    { id: 'ig-c1', user: 'designbyravi', text: 'Price please?', status: 'Open' },
    { id: 'ig-c2', user: 'sara.social', text: 'How to order?', status: 'Replied' },
  ])

  const [posts, setPosts] = useState<PostItem[]>([
    { id: 'ig-p1', title: 'Reel: Product Launch', likes: 1240, comments: 89 },
    { id: 'ig-p2', title: 'Carousel: New Features', likes: 980, comments: 41 },
  ])

  const [dms, setDms] = useState<DmItem[]>([
    { id: 'ig-d1', user: 'vivek.fit', message: 'Can you share package details?', unread: true },
    { id: 'ig-d2', user: 'jenny.store', message: 'Thanks for the quick help!', unread: false },
  ])

  const [dashboardComments, setDashboardComments] = useState<CommentItem[]>([
    { id: 'flow-c1', user: 'rahul.viewer', text: 'What is the price?', status: 'Open', receivedAt: 'Just now' },
  ])

  const [instagramThread, setInstagramThread] = useState<ThreadComment[]>([
    { id: 'flow-c1', user: 'rahul.viewer', text: 'What is the price?', receivedAt: 'Just now' },
  ])

  const account = {
    username: 'luminex_labs',
    displayName: 'Luminex Labs',
    followers: 18420,
    posts: 312,
    connectedSince: '2026-02-10',
    status: 'Connected',
    profilePicture: '/luminex-logo.png',
  }

  const runAction = (message: string) => {
    setActionMessage(`${message} • ${new Date().toLocaleTimeString()}`)
  }

  const generateAiReply = (text: string) => {
    const normalized = text.toLowerCase()

    if (normalized.includes('price') || normalized.includes('pricing') || normalized.includes('cost')) {
      return 'Thanks for your interest 🙌 Pricing details are available now. Please check your DM for the full package options.'
    }
    if (normalized.includes('order') || normalized.includes('buy')) {
      return 'Great! You can place an order directly from our link in bio. We also sent quick steps in your DM.'
    }
    if (normalized.includes('india') || normalized.includes('delivery') || normalized.includes('ship')) {
      return 'Yes, we support delivery in India ✅ We have also shared expected timelines in your DM.'
    }

    return 'Thank you for your comment! Our AI assistant has reviewed it and shared full support details in your DM.'
  }

  const incomingUsers = ['alex.store', 'maria.creates', 'rajesh.growth', 'nina.brand', 'samdigital']
  const incomingTexts = [
    'Can you share pricing?',
    'Do you have delivery this week?',
    'How can I place an order?',
    'Is this available in black color?',
    'Please send details in DM.',
  ]

  const addIncomingComment = (user: string, text: string) => {
    const newId = `flow-${Date.now()}`
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newDashboardComment: CommentItem = {
      id: newId,
      user,
      text,
      status: 'Open',
      receivedAt: now,
    }

    setDashboardComments((items) => [newDashboardComment, ...items])
    setInstagramThread((items) => [{ id: newId, user, text, receivedAt: now }, ...items])
    setSelectedCommentId(newId)
    setLatestIncomingId(newId)
    runAction(`New Instagram comment received from @${user}`)
  }

  const addExternalComment = () => {
    if (!externalUser.trim() || !externalCommentText.trim()) return
    addIncomingComment(externalUser.trim(), externalCommentText.trim())
  }

  useEffect(() => {
    if (!isLiveIncoming) return

    const timers: NodeJS.Timeout[] = []

    // Comment 1: after 5 seconds
    const timer1 = setTimeout(() => {
      const user = incomingUsers[0] // alex.store
      const text = incomingTexts[0] // 'Can you share pricing?'
      addIncomingComment(user, text)
    }, 5000)

    // Comment 2: after 5 + 10 = 15 seconds
    const timer2 = setTimeout(() => {
      const user = incomingUsers[1] // maria.creates
      const text = incomingTexts[1] // 'Do you have delivery this week?'
      addIncomingComment(user, text)
    }, 15000)

    // Comment 3: after 5 + 10 + 6 = 21 seconds
    const timer3 = setTimeout(() => {
      const user = incomingUsers[2] // rajesh.growth
      const text = incomingTexts[2] // 'How can I place an order?'
      addIncomingComment(user, text)
    }, 21000)

    timers.push(timer1, timer2, timer3)

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [isLiveIncoming])

  const sendDashboardReply = () => {
    if (!selectedCommentId || !dashboardReply.trim()) return

    setDashboardComments((items) =>
      items.map((item) => (item.id === selectedCommentId ? { ...item, status: 'Replied' } : item))
    )

    setInstagramThread((items) =>
      items.map((item) => (item.id === selectedCommentId ? { ...item, reply: dashboardReply.trim(), replySource: 'Manual' } : item))
    )

    const comment = dashboardComments.find((item) => item.id === selectedCommentId)
    runAction(`Reply sent from SaaS to @${comment?.user || 'user'} and synced to Instagram`) 
  }

  useEffect(() => {
    if (!isAiAutoHandleEnabled) return

    const pending = dashboardComments.find((comment) => comment.status === 'Open')
    if (!pending) return

    setDashboardComments((items) =>
      items.map((item) => (item.id === pending.id ? { ...item, status: 'Processing' } : item))
    )
    runAction(`AI is processing @${pending.user}'s comment`)

    const timer = setTimeout(() => {
      const aiReply = generateAiReply(pending.text)

      setDashboardComments((items) =>
        items.map((item) => (item.id === pending.id ? { ...item, status: 'Replied' } : item))
      )
      setInstagramThread((items) =>
        items.map((item) => (item.id === pending.id ? { ...item, reply: aiReply, replySource: 'AI' } : item))
      )
      runAction(`AI auto-replied to @${pending.user}`)
    }, 2500)

    return () => clearTimeout(timer)
  }, [dashboardComments, isAiAutoHandleEnabled])

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 20
      })
    }, 200)

    // Process uploaded files
    setTimeout(() => {
      const newImages: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            if (newImages.length === files.length) {
              setUploadedImages([...uploadedImages, ...newImages])
              setIsUploading(false)
              setUploadProgress(0)
              runAction(`${files.length} image(s) uploaded successfully`)
            }
          }
        }
        reader.readAsDataURL(file)
      }
    }, 1000)
  }

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
    runAction('Image removed from upload')
  }

  // Publish post with images
  const publishPostWithImages = () => {
    if (uploadedImages.length === 0 && !postCaption.trim()) {
      runAction('Please add at least an image or caption')
      return
    }

    const newPost: PostItem = {
      id: `ig-${Date.now()}`,
      title: postCaption.slice(0, 50) || `Post with ${uploadedImages.length} image(s)`,
      likes: 0,
      comments: 0,
    }

    setPosts([newPost, ...posts])
    setUploadedImages([])
    setPostCaption('New update from Luminex Labs. Stay tuned! 🚀')
    setShowUploadSection(false)
    runAction(`Post published successfully with ${uploadedImages.length} image(s)`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/accounts-manager" className="text-sm text-brand-primary hover:underline">
            ← Back to Social Accounts
          </Link>
          <h1 className="text-3xl font-heading font-bold text-brand-text mt-2">Instagram Account Page</h1>
          <p className="text-brand-text-secondary">Dedicated page for Instagram account management.</p>
        </div>
        <button className="btn-secondary inline-flex items-center gap-2" onClick={() => runAction('Instagram data synced')}>
          <RefreshCcw className="w-4 h-4" />
          Sync Instagram Data
        </button>
      </div>

      <div className="card-elevated border-none bg-brand-primary-50">
        <p className="text-sm font-medium text-brand-primary">{actionMessage}</p>
      </div>

      <div className="card-elevated border-none">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-brand-text">Live Comment + AI Auto Handle</p>
            <p className="text-xs text-brand-text-secondary mt-1">
              Incoming Instagram comments are monitored live and processed automatically by AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={isLiveIncoming ? 'btn-primary text-xs px-3 py-2' : 'btn-secondary text-xs px-3 py-2'}
              onClick={() => {
                setIsLiveIncoming((value) => !value)
                runAction(isLiveIncoming ? 'Live incoming stopped' : 'Live incoming started')
              }}
            >
              {isLiveIncoming ? 'Live ON' : 'Live OFF'}
            </button>
            <button
              className={isAiAutoHandleEnabled ? 'btn-primary text-xs px-3 py-2' : 'btn-secondary text-xs px-3 py-2'}
              onClick={() => {
                setIsAiAutoHandleEnabled((value) => !value)
                runAction(isAiAutoHandleEnabled ? 'AI auto handle disabled' : 'AI auto handle enabled')
              }}
            >
              {isAiAutoHandleEnabled ? 'AI AUTO ON' : 'AI AUTO OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-elevated border-none">
        <div className="flex items-center gap-4">
          <img src={account.profilePicture} alt={account.username} className="w-16 h-16 rounded-full border border-brand-border" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-primary mb-1">INSTAGRAM ACCOUNT • IG</p>
            <p className="text-xl font-heading font-bold text-brand-text">{account.displayName}</p>
            <p className="text-brand-primary">@{account.username}</p>
            <p className="text-sm text-brand-text-secondary mt-1">Connected since {account.connectedSince}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-right">
            <div>
              <p className="text-xs text-brand-text-secondary">Followers</p>
              <p className="font-bold text-brand-text">{account.followers.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary">Posts</p>
              <p className="font-bold text-brand-text">{account.posts}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary">Status</p>
              <p className="font-bold text-brand-success">{account.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-elevated border-none p-5 space-y-3">
          <p className="inline-flex items-center gap-2 text-brand-primary font-semibold">
            <MessageSquare className="w-4 h-4" /> Comments
          </p>
          <textarea
            value={commentReply}
            onChange={(event) => setCommentReply(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
          />
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 rounded-lg bg-brand-light-2 border border-brand-border">
              <p className="text-sm font-semibold text-brand-text">@{comment.user}</p>
              <p className="text-xs text-brand-text-secondary mt-1">{comment.text}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn-secondary text-xs px-2 py-1"
                  onClick={() => {
                    setComments((items) => items.map((item) => (item.id === comment.id ? { ...item, status: 'Replied' } : item)))
                    runAction(`Replied to @${comment.user}`)
                  }}
                >
                  Reply
                </button>
                <button className="btn-secondary text-xs px-2 py-1" onClick={() => runAction(`Rule assigned for @${comment.user}`)}>
                  Rule
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-elevated border-none p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-brand-primary font-semibold">
              <ImageIcon className="w-4 h-4" /> Create Post
            </p>
            <button
              onClick={() => setShowUploadSection(!showUploadSection)}
              className="btn-primary text-xs px-3 py-1 inline-flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              {showUploadSection ? 'Hide' : 'Upload'}
            </button>
          </div>

          {showUploadSection && (
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-text">Upload Images</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      isUploading
                        ? 'border-purple-400 bg-purple-100'
                        : 'border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400'
                    }`}
                  >
                    {isUploading ? (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-purple-600 animate-bounce mx-auto mb-2" />
                        <p className="text-sm font-semibold text-purple-600">Uploading... {uploadProgress}%</p>
                        <div className="w-32 h-2 bg-purple-200 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-brand-text">Click to upload images</p>
                        <p className="text-xs text-brand-text-secondary mt-1">PNG, JPG up to 10MB (multiple)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Image Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-brand-text">
                    Preview ({uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-purple-300"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && uploadedImages.length > 1 && (
                          <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded-full">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caption Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-text">Caption</label>
                <textarea
                  value={postCaption}
                  onChange={(event) => setPostCaption(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-2 border-purple-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Write your post caption... Add hashtags and mentions"
                />
                <p className="text-xs text-brand-text-secondary">{postCaption.length} characters</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={publishPostWithImages}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2"
                  disabled={uploadedImages.length === 0 && !postCaption.trim()}
                >
                  <Check className="w-4 h-4" />
                  Publish Now
                </button>
                <button
                  onClick={() => {
                    setShowUploadSection(false)
                    setUploadedImages([])
                    runAction('Post creation cancelled')
                  }}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Recent Posts List */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-text-secondary uppercase">Recent Posts</p>
            {posts.length === 0 ? (
              <p className="text-xs text-center text-brand-text-secondary py-4">No posts yet. Create your first post!</p>
            ) : (
              posts.slice(0, 3).map((post) => (
                <div key={post.id} className="p-3 rounded-lg bg-brand-light-2 border border-brand-border hover:border-brand-primary transition-colors">
                  <p className="text-sm font-semibold text-brand-text">{post.title}</p>
                  <p className="text-xs text-brand-text-secondary mt-1">
                    ❤️ {post.likes} • 💬 {post.comments}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-elevated border-none p-5 space-y-3">
          <p className="inline-flex items-center gap-2 text-brand-primary font-semibold">
            <MessageCircle className="w-4 h-4" /> Auto DM
          </p>
          <div className="flex items-center justify-between p-2 rounded-lg bg-brand-light-2 border border-brand-border">
            <p className="text-sm text-brand-text-secondary">Auto DM Status</p>
            <button
              className={autoDmEnabled ? 'btn-primary text-xs px-2 py-1' : 'btn-secondary text-xs px-2 py-1'}
              onClick={() => {
                setAutoDmEnabled((value) => !value)
                runAction(`Instagram Auto DM ${autoDmEnabled ? 'disabled' : 'enabled'}`)
              }}
            >
              {autoDmEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <textarea
            value={autoDmReply}
            onChange={(event) => setAutoDmReply(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
          />
          <button className="btn-secondary text-xs px-2 py-1 inline-flex items-center gap-1" onClick={() => runAction('Instagram Auto DM template saved')}>
            <Zap className="w-3 h-3" /> Save Auto DM Template
          </button>
          {dms.map((dm) => (
            <div key={dm.id} className="p-3 rounded-lg bg-brand-light-2 border border-brand-border">
              <p className="text-sm font-semibold text-brand-text">@{dm.user}</p>
              <p className="text-xs text-brand-text-secondary mt-1">{dm.message}</p>
              <button
                className="btn-secondary text-xs px-2 py-1 mt-2 inline-flex items-center gap-1"
                onClick={() => {
                  setDms((items) => items.map((item) => (item.id === dm.id ? { ...item, unread: false } : item)))
                  runAction(`Auto DM sent to @${dm.user}`)
                }}
              >
                <Send className="w-3 h-3" /> Send Auto DM
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated border-none">
        <h3 className="text-base font-heading font-bold text-brand-text">Working Flow: Comment Management</h3>
        <div className="mt-2 text-sm text-brand-text-secondary space-y-1">
          <p>4️⃣ Open comment management page</p>
          <p>5️⃣ Add a comment from Instagram (from another account)</p>
          <p>6️⃣ Comment appears in your SaaS dashboard</p>
          <p>7️⃣ Send reply from SaaS</p>
          <p>8️⃣ Reply appears on Instagram post</p>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-brand-light-2 border border-brand-border space-y-3">
            <p className="text-sm font-semibold text-brand-primary">Instagram Side (External Comment)</p>
            <p className="text-xs text-brand-text-secondary">Real-time monitoring (refreshes every ~8s)</p>
            <input
              value={externalUser}
              onChange={(event) => setExternalUser(event.target.value)}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
              placeholder="Instagram username"
            />
            <textarea
              value={externalCommentText}
              onChange={(event) => setExternalCommentText(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
              placeholder="Write a new Instagram comment"
            />
          </div>

          <div className="p-4 rounded-lg bg-brand-light-2 border border-brand-border space-y-3">
            <p className="text-sm font-semibold text-brand-primary">SaaS Dashboard (Incoming Comments)</p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {dashboardComments.map((comment) => (
                <button
                  key={comment.id}
                  onClick={() => setSelectedCommentId(comment.id)}
                  className={`w-full text-left p-3 rounded-lg border ${selectedCommentId === comment.id ? 'border-brand-primary bg-brand-primary-50' : 'border-brand-border bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-brand-text">@{comment.user}</p>
                    <div className="flex items-center gap-2">
                      {comment.id === latestIncomingId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary text-white">NEW</span>}
                      <span className="text-[11px] text-brand-text-secondary">{comment.receivedAt}</span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-text-secondary mt-1">{comment.text}</p>
                  <p className="text-xs mt-1 text-brand-primary">Status: {comment.status === 'Processing' ? 'AI Processing...' : comment.status}</p>
                </button>
              ))}
            </div>

            <textarea
              value={dashboardReply}
              onChange={(event) => setDashboardReply(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
              placeholder="Reply from SaaS dashboard"
            />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-brand-light-2 border border-brand-border">
          <p className="text-sm font-semibold text-brand-primary mb-2">Instagram Post Thread (Reply Sync Preview)</p>
          <div className="space-y-3 max-h-64 overflow-auto">
            {instagramThread.map((comment) => (
              <div key={comment.id} className="p-3 rounded-lg bg-white border border-brand-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-text">@{comment.user}</p>
                  <span className="text-[11px] text-brand-text-secondary">{comment.receivedAt}</span>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1">{comment.text}</p>
                {comment.reply && (
                  <div className="mt-2 ml-4 p-2 rounded-md bg-brand-primary-50 border border-brand-primary-100">
                    <p className="text-xs font-semibold text-brand-primary inline-flex items-center gap-2">
                      @luminex_labs
                      {comment.replySource === 'AI' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary text-white">AI</span>}
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-1">{comment.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
