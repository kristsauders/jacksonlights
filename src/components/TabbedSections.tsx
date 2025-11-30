"use client";
import { useState, useEffect } from 'react';
import Tabs from './Tabs';
import Playlist from './Playlist';
import PhotoCarousel from './PhotoCarousel';
import VideoGallery from './VideoGallery';
import ShowInfo from './ShowInfo';
import PostsFeed from './PostsFeed';
import Donate from './Donate';
import SongRequests from './SongRequests';
import { FeedbackForm } from './'; 
import { AdminDashboard } from './AdminDashboard';

export default function TabbedSections(){
  const [active,setActive] = useState('playlist');
  const [adminPassword,setAdminPassword] = useState('');
  const [authState,setAuthState] = useState<'idle'|'logging'|'error'|'ok'>('idle');
  const [errorMsg,setErrorMsg] = useState('');

  // ping visits endpoint once per mount (fire and forget)
  useEffect(()=>{ fetch('/api/metrics/visit', { method:'POST' }).catch(()=>{}); },[]);
  return (
    <div>
  <Tabs tabs={[
    { id:'playlist', label:'Song List' },
    { id:'gallery', label:'Gallery' }, // Combined Photos + Videos
    { id:'info', label:'About Us' },
    // { id:'donate', label:'Donate' },
    { id:'requests', label:'Requests & Feedback' }, // Combined Requests + Feedback
    { id:'posts', label:'Behind the Scenes' },
	{ id:'admin', label:'Admin' }
  ]} initial={active} onChange={setActive} />
  <div className="mt-3 sm:mt-4 space-y-8 sm:space-y-10">
        {active==='playlist' && <Playlist />}
        {active==='gallery' && (
          <div className="space-y-12">
            <PhotoCarousel />
            <VideoGallery />
          </div>
        )}
        {active==='info' && <ShowInfo />}
        {active==='donate' && <Donate />}
        {active==='requests' && (
          <div className="space-y-12">
            <SongRequests />
            <FeedbackForm />
          </div>
        )}
  {active==='posts' && <PostsFeed />}
  {active==='admin' && (
    <div className="space-y-6">
      <AdminAuthSection password={adminPassword} setPassword={setAdminPassword} state={authState} setState={setAuthState} error={errorMsg} setError={setErrorMsg} />
      {authState==='ok' && <AdminDashboard />}
    </div>
  )}
      </div>
    </div>
  );
}

function AdminAuthSection({ password, setPassword, state, setState, error, setError }:{ password:string; setPassword:(v:string)=>void; state:'idle'|'logging'|'error'|'ok'; setState:(s:any)=>void; error:string; setError:(v:string)=>void; }){
  async function login(e:React.FormEvent){
    e.preventDefault();
    if (!password) return;
    setState('logging'); setError('');
    try {
      const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
      if (!res.ok){
        const data = await res.json().catch(()=>({}));
        setState('error');
        setError(data.message||'Login failed');
        return;
      }
      setState('ok');
      setPassword('');
    } catch (e:any){
      setState('error'); setError('Network error');
    }
  }
  async function logout(){
    await fetch('/api/admin/logout', { method:'POST' });
    setState('idle');
  }
  if (state==='ok'){
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Logged in</span>
        <button onClick={logout} className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500">Logout</button>
      </div>
    );
  }
  return (
    <form onSubmit={login} className="flex items-center gap-3 flex-wrap">
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" className="text-sm px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 focus-ring" />
      <button disabled={state==='logging'} className="text-sm px-4 py-2 rounded-md bg-brand-green text-white font-medium disabled:opacity-60">{state==='logging'? 'Logging in...':'Login'}</button>
      {state==='error' && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </form>
  );
}