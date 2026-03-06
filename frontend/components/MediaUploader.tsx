'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
  order?: number;
}

interface MediaUploaderProps {
  onUpload: (files: MediaFile[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
}

export default function MediaUploader({
  onUpload,
  onError,
  maxFiles = 1,
  acceptedTypes = 'image/*,video/*',
  maxSize = 100 * 1024 * 1024, // 100MB default
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
        onError?.(`File ${file.name} exceeds ${sizeMB}MB limit`);
        return;
      }
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const endpoint = maxFiles === 1
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/posts/upload`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/posts/upload-multiple`;

      const formData = new FormData();
      if (maxFiles === 1) {
        formData.append('media', files[0]);
      } else {
        files.forEach((file) => {
          formData.append('media', file);
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      const newFiles = maxFiles === 1
        ? [data as MediaFile]
        : (data.mediaFiles as MediaFile[]);

      setUploadedFiles(newFiles);
      onUpload(newFiles);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {uploadedFiles.length < maxFiles && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes}
            multiple={maxFiles > 1}
            onChange={handleChange}
            disabled={uploading}
          />

          <div className="space-y-4">
            {uploading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <svg
                    className="w-16 h-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-base text-gray-300 mb-2">
                    Drag and drop {maxFiles > 1 ? `up to ${maxFiles} files` : 'a file'} here
                  </p>
                  <p className="text-sm text-gray-500 mb-3">or</p>
                  <button
                    onClick={handleButtonClick}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Supported: Images (JPG, PNG, GIF) and Videos (MP4, MOV)
                  <br />
                  Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB per file
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Uploaded Files Preview */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-lg overflow-hidden border border-gray-700 bg-gray-800"
              >
                {/* Preview */}
                <div className="aspect-square">
                  {file.type === 'image' ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${file.url}`}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}${file.url}`}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* File Info */}
                <div className="p-3 bg-gray-900/50">
                  <p className="text-xs text-gray-400 truncate">{file.filename}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
