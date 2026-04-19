"use client";

import { X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export function PostPreviewModal({ 
  post, 
  onClose 
}: { 
  post: { 
    title: string; 
    authorUsername: string; 
    content: string; 
    createdAt: Date;
    coverImageUrl?: string | null;
    mediaUrls?: { url: string; type: string }[] | null;
  } | null;
  onClose: () => void;
}) {
  if (!post) return null;

  return (
    <div className="admin-centered-modal-overlay" onClick={onClose}>
      <div
        className="admin-preview-modal-content animate-slide-up max-w-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header p-6 border-b border-light flex justify-between items-start">
          <div>
            <h2 className="admin-modal-title mb-2">{post.title}</h2>
            <p className="m-0 text-[0.875rem] text-tertiary">
              By @{post.authorUsername} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={24} />
          </button>
        </div>
        
        <div className="admin-preview-modal-body p-0 overflow-y-auto max-h-[70vh]">
          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="w-full aspect-video relative border-b border-light bg-black">
              <Image 
                src={post.coverImageUrl} 
                alt="Cover" 
                fill 
                className="object-contain" 
                unoptimized
              />
            </div>
          )}

          {/* Media Gallery */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="p-6 border-b border-light bg-accent-soft/30">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <ImageIcon size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Attachment Gallery ({post.mediaUrls.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {post.mediaUrls
                  .filter(item => item.type === "image" && item.url)
                  .map((item, i) => (
                  <div key={i} className="aspect-square relative rounded-md overflow-hidden border border-border-color bg-card shadow-sm hover:ring-2 hover:ring-accent transition-all">
                    <Image 
                      src={item.url} 
                      alt={`Attachment ${i+1}`} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div 
            className="p-8 rich-text-content leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </div>
  );
}
