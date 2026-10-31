"use client";
import useSWR from 'swr';
import { useState, useMemo, useActionState, useOptimistic, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubmitButton from './SubmitButton';

interface Idea { id:string; title:string; votes:number; createdAt:string; }
interface AddState { status:'idle'|'success'|'info'|'error'; message?:string; values?:{ title:string }; }
const fetcher = (url:string)=> fetch(url).then(r=>r.json());

export default function SongRequests(){
  const { data, mutate, isLoading } = useSWR('/api/song-ideas', fetcher, { refreshInterval: 20000 });
  const ideas: Idea[] = data?.ideas || [];
  const [filter,setFilter] = useState('');
  const [sort,setSort] = useState<'top'|'new'>('top');
  const [voteNotice,setVoteNotice] = useState('');
  const [,startVote] = useTransition();

  // A vote shows up immediately; React drops the optimistic value and takes the
  // server's number once the transition (PATCH + revalidate) settles, so a failed
  // vote rolls itself back.
  const [optimisticIdeas, addOptimisticVote] = useOptimistic(
    ideas,
    (current: Idea[], id: string) => current.map(i => i.id===id ? { ...i, votes: i.votes + 1 } : i)
  );

  const filtered = useMemo(()=>{
    const base = [...optimisticIdeas];
    if (sort==='top') base.sort((a,b)=> b.votes - a.votes || a.title.localeCompare(b.title));
    else base.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
    const f = filter.trim().toLowerCase();
    return f? base.filter(i=> i.title.toLowerCase().includes(f)) : base;
  }, [optimisticIdeas, filter, sort]);

  const [addState, addAction] = useActionState<AddState, FormData>(async (_prev, form) => {
    const title = String(form.get('title') ?? '').trim();
    if (title.length < 2) return { status:'error', message:'Enter at least 2 characters.', values:{ title } };
    try {
      const res = await fetch('/api/song-ideas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title }) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) return { status:'error', message: data.message || 'Could not add that right now.', values:{ title } };
      await mutate();
      if (res.status !== 201) return { status:'info', message:"That one's already on the list — give it a vote!" };
      return { status:'success' };
    } catch {
      return { status:'error', message:'Network error — please try again.', values:{ title } };
    }
  }, { status:'idle' });

  function vote(id:string){
    setVoteNotice('');
    startVote(async ()=>{
      addOptimisticVote(id);
      try {
        const res = await fetch('/api/song-ideas', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
        if (!res.ok) setVoteNotice((await res.json().catch(()=>({}))).message || 'Could not record that vote.');
      } catch {
        setVoteNotice('Network error — your vote was not recorded.');
      }
      await mutate();
    });
  }

  // Sorting and filtering only help once there's a real list to look through.
  const showControls = ideas.length > 4;

  return (
    <section className="surface p-5 sm:p-6 space-y-5">
      <div>
        <p className="eyebrow">Song ideas</p>
        <h3 className="section-title mt-1">Suggest a song for next year</h3>
        <p className="body-text mt-2">Holiday favorites, high-energy hits and songs everyone knows work best. Family-friendly lyrics, please!</p>
      </div>
      <form action={addAction} className="flex flex-col sm:flex-row gap-3">
        <input name="title" defaultValue={addState.values?.title ?? ''} maxLength={120} placeholder="Song title – artist" aria-label="Song title and artist" className="field flex-1" />
        <SubmitButton pendingLabel="Adding…" className="btn-primary">Add idea</SubmitButton>
      </form>
      {(addState.status==='error' || addState.status==='info' || voteNotice) && (
        <p role={addState.status==='info' && !voteNotice ? 'status' : 'alert'} className="text-sm -mt-2">
          {addState.status==='error' && <span className="text-red-600 dark:text-red-400">{addState.message}</span>}
          {addState.status==='info' && <span className="text-neutral-600 dark:text-neutral-400">{addState.message}</span>}
          {voteNotice && <span className="text-red-600 dark:text-red-400">{voteNotice}</span>}
        </p>
      )}
      {showControls && (
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 items-center">
            <button onClick={()=>setSort('top')} aria-pressed={sort==='top'} className={`chip ${sort==='top' ? 'chip-active' : ''}`}>Top</button>
            <button onClick={()=>setSort('new')} aria-pressed={sort==='new'} className={`chip ${sort==='new' ? 'chip-active' : ''}`}>Newest</button>
          </div>
          <input type="search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter ideas" aria-label="Filter ideas" className="field !w-auto !py-1.5 !rounded-full" />
        </div>
      )}
      {(filtered.length > 0 || !isLoading) && (
        <ul className="divide-y divide-neutral-200 dark:divide-white/10 border-t border-neutral-200 dark:border-white/10">
          <AnimatePresence initial={false}>
            {filtered.map((idea)=>(
              <motion.li layout key={idea.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{type:'tween',duration:0.25}} className="flex items-center gap-4 py-3">
                <button onClick={()=>vote(idea.id)} aria-label={`Vote for ${idea.title}`} className="focus-ring flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-xl border border-brand-green/50 bg-brand-green/10 text-brand-green dark:text-[#4fd1a5] font-semibold text-base hover:bg-brand-green/20 transition-colors">
                  <span>{idea.votes}</span>
                  <span className="text-[10px] uppercase tracking-wide">{idea.votes === 1 ? 'vote' : 'votes'}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-neutral-900 dark:text-white">{idea.title}</p>
                  <p className="meta-text mt-0.5">Suggested {new Date(idea.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {filtered.length===0 && (
            <li className="meta-text pt-4">{filter ? 'No ideas match that filter.' : 'No ideas yet. Be the first!'}</li>
          )}
        </ul>
      )}
    </section>
  );
}
