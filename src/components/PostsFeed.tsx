"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { POSTS_KEY, postsFetcher } from '../lib/swr';
import Lightbox from './Lightbox';

interface PostItem {
  id: string;
  src: string;
  type: 'image' | 'video';
  alt: string;
  createdAt?: string;
}

// "Today", "Yesterday", "3 days ago", then "Oct 29" (with the year only once
// it's not this year). Seconds and times of day are noise in a feed.
function friendlyDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

function PostMedia({ post, onOpen }: { post: PostItem; onOpen(): void }) {
  // Photos sit in a letterboxed frame of a fixed maximum height, so a tall
  // phone photo doesn't fill the whole screen. Tap to see it full size.
  if (post.type === 'image') {
    return (
      <button onClick={onOpen} aria-label="View photo full screen" className="focus-ring block w-full rounded-xl bg-black/40 overflow-hidden cursor-zoom-in">
        <img
          src={post.src}
          alt={post.alt}
          loading="lazy"
          decoding="async"
          className="mx-auto w-auto max-w-full h-auto max-h-[60vh] object-contain select-none"
        />
      </button>
    );
  }
  return <PostVideo post={post} />;
}

// The one feed video playing right now, so scrolling between two videos that
// are both on screen never plays them over each other.
let playingVideo: HTMLVideoElement | null = null;

// Pause a video on the feed's behalf, marked so onPause can tell it apart from
// the viewer pressing pause.
function autoPause(v: HTMLVideoElement) {
  if (v.paused) return;
  v.dataset.autoPause = '1';
  v.pause();
}

/**
 * Plays like a social feed: muted and looping while most of it is on screen,
 * paused once it scrolls away. Viewers can unmute with the controls. If they
 * pause it themselves it stays paused until they press play again. Skipped for
 * prefers-reduced-motion and save-data, where it behaves like a normal video.
 */
function PostVideo({ post }: { post: PostItem }) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square' | null>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const pausedByViewer = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ((navigator as any).connection?.saveData) return;

    // Browsers only allow autoplay with sound off. React doesn't reliably set
    // the muted attribute, so set the property directly.
    v.muted = true;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.6) {
        if (v.paused && !pausedByViewer.current) v.play().catch(() => {});
      } else {
        autoPause(v);
      }
    }, { threshold: [0, 0.6] });
    io.observe(v);
    return () => {
      io.disconnect();
      if (playingVideo === v) playingVideo = null;
    };
  }, []);

  const wrapperBase =
    'relative w-full mx-auto transition-all';
  const wrapperClass =
    orientation === 'portrait'
      ? 'max-w-[360px]'
      : orientation === 'square'
        ? 'max-w-[480px]'
        : 'max-w-[760px]';

  return (
    <div className="rounded-xl bg-black/40">
      <div className={`${wrapperBase} ${wrapperClass}`}>
        <video
          ref={ref}
          key={post.src}
          className="rounded-xl w-full h-auto max-h-[60vh] object-contain bg-black"
          src={post.src}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          controlsList="nodownload"
          onPlay={(e) => {
            const v = e.currentTarget;
            pausedByViewer.current = false;
            if (playingVideo && playingVideo !== v) autoPause(playingVideo);
            playingVideo = v;
          }}
          onPause={(e) => {
            const v = e.currentTarget;
            if (v.dataset.autoPause) delete v.dataset.autoPause;
            else pausedByViewer.current = true;
            if (playingVideo === v) playingVideo = null;
          }}
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
    </div>
  );
}

export default function PostsFeed() {
  const { data: posts, error, isLoading } = useSWR<PostItem[]>(POSTS_KEY, postsFetcher);
  const [viewing, setViewing] = useState<number | null>(null);
  const photos = useMemo(() => (posts ?? []).filter((p) => p.type === 'image'), [posts]);

  if (error && !posts) {
    return (
      <div role="alert" className="meta-text">
        Updates couldn’t load. Please try again in a moment.
      </div>
    );
  }
  if (isLoading && !posts) {
    return <p className="meta-text">Loading updates…</p>;
  }
  if (!posts?.length) {
    return (
      <p className="meta-text">
        No updates yet. Check back soon!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((p) => (
        <motion.article
          key={p.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface p-4 sm:p-5 flex flex-col gap-3"
        >
          <div className="space-y-1 px-0.5">
            {p.createdAt && (
              <time dateTime={p.createdAt} title={new Date(p.createdAt).toLocaleString()} className="meta-text block">
                {friendlyDate(p.createdAt)}
              </time>
            )}
            {p.alt && <p className="text-[15px] sm:text-base leading-relaxed text-neutral-900 dark:text-white whitespace-pre-wrap break-words">{p.alt}</p>}
          </div>
          <PostMedia post={p} onOpen={() => setViewing(photos.indexOf(p))} />
        </motion.article>
      ))}
      <Lightbox images={photos} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />
    </div>
  );
}
