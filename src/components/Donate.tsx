"use client";
import useSWR from 'swr';
import { useState } from 'react';
import { motion } from 'framer-motion';

const fetcher = (url:string)=> fetch(url).then(r=>r.json());

export default function Donate(){
  const { data, mutate, isLoading } = useSWR('/api/donate', fetcher, { refreshInterval: 15000 });
  const [amount,setAmount] = useState('25');
  const [pending,setPending] = useState(false);
  const total = data?.total || 0;
  const doubled = total * 2;

  async function submit(e:React.FormEvent){
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <=0) return;
    setPending(true);
    try {
      await fetch('/api/donate', { method:'POST', body: JSON.stringify({ amount:value }), headers:{'Content-Type':'application/json'} });
      setAmount('');
      mutate();
    } finally { setPending(false); }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden ring-1 ring-brand-maroon/15 dark:ring-brand-pine/30 bg-gradient-to-br from-white/70 via-brand-cream/50 to-brand-gold/30 dark:from-neutral-900/60 dark:via-brand-pine/40 dark:to-brand-green/25 p-5 sm:p-6 md:p-10">
      <div className="relative z-10 max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <header className="text-center space-y-3 sm:space-y-4">
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-red via-brand-gold to-brand-green bg-clip-text text-transparent">Support & Amplify</h3>
          <p className="text-xs sm:text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">The show is and will always be free so everyone can share the wonder. If you feel inspired to give, this season we&apos;re directing all donations to <span className="font-semibold">[Local Charity Placeholder]</span>. Every dollar you give is <span className="font-bold text-brand-green">matched 1:1</span> to double the impact.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6 items-start">
          <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="md:col-span-2 space-y-5 sm:space-y-6">
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {[10,15,25,50,75,100,150,250].map(v=>(
                <button key={v} onClick={()=> setAmount(String(v))} className={`text-[11px] sm:text-sm rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 font-medium bg-white/70 dark:bg-neutral-900/60 ring-1 ring-neutral-200 dark:ring-neutral-800 hover:ring-brand-green/60 transition-colors ${amount===String(v)?'ring-2 ring-brand-green text-brand-green dark:text-brand-gold':''}`}>${v}</button>
              ))}
              <button onClick={()=> setAmount('')} className="text-[11px] sm:text-sm rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 font-medium bg-gradient-to-r from-brand-red/70 to-brand-green/70 text-white shadow hover:from-brand-red hover:to-brand-green transition-colors">Custom</button>
            </div>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <label className="flex-1 relative">
                <span className="sr-only">Amount</span>
                <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" type="number" step="1" min="1" className="w-full rounded-lg bg-white/80 dark:bg-neutral-900/70 ring-1 ring-neutral-300 dark:ring-neutral-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green text-neutral-800 dark:text-neutral-200" />
                <span className="absolute left-3 top-2.5 text-neutral-400 pointer-events-none select-none"> </span>
              </label>
              <button disabled={pending} className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm font-semibold bg-brand-green text-white shadow hover:bg-brand-pine transition disabled:opacity-50 disabled:cursor-not-allowed">{pending? 'Processing…':'Donate'}</button>
            </form>
            <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">Placeholder only – no real payment is processed yet. Integrate Stripe Checkout or another provider here later. Matching is applied at the end of the season.</p>
          </motion.div>
          <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="rounded-xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-5 sm:p-6 ring-1 ring-neutral-200 dark:ring-neutral-800 flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold">Season Progress</h4>
            <div className="space-y-3">
              <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-red via-brand-gold to-brand-green" style={{ width: Math.min(100, (total/2000)*100)+'%' }} />
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400">Raised: <span className="font-semibold">${total.toFixed(2)}</span> (will become <span className="font-semibold">${doubled.toFixed(2)}</span> with matching)</p>
              <p className="text-[11px] text-neutral-500">Goal placeholder: $2000 pre-match.</p>
            </div>
            <ul className="text-[11px] space-y-1 text-neutral-600 dark:text-neutral-400">
              <li>✔ 100% Free community show</li>
              <li>✔ Funds support local needs</li>
              <li>✔ Matching doubles impact</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
