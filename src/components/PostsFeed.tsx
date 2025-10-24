"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PostItem {
  id: string;
  src: string;
  type: 'image' | 'video';
  alt: string;
  createdAt?: string;
}

function PostMedia({ post }: { post: PostItem }) {
  if (post.type === 'image') {
    return (
      <img
        src={post.src}
        alt={post.alt}
        loading="lazy"
        className="rounded-md w-full h-auto object-cover max-h-[80vh] select-none"
      />
    );
  }

  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square' | null>(null);

  const isMov = post.src.toLowerCase().endsWith('.mov');
  const wrapperBase =
    'relative w-full mx-auto transition-all';
  const wrapperClass =
    orientation === 'portrait'
      ? 'max-w-[430px]'
      : orientation === 'square'
        ? 'max-w-[560px]'
        : 'max-w-[760px]';

  return (
    <div className={`${wrapperBase} ${wrapperClass}`}>
      <video
        key={post.src}
        className="rounded-md w-full h-auto max-h-[75vh] object-contain bg-black shadow-inner"
        src={post.src}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
            const w = v.videoWidth;
            const h = v.videoHeight;
          if (w && h) {
            if (w === h) setOrientation('square');
            else if (w > h) setOrientation('landscape');
            else setOrientation('portrait');
          }
        }}
      >
        <p className="text-xs p-2">
          Your browser can’t play this video.
        </p>
      </video>
    </div>
  );
}

export default function PostsFeed() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    fetch('/posts.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PostItem[]) => {
        const sorted = [...data].sort((a, b) => {
          const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
          return bd - ad;
        });
        setPosts(sorted);
      })
      .catch(() => setError('Unable to load posts'));
  }, []);

  if (error) {
    return (
      <div role="alert" className="text-sm text-red-600">
        {error}
      </div>
    );
  }
  if (!posts.length) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        No posts yet. Upload media in the Admin tab.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((p) => (
        <motion.div
          key={p.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-4 flex flex-col gap-3"
        >
          <PostMedia post={p} />
          <div className="flex flex-wrap items-start gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="whitespace-pre-wrap break-words flex-1 min-w-[60%]">
              {p.alt || 'Untitled'}
            </span>
            {p.createdAt && (
              <span className="text-[10px] text-neutral-400 tabular-nums">
                {new Date(p.createdAt).toLocaleString()}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
