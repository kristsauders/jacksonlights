"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface GalleryImage { src: string; alt: string; }

// We'll fetch the list of images from a JSON generated at build time (see /public/gallery.json)
async function fetchImages(): Promise<GalleryImage[]> {
  const res = await fetch('/gallery.json');
  if (!res.ok) return [];
  return res.json();
}

export default function PhotoCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchImages().then(list => { setImages(list); setLoaded(true); });
  }, []);

  if (!loaded) return <div className="text-sm animate-pulse">Loading photos…</div>;
  if (!images.length) return <div className="text-sm">Add images to the <code>/public/photos</code> folder to populate the gallery.</div>;
  return (
    <div className="grid gap-4" aria-label="Photo gallery feed">
      {images.map((img,i)=>(
        <motion.figure key={img.src} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.4, delay: i*0.03}} className="rounded-xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-900">
          <div className="relative aspect-video">
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 800px" />
          </div>
        </motion.figure>
      ))}
    </div>
  );
}
