"use client";
import useSWR from 'swr';
import { useEffect, useState, FormEvent } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

const fetcher = (url:string)=> fetch(url).then(r=> r.json());

interface AdminStats {
  donations:number;
  visits:number;
  ideas:{ count:number; top:{ id:string; title:string; votes:number; createdAt:string; }[] };
  feedback:{ count:number; recent:{ id:string; message:string; name?:string; createdAt:string; }[] };
}

export function AdminDashboard(){
  const { data: stats, error, mutate } = useSWR<AdminStats>('/api/admin/stats', fetcher, { refreshInterval: 20000 });
  const { data: feedbackList, mutate: mutateFeedback } = useSWR<any>('/api/admin/feedback', fetcher, { refreshInterval: 30000 });

  useEffect(()=>{ mutate(); mutateFeedback(); }, []);

  if (error) return <div className="text-sm text-red-500">Error loading admin data (are you logged in?).</div>;
  if (!stats) return <div className="text-sm text-neutral-500">Loading...</div>;

  const chartData = stats.ideas.top.map(i=> ({ name: i.title.slice(0,18)+(i.title.length>18?'…':''), votes: i.votes }));

  return (
    <div className="space-y-8">
      <UploadSection />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visits" value={stats.visits.toString()} />
        <StatCard label="Donations ($)" value={stats.donations.toFixed(2)} />
        <StatCard label="Song Ideas" value={stats.ideas.count.toString()} />
        <StatCard label="Feedback" value={stats.feedback.count.toString()} />
      </div>

      <div className="rounded-xl p-5 bg-white/70 dark:bg-neutral-900/60 ring-1 ring-neutral-200 dark:ring-neutral-800">
        <h4 className="font-semibold text-sm mb-3 text-brand-maroon dark:text-brand-gold">Top Requested Songs</h4>
        {chartData.length===0 ? <p className="text-xs text-neutral-500">No song ideas yet.</p> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize:10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} tick={{ fontSize:10 }} />
                <Tooltip contentStyle={{ fontSize:12 }} />
                <Bar dataKey="votes" fill="#0d7d3c" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-xl p-5 bg-white/70 dark:bg-neutral-900/60 ring-1 ring-neutral-200 dark:ring-neutral-800">
        <h4 className="font-semibold text-sm mb-4 text-brand-maroon dark:text-brand-gold">Recent Feedback</h4>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {feedbackList?.items?.length ? feedbackList.items.slice(0,50).map((f:any)=>(
            <div key={f.id} className="py-3 text-sm">
              <p className="font-medium text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words">{f.message}</p>
              <p className="mt-1 text-[11px] text-neutral-500">{f.name || 'Anon'} • {new Date(f.createdAt).toLocaleString()}</p>
            </div>
          )): <p className="text-xs text-neutral-500 py-4">No feedback yet.</p>}
        </div>
      </div>

  <p className="text-[10px] text-neutral-500">Admin view auto-refreshes every ~20–30s. Session expires in 7 days or on logout.</p>
    </div>
  );
}

function StatCard({ label, value }:{ label:string; value:string }){
  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-cream/80 via-white/70 to-brand-gold/50 dark:from-brand-pine/50 dark:via-neutral-900/60 dark:to-brand-green/30 p-4 ring-1 ring-brand-maroon/15 dark:ring-brand-pine/30">
      <div className="text-[11px] uppercase tracking-wide font-semibold text-brand-maroon dark:text-brand-gold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100 tabular-nums">{value}</div>
    </div>
  );
}

function UploadSection(){
  const [file,setFile] = useState<File|null>(null);
  const [caption,setCaption] = useState('');
  const [status,setStatus] = useState<'idle'|'uploading'|'error'|'done'>('idle');
  const [msg,setMsg] = useState('');
  async function submit(e:FormEvent){
    e.preventDefault();
    if(!file) return;
    setStatus('uploading'); setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('caption', caption);
      const res = await fetch('/api/admin/upload', { method:'POST', body: fd });
      if(!res.ok){
        const data = await res.json().catch(()=>({ message:'Upload failed'}));
        setStatus('error'); setMsg(data.message||'Upload failed');
        return;
      }
      setStatus('done'); setMsg('Uploaded! Refresh Behind the Scenes tab to view.');
      setFile(null); setCaption('');
    } catch (e:any){
      setStatus('error'); setMsg('Network error');
    }
  }
  return (
    <div className="rounded-xl p-5 bg-white/70 dark:bg-neutral-900/60 ring-1 ring-neutral-200 dark:ring-neutral-800">
      <h4 className="font-semibold text-sm mb-3 text-brand-maroon dark:text-brand-gold">Quick Upload (Photos / Videos)</h4>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex flex-col gap-2">
          <input type="file" accept="image/*,video/*" onChange={e=> setFile(e.target.files?.[0]||null)} className="text-xs" />
          <input type="text" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption / description" className="text-xs px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 focus-ring" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button disabled={!file || status==='uploading'} className="px-4 py-2 text-xs rounded-md bg-brand-green text-white font-semibold disabled:opacity-50">{status==='uploading'? 'Uploading...':'Upload'}</button>
          {msg && <span className={`text-[11px] ${status==='error'?'text-red-600 dark:text-red-400':'text-green-600 dark:text-green-400'}`}>{msg}</span>}
        </div>
        <p className="text-[10px] text-neutral-500">Files stored on server disk. Ensure hosting allows runtime writes. Max 40MB. Newest appears first.</p>
      </form>
    </div>
  );
}
