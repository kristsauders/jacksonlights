"use client";
import { useState } from 'react';

export default function FeedbackForm(){
  const [message,setMessage] = useState('');
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [status,setStatus] = useState<{state:'idle'|'submitting'|'success'|'error'; msg?:string}>({state:'idle'});

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if (!message.trim()) return setStatus({state:'error', msg:'Message required'});
    setStatus({state:'submitting'});
    try {
      const res = await fetch('/api/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: message.trim(), email: email.trim()||undefined, name: name.trim()||undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||'Failed');
      setStatus({state:'success', msg:'Thanks for the feedback!'});
      setMessage(''); setEmail(''); setName('');
    } catch (err:any){
      setStatus({state:'error', msg: err.message});
    }
  }

  return (
    <div className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-5 max-w-2xl">
      <h3 className="text-lg font-semibold tracking-tight text-brand-maroon dark:text-brand-gold mb-3">Share Your Feedback</h3>
      <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-4">Have a song idea, enjoyed the show, or noticed something we can improve? Leave a quick note below. Optional contact info if you want a reply.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (optional)" className="flex-1 text-sm rounded-md px-3 py-2 bg-white/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 focus-ring" />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" type="email" className="flex-1 text-sm rounded-md px-3 py-2 bg-white/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 focus-ring" />
        </div>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} required placeholder="Your message..." rows={4} className="w-full resize-y text-sm rounded-md px-3 py-2 bg-white/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 focus-ring" />
        <div className="flex items-center gap-3">
          <button disabled={status.state==='submitting'} className="px-4 py-2 rounded-md text-sm font-medium bg-brand-green text-white shadow disabled:opacity-60 disabled:cursor-not-allowed">{status.state==='submitting'? 'Sending...':'Send Feedback'}</button>
          {status.state==='error' && <span className="text-xs text-red-600 dark:text-red-400">{status.msg}</span>}
          {status.state==='success' && <span className="text-xs text-green-600 dark:text-green-400">{status.msg}</span>}
        </div>
      </form>
    </div>
  );
}
