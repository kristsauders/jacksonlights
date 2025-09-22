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

interface PostItem { id:string; src:string; type:'image'|'video'; alt:string; createdAt?:string; }

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
  <ManagePostsSection />
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
  const [status,setStatus] = useState<{state:'idle'|'uploading'|'error'|'done'; msg?:string}>({state:'idle'});

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!file) return;
    setStatus({state:'uploading', msg:undefined});
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('caption', caption);
      const res = await fetch('/api/admin/upload', { method:'POST', body: fd });
      if(!res.ok){
        const data = await res.json().catch(()=>({ message:'Upload failed'}));
        setStatus({state:'error', msg:data.message||'Upload failed'});
        return;
      }
      setStatus({state:'done', msg:'Uploaded! Refresh Behind the Scenes tab to view.'});
      setFile(null); setCaption('');
    } catch (e:any){
      setStatus({state:'error', msg:'Network error'});
    }
  }
  return (
    <div className="rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-4 space-y-4">
      <h3 className="text-sm font-semibold tracking-wide text-brand-maroon dark:text-brand-gold uppercase">Quick Upload</h3>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={e=> setFile(e.target.files?.[0]||null)}
          className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-brand-green/80 file:text-white file:px-3 file:py-1.5 file:text-xs hover:file:bg-brand-green"
          required
        />
        <input
          type="text"
          placeholder="Caption / short description"
          maxLength={140}
          value={caption}
          onChange={e=> setCaption(e.target.value)}
          className="w-full rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!file || status.state==='uploading'}
            className="px-4 py-2 rounded-md bg-brand-green text-white text-xs font-semibold disabled:opacity-50"
          >
            {status.state==='uploading' ? 'Uploading…' : 'Upload'}
          </button>
          {status.state==='error' && <p className="text-xs text-red-600">{status.msg}</p>}
          {status.state==='done' && <p className="text-xs text-brand-green font-medium">{status.msg}</p>}
        </div>
      </form>
      <p className="text-[10px] text-neutral-500 leading-relaxed">
        Tips: For fastest mobile playback, record videos in H.264
        (iPhone Settings &gt; Camera &gt; Formats &gt; Most Compatible). Large 4K HDR
        MOV files may load slowly on some devices.
      </p>
    </div>
  );
}

function ManagePostsSection(){
  const { data: posts, mutate } = useSWR<PostItem[]>('/posts.json', (u: string)=> fetch(u).then(r=> r.json()));
  const [deleting, setDeleting] = useState<string|null>(null);
  async function remove(id:string){
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch('/api/admin/delete', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok){
        mutate(posts?.filter(p=> p.id!==id), { revalidate:false });
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Network error');
    } finally { setDeleting(null); }
  }
  return (
    <div className="rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-brand-maroon dark:text-brand-gold uppercase">Manage Posts</h3>
        <button onClick={()=> mutate()} className="text-[11px] px-2 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700">Refresh</button>
      </div>
      {!posts ? <p className="text-xs text-neutral-500">Loading posts…</p> : posts.length===0 ? <p className="text-xs text-neutral-500">No posts yet.</p> : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-72 overflow-auto pr-1 text-xs">
          {posts.slice(0,60).map(p=> (
            <li key={p.id} className="py-2 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{p.alt || '(no caption)'}</p>
                <p className="text-[10px] text-neutral-500 tabular-nums">{p.createdAt? new Date(p.createdAt).toLocaleString(): ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={p.src} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[10px]">View</a>
                <button disabled={deleting===p.id} onClick={()=> remove(p.id)} className="px-2 py-1 rounded bg-red-600/90 hover:bg-red-600 text-white text-[10px] disabled:opacity-50">{deleting===p.id? 'Deleting…':'Delete'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-neutral-500">Deleting removes the media file & JSON entry. Cannot be undone.</p>
    </div>
  );
}
