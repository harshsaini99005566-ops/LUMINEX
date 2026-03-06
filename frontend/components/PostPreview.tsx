'use client';

import { motion } from 'framer-motion';

interface PostPreviewProps {
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'carousel';
  mediaFiles?: Array<{ url: string; type: string }>;
  caption: string;
  hashtags?: string[];
  location?: { name: string };
  username?: string;
  profilePic?: string;
}

export default function PostPreview({
  mediaUrl,
  mediaType = 'image',
  mediaFiles,
  caption,
  hashtags = [],
  location,
  username = 'your_account',
  profilePic,
}: PostPreviewProps) {
  const fullCaption = caption + (hashtags.length > 0 ? '\n\n' + hashtags.join(' ') : '');
  const displayMedia = mediaFiles && mediaFiles.length > 0 ? mediaFiles[0] : { url: mediaUrl, type: mediaType };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
    >
      {/* Instagram-style header */}
      <div className="flex items-center justify-between p-3 bg-cyber-dark border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center overflow-hidden">
            {profilePic ? (
              <img src={profilePic} alt={username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{username}</p>
            {location && (
              <p className="text-xs text-gray-400">{location.name}</p>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Media preview */}
      <div className="relative bg-black aspect-square">
        {displayMedia?.url ? (
          <>
            {displayMedia.type === 'video' || mediaType === 'video' ? (
              <video
                src={`${process.env.NEXT_PUBLIC_API_URL}${displayMedia.url}`}
                className="w-full h-full object-contain"
                controls
                muted
              />
            ) : (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${displayMedia.url}`}
                alt="Post preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Carousel indicator */}
            {mediaFiles && mediaFiles.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded-full text-white text-xs">
                1/{mediaFiles.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-600 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm">Upload media to preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between px-3 py-2 bg-cyber-dark border-b border-gray-800">
        <div className="flex space-x-4">
          <button className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <button className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <button className="text-white hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      {/* Caption */}
      {fullCaption && (
        <div className="px-3 py-3 bg-cyber-dark">
          <p className="text-sm text-white">
            <span className="font-semibold mr-2">{username}</span>
            <span className="text-gray-200 whitespace-pre-wrap break-words">
              {fullCaption}
            </span>
          </p>
        </div>
      )}

      {/* Timestamp preview */}
      <div className="px-3 py-2 bg-cyber-dark">
        <p className="text-xs text-gray-500">Preview - post will appear like this on Instagram</p>
      </div>
    </motion.div>
  );
}
