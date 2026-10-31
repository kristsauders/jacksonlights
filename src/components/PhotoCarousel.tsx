"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Lightbox from './Lightbox';

interface GalleryImage { src: string; alt: string; }

// We'll fetch the list of images from a JSON generated at build time (see /public/gallery.json)
async function fetchImages(): Promise<GalleryImage[]> {
  const res = await fetch('/gallery.json');
  if (!res.ok) return [];
  return res.json();
}

/** Photo grid; tapping a photo opens it full screen. */
export default function PhotoCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);

  useEffect(() => {
    fetchImages().then(list => { setImages(list); setLoaded(true); });
  }, []);

  if (!loaded) return <div className="meta-text animate-pulse">Loading photos…</div>;
  if (!images.length) return null;
  return (
    <>
      {/* A third column only once there are enough photos to fill it. */}
      <ul className={`grid grid-cols-2 gap-3 sm:gap-4 ${images.length > 4 ? 'lg:grid-cols-3' : ''}`} aria-label="Photos">
        {images.map((img, i) => (
          <motion.li key={img.src} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.03 }}>
            <button onClick={() => setViewing(i)} aria-label={`View photo${img.alt ? `: ${img.alt}` : ''} full screen`} className="focus-ring group relative block w-full aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 cursor-zoom-in">
              <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:1024px) 50vw, 380px" />
            </button>
          </motion.li>
        ))}
      </ul>
      <Lightbox images={images} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />
    </>
  );
}
