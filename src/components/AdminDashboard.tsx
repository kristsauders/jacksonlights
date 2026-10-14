"use client";
import useSWR, { mutate as globalMutate } from 'swr';
import { useActionState, useEffect, useOptimistic, useTransition } from 'react';
import SubmitButton from './SubmitButton';
import { POSTS_KEY, postsFetcher } from '../lib/swr';
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

interface UploadState { status:'idle'|'error'|'done'; msg?:string; caption?:string; }

async function uploadPost(_prev:UploadState, form:FormData): Promise<UploadState> {
  const file = form.get('file');
  const caption = String(form.get('caption') ?? '');
  if (!(file instanceof File) || file.size === 0) return { status:'error', msg:'Choose a file first.', caption };
  try {
    const res = await fetch('/api/admin/upload', { method:'POST', body: form });
    if (!res.ok) {
      const data = await res.json().catch(()=>({ message:'Upload failed' }));
      return { status:'error', msg: data.message || 'Upload failed', caption };
    }
    // Refreshes the admin list and the public Behind the Scenes feed alike.
    await globalMutate(POSTS_KEY);
    return { status:'done', msg:'Uploaded! Check Behind the Scenes tab.' };
  } catch {
    return { status:'error', msg:'Network error', caption };
  }
}

function UploadSection(){
  const [state, formAction] = useActionState<UploadState, FormData>(uploadPost, { status:'idle' });
  return (
    <div className="rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-4 space-y-4">
      <h3 className="text-sm font-semibold tracking-wide text-brand-maroon dark:text-brand-gold uppercase">Quick Upload</h3>
      <form action={formAction} className="space-y-3">
        <input
          type="file"
          name="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-brand-green/80 file:text-white file:px-3 file:py-1.5 file:text-xs hover:file:bg-brand-green"
          required
        />
        <input
          type="text"
          name="caption"
          placeholder="Caption / short description"
          maxLength={140}
          defaultValue={state.caption ?? ''}
          className="w-full rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs"
        />
        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Uploading…" className="px-4 py-2 rounded-md bg-brand-green text-white text-xs font-semibold disabled:opacity-50">
            Upload
          </SubmitButton>
          <span role="status" aria-live="polite">
            {state.status==='error' && <span className="text-xs text-red-600">{state.msg}</span>}
            {state.status==='done' && <span className="text-xs text-brand-green font-medium">{state.msg}</span>}
          </span>
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
  const { data: posts, mutate } = useSWR<PostItem[]>(POSTS_KEY, postsFetcher);
  const [, startDelete] = useTransition();
  // The row disappears the moment you confirm; if the delete fails it comes back
  // when the transition settles.
  const [visiblePosts, hidePost] = useOptimistic(
    posts,
    (current: PostItem[] | undefined, id: string) => current?.filter(p=> p.id!==id)
  );

  function remove(id:string){
    if (!confirm('Delete this post? This cannot be undone.')) return;
    startDelete(async ()=>{
      hidePost(id);
      try {
        const res = await fetch('/api/admin/delete', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id }) });
        if (!res.ok) alert('Delete failed');
      } catch {
        alert('Network error');
      }
      await globalMutate(POSTS_KEY);
    });
  }
  return (
    <div className="rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-brand-maroon dark:text-brand-gold uppercase">Manage Posts</h3>
        <button onClick={()=> mutate()} className="text-[11px] px-2 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700">Refresh</button>
      </div>
      {!visiblePosts ? <p className="text-xs text-neutral-500">Loading posts…</p> : visiblePosts.length===0 ? <p className="text-xs text-neutral-500">No posts yet.</p> : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-72 overflow-auto pr-1 text-xs">
          {visiblePosts.slice(0,60).map(p=> (
            <li key={p.id} className="py-2 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{p.alt || '(no caption)'}</p>
                <p className="text-[10px] text-neutral-500 tabular-nums">{p.createdAt? new Date(p.createdAt).toLocaleString(): ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={p.src} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[10px]">View</a>
                <button onClick={()=> remove(p.id)} className="px-2 py-1 rounded bg-red-600/90 hover:bg-red-600 text-white text-[10px]">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-neutral-500">Deleting removes the media file & JSON entry. Cannot be undone.</p>
    </div>
  );
}
