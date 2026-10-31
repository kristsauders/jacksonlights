"use client";
import { useEffect, useRef } from 'react';

export interface LightboxImage { src: string; alt: string; }

/**
 * Full-screen photo viewer shared by the gallery and the posts feed. Built on
 * a native <dialog> so Escape, focus trapping and the backdrop come from the
 * browser. Left/right arrow keys and the on-screen buttons step through the
 * set; clicking the dark area around the photo closes it.
 */
export default function Lightbox({ images, index, onIndex, onClose }: {
  images: LightboxImage[];
  index: number | null;
  onIndex(i: number): void;
  onClose(): void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null && !!images[index];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (index === null || images.length < 2) return;
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onIndex]);

  const img = open ? images[index!] : null;
  const many = images.length > 1;
  const navButton = 'focus-ring absolute top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-label={img?.alt || 'Photo'}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/95"
    >
      {img && (
        <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt} className="max-h-[85dvh] max-w-full rounded-xl object-contain" />
          {img.alt && <p className="max-w-2xl text-center text-sm text-white/80">{img.alt}</p>}
          <button onClick={onClose} aria-label="Close photo" className="focus-ring absolute right-3 top-3 rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          {many && (
            <>
              <button onClick={() => onIndex((index! - 1 + images.length) % images.length)} aria-label="Previous photo" className={`${navButton} left-3`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button onClick={() => onIndex((index! + 1) % images.length)} aria-label="Next photo" className={`${navButton} right-3`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
