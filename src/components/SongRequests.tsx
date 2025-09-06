"use client";
import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Idea { id:string; title:string; votes:number; createdAt:string; }
const fetcher = (url:string)=> fetch(url).then(r=>r.json());

export default function SongRequests(){
  const { data, mutate, isLoading } = useSWR('/api/song-ideas', fetcher, { refreshInterval: 20000 });
  const ideas: Idea[] = data?.ideas || [];
  const [title,setTitle] = useState('');
  const [filter,setFilter] = useState('');
  const [submitting,setSubmitting] = useState(false);
  const [sort,setSort] = useState<'top'|'new'>('top');

  const filtered = useMemo(()=>{
    const base = [...ideas];
    if (sort==='top') base.sort((a,b)=> b.votes - a.votes || a.title.localeCompare(b.title));
    else base.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
    const f = filter.trim().toLowerCase();
    return f? base.filter(i=> i.title.toLowerCase().includes(f)) : base;
  }, [ideas, filter, sort]);

  async function addIdea(e:React.FormEvent){
    e.preventDefault();
    const val = title.trim();
    if (val.length < 2) return;
    setSubmitting(true);
    try {
      await fetch('/api/song-ideas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: val }) });
      setTitle('');
      mutate();
    } finally { setSubmitting(false); }
  }

  async function vote(id:string){
    await fetch('/api/song-ideas', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    mutate();
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-red via-brand-gold to-brand-green bg-clip-text text-transparent">Suggest Songs For Next Year</h3>
        <p className="text-sm md:text-base max-w-2xl mx-auto text-neutral-700 dark:text-neutral-300">Drop ideas for tracks you&apos;d love to see sequenced next season. Upvote others you like. Higher vote counts help prioritize sequencing time.</p>
      </div>
      <form onSubmit={addIdea} className="flex flex-col sm:flex-row gap-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Suggest a song (title - artist)" className="flex-1 rounded-lg bg-white/80 dark:bg-neutral-900/70 ring-1 ring-neutral-300 dark:ring-neutral-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green text-neutral-800 dark:text-neutral-200" />
        <button disabled={submitting} className="px-6 py-3 rounded-lg text-sm font-semibold bg-brand-green text-white shadow hover:bg-brand-pine transition disabled:opacity-50">{submitting? 'Adding…':'Add Idea'}</button>
      </form>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 items-center text-xs">
              <button onClick={()=>setSort('top')} className={`px-3 py-1.5 rounded-full border text-[11px] font-medium ${sort==='top'? 'bg-brand-green text-white border-brand-green':'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>Top</button>
              <button onClick={()=>setSort('new')} className={`px-3 py-1.5 rounded-full border text-[11px] font-medium ${sort==='new'? 'bg-brand-green text-white border-brand-green':'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>Newest</button>
            </div>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter" className="rounded-full bg-white/70 dark:bg-neutral-900/60 ring-1 ring-neutral-300 dark:ring-neutral-700 px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {filtered.map((idea,i)=>(
                <motion.div layout key={idea.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{type:'tween',duration:0.25}} className="group flex items-center gap-4 rounded-lg bg-white/80 dark:bg-neutral-900/60 ring-1 ring-neutral-200 dark:ring-neutral-800 px-4 py-3">
                  <button onClick={()=>vote(idea.id)} className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-gradient-to-b from-brand-green/80 to-brand-pine/80 text-white font-semibold text-sm shadow hover:from-brand-green hover:to-brand-pine transition-colors">
                    <span>{idea.votes}</span>
                    <span className="text-[10px] uppercase tracking-wide">votes</span>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{idea.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Suggested {new Date(idea.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
              {filtered.length===0 && !isLoading && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center text-xs text-neutral-500 py-10">No ideas yet. Be first!</motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-cream/70 via-white/60 to-brand-gold/40 dark:from-brand-pine/60 dark:via-neutral-900/60 dark:to-brand-green/30 p-5 ring-1 ring-brand-maroon/15 dark:ring-brand-pine/30">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold mb-2">Guidelines</h4>
            <ul className="text-[11px] space-y-1 text-neutral-600 dark:text-neutral-400 list-disc pl-4">
              <li>Holiday or high-energy tracks work best</li>
              <li>Family friendly lyrics</li>
              <li>Unique ideas over duplicates</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-5 ring-1 ring-neutral-200 dark:ring-neutral-800">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold mb-2">Process</h4>
            <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">Top-voted ideas move into the sequencing shortlist after the season. Not every track can make it, but votes help prioritize.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
