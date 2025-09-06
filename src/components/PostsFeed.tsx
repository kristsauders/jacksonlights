"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PostItem { id:string; src:string; type:'image'|'video'; alt:string; }

export default function PostsFeed(){
  const [posts,setPosts] = useState<PostItem[]>([]);
  const [error,setError] = useState<string|undefined>();

  useEffect(()=>{
    fetch('/posts.json').then(r=> r.ok ? r.json(): []).then(setPosts).catch(()=>setError('Unable to load posts'));
  },[]);

  if(error) return <div role="alert" className="text-sm text-red-600">{error}</div>;
  if(!posts.length) return <p className="text-sm text-neutral-600 dark:text-neutral-400">No posts yet. Add media files to <code>/public/posts</code> and rebuild.</p>;

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
      {posts.map(p => (
        <motion.div key={p.id} layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 flex flex-col gap-3">
          {p.type==='image' ? (
            <img src={p.src} alt={p.alt} className="rounded-md w-full h-auto object-cover" loading="lazy" />
          ) : (
            <video src={p.src} controls playsInline className="rounded-md w-full h-auto" />
          )}
          <p className="text-xs text-neutral-600 dark:text-neutral-400">{p.alt}</p>
        </motion.div>
      ))}
    </div>
  );
}
