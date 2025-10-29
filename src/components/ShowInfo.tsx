"use client";
import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

interface Fact { title:string; body:string; }
interface Step { id:number; title:string; desc:string; }

const techFacts: Fact[] = [
  { title:'Controllers', body:'Falcon & Kulp boards drive wired pixel props; Twinkly devices join via their wireless mesh in sync.' },
  { title:'Pixels', body:'Most props use 12V smart RGB pixels for longer runs; Twinkly sets run 24V internally. Power injection keeps colors even end‑to‑end.' },
  { title:'Sequencing', body:'xLights layers timing tracks, effects, shaders & audio. Finished sequences deploy to the player and become requestable.' },
  { title:'Networking', body:'Show PC multicasts / streams E1.31 or DDP over a dedicated VLAN → controllers → pixel data waveforms.' },
  { title:'Audio', body:'Synchronized track broadcast via low‑power FM (87.9) and mirrored on the site stream.' },
];

const buildSteps: Step[] = [
  { id:1, title:'Plan & Design', desc:'Map the house, decide prop types (arches, matrix, mega tree, window outlines), estimate channel counts, plan power.' },
  { id:2, title:'Model in xLights', desc:'Recreate the physical layout virtually; assign models for every prop so effects preview accurately.' },
  { id:3, title:'Wire & Power', desc:'Mount controllers (Falcon / Kulp), run waterproof pigtails, add fuses & power injection for long runs.' },
  { id:4, title:'Sequence', desc:'Use timing marks & beat tracks, layer effects (wave, on, shimmer, fan, butterfly, shader) syncing to music.' },
  { id:5, title:'Deploy', desc:'Export and upload sequence + audio; schedule runtime and enable viewer control / requests.' },
  { id:6, title:'Showtime', desc:'Nightly monitoring, occasional tweaks, and capturing photos/videos for the archive & posts tab.' },
];

const explainerSections = [
  {
    key:'leds',
    title:'How Smart Pixels Work',
    body:`Each pixel contains tiny red, green, and blue LEDs plus a chipset (e.g. WS2811) that listens for a data stream. A controller sends a rapid sequence of color values. Every pixel consumes the first 24 bits (R,G,B) and forwards the rest down the line. That daisy chain lets hundreds (or thousands) of lights dance in perfect sync.`
  },
  {
    key:'network',
    title:'Show Data Over the Network',
    body:`Effect frames become channel data (intensities) and are packed into E1.31 or DDP packets. These broadcast/stream over Ethernet to controller IPs on a show VLAN. Controllers translate packets to pixel data waveforms at 800kHz. Latency is typically under a few milliseconds.`
  },
  {
    key:'sequencing',
    title:'Sequencing With xLights',
    body:`xLights lets creators stack timed effects, morphs, and audio-synchronized cues. You sculpt looks using layers: base movement, accents, glitter, strobes, then color washes or shader-based textures. Timing marks from beat analysis help align impacts with musical transients.`
  },
  {
    key:'props',
    title:'Custom Props & Mapping',
    body:`Physical props (arches, matrices, stars) are defined by precise node order. That mapping ensures an effect’s geometry (spiral, fan, wave) renders correctly in real life. Custom models let you repurpose software patterns to unusual shapes without rewriting effects.`
  }
];

function PixelChainDemo(){
  const chain = Array.from({ length:48 });
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 mb-3 justify-center">
        <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold bg-white/80 dark:bg-neutral-900/70 px-2 py-1 rounded">Controller Output</span>
        <span className="text-[11px] md:text-[12px] text-neutral-600 dark:text-neutral-300">Sequential 24‑bit color data propagating downstream</span>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/85 ring-1 ring-neutral-700 px-3 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="flex flex-wrap justify-center">
          {chain.map((_,i)=>(
            <div key={i} className="relative m-[3px]" style={{ ['--i' as any]: i }}>
              <div className="w-5 h-5 rounded-sm bg-neutral-700/60 ring-1 ring-neutral-600 overflow-hidden pixel-node">
                <div className="absolute inset-0 rounded-sm pixel-wave" />
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes pixelWavePulse {
            0%, 70%, 100% { opacity: .22; filter: saturate(.25); }
            5% { opacity: 1; filter: saturate(1); }
            15% { opacity: .45; }
          }
          .pixel-wave {
            background: linear-gradient(to bottom, var(--c1), var(--c2), var(--c3));
            --c1: #BF2C31; --c2:#E2C044; --c3:#119B68;
            animation: pixelWavePulse 6s linear infinite;
            animation-delay: calc(var(--i) * 0.12s);
          }
        `}</style>
      </div>
      <p className="mt-3 text-center text-xs md:text-sm text-neutral-600 dark:text-neutral-200 leading-relaxed max-w-2xl mx-auto px-4">Each pixel chip latches its 24 bits then forwards the remaining stream.</p>
    </div>
  );
}

function NetworkDiagram(){
  return (
    <div className="relative overflow-x-auto">
      <svg className="w-full max-w-4xl mx-auto" viewBox="0 0 980 320" role="img" aria-label="Network diagram: PC, switch, controllers, wired props, wireless Twinkly mesh" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="wire" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0F3B2E" />
            <stop offset="100%" stopColor="#04B485" />
          </linearGradient>
          <linearGradient id="pkt" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#E2C044" />
            <stop offset="100%" stopColor="#BF2C31" />
          </linearGradient>
          <style>{`.dash{stroke-dasharray:6 6}`}</style>
        </defs>
        {/* Show PC */}
        <rect x="20" y="130" width="140" height="80" rx="14" fill="#101010" stroke="#264d40" strokeWidth="2" />
        <text x="90" y="175" textAnchor="middle" fontSize="13" fill="#E2C044">Show PC</text>
        {/* Switch */}
        <rect x="210" y="145" width="120" height="50" rx="10" fill="#141414" stroke="#2d5d4c" strokeWidth="2" />
        <text x="270" y="175" textAnchor="middle" fontSize="11" fill="#E2C044">VLAN Switch</text>
        {/* Controllers (Falcon / Kulp) */}
        <rect x="410" y="60" width="150" height="80" rx="12" fill="#111" stroke="#3d3d3d" strokeWidth="2" />
        <text x="485" y="105" textAnchor="middle" fontSize="12" fill="#fff">Falcon Ctrl</text>
        <rect x="410" y="200" width="150" height="80" rx="12" fill="#111" stroke="#3d3d3d" strokeWidth="2" />
        <text x="485" y="245" textAnchor="middle" fontSize="12" fill="#fff">Kulp Ctrl</text>
        {/* Wired Prop Cluster */}
        <rect x="620" y="30" width="300" height="140" rx="20" fill="#181818" stroke="#444" strokeWidth="2" />
        <text x="770" y="55" textAnchor="middle" fontSize="12" fill="#fff">Wired Pixel Props</text>
  {/* Evenly spaced wired prop labels */}
  <text x="650" y="95" fontSize="10" fill="#E2C044">Mega Tree</text>
  <text x="725" y="95" fontSize="10" fill="#E2C044">Arches</text>
  <text x="800" y="95" fontSize="10" fill="#E2C044">Matrix</text>
  <text x="865" y="95" fontSize="10" fill="#E2C044">Windows</text>
        {/* Wireless Mesh Cluster (Twinkly) */}
        <rect x="620" y="180" width="300" height="110" rx="20" fill="#181818" stroke="#444" strokeWidth="2" />
  {/* Split long wireless mesh label into two lines to avoid overflow */}
        <text x="770" y="200" textAnchor="middle" fontSize="11" fill="#fff">Wireless Mesh</text>
        <text x="770" y="214" textAnchor="middle" fontSize="10" fill="#E2C044">Twinkly 24V</text>
  {/* Increased vertical gap before wireless prop labels */}
  <text x="640" y="248" fontSize="10" fill="#E2C044">Strings</text>
  <text x="700" y="248" fontSize="10" fill="#E2C044">Curtains</text>
  <text x="830" y="246" fontSize="9" fill="#E2C044">Snowflakes</text>
        {/* Wired links */}
        <path d="M160 170 H210" stroke="url(#wire)" strokeWidth="8" strokeLinecap="round" />
        <path d="M330 170 L410 100" stroke="url(#wire)" strokeWidth="6" strokeLinecap="round" />
        <path d="M330 170 L410 240" stroke="url(#wire)" strokeWidth="6" strokeLinecap="round" />
        <path d="M560 100 H620" stroke="url(#wire)" strokeWidth="6" strokeLinecap="round" />
  <path d="M560 240 V100 H620" stroke="url(#wire)" strokeWidth="6" strokeLinecap="round" />
  {/* Direct wireless from PC (bypass switch) to mesh cluster – routed around controllers */}
  {/* Direct wireless from PC (bypass switch) to mesh cluster – bottom arc route */}
  <path d="M160 170 C 260 300, 420 310, 560 300 S 860 260, 770 235" stroke="#E2C044" strokeWidth="3" className="dash" fill="none" />
        {/* Packet animations: PC -> Falcon -> Wired props */}
        {Array.from({length:5}).map((_,i)=>(
          <circle key={'wf'+i} r="6" fill="url(#pkt)">
            <animateMotion dur="6s" repeatCount="indefinite" path="M160 170 H210 L330 170 L410 100 H560 H620" begin={`${i*0.9}s`} />
          </circle>
        ))}
        {/* Packet animations: PC -> Kulp -> Wired props */}
        {Array.from({length:5}).map((_,i)=>(
          <circle key={'wk'+i} r="6" fill="url(#pkt)">
            <animateMotion dur="6s" repeatCount="indefinite" path="M160 170 H210 L330 170 L410 240 H560 V100 H620" begin={`${i*0.9+0.45}s`} />
          </circle>
        ))}
        {/* Packet animations: PC direct wireless arc to mesh */}
        {Array.from({length:6}).map((_,i)=>(
          <circle key={'wm'+i} r="5" fill="url(#pkt)">
            <animateMotion dur="7s" repeatCount="indefinite" path="M160 170 C 260 300, 420 310, 560 300 S 860 260, 770 235" begin={`${i*1}s`} />
          </circle>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-neutral-500">Flow: Show PC → Switch → Controllers → Wired Props, plus direct wireless mesh to Twinkly devices.</p>
    </div>
  );
}

function PixelFrameBits(){
  const [color,setColor] = useState(()=>({r:173,g:46,b:255}));
  // rotate color every few seconds
  useState(()=>{
    const id = setInterval(()=>{
      setColor({
        r: Math.floor(Math.random()*256),
        g: Math.floor(Math.random()*256),
        b: Math.floor(Math.random()*256)
      });
    }, 2000);
    return () => clearInterval(id);
  });
  const toBits = (v:number) => v.toString(2).padStart(8,'0').split('').map(b=> Number(b));
  const rb = toBits(color.r); const gb = toBits(color.g); const bb = toBits(color.b);
  const hex = `#${[color.r,color.g,color.b].map(v=> v.toString(16).padStart(2,'0')).join('')}`.toUpperCase();
  const groupStyle = 'grid grid-cols-8 gap-[2px] p-2 rounded-lg ring-1 ring-neutral-300/60 dark:ring-neutral-700/60 bg-white/70 dark:bg-neutral-900/60';
  const Bit = ({on, tint}:{on:number; tint:string}) => (
    <div className={`w-5 h-6 rounded-sm flex items-center justify-center text-[9px] font-mono transition-colors duration-300 ${on? tint+' text-[10px] font-semibold text-white shadow':'bg-neutral-300/50 dark:bg-neutral-700/60 text-neutral-500 dark:text-neutral-400'}`}>{on}</div>
  );
  return (
    <div className="mt-6 space-y-3" aria-label="Visualization of one 24-bit pixel frame">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold">One 24‑bit Pixel Frame</h4>
        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-green/20 text-brand-maroon dark:text-brand-gold">8 bits Red + 8 bits Green + 8 bits Blue</span>
        <div className="flex items-center gap-3 text-[11px] text-neutral-600 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-sm border border-neutral-400/50 dark:border-neutral-600/60" style={{backgroundColor:hex}} /> Current Color <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800/70">{hex}</code></span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-stretch gap-3">
        <div className={groupStyle} aria-label={`Red channel ${color.r} (${rb.join('')})`}>
          {rb.map((b,i)=><Bit key={i} on={b} tint="bg-red-600" />)}
          <span className="col-span-8 text-center text-[10px] mt-1 text-red-700 dark:text-red-300 font-medium">R {color.r}</span>
        </div>
        <div className={groupStyle} aria-label={`Green channel ${color.g} (${gb.join('')})`}>
          {gb.map((b,i)=><Bit key={i} on={b} tint="bg-green-600" />)}
          <span className="col-span-8 text-center text-[10px] mt-1 text-green-700 dark:text-green-300 font-medium">G {color.g}</span>
        </div>
        <div className={groupStyle} aria-label={`Blue channel ${color.b} (${bb.join('')})`}>
          {bb.map((b,i)=><Bit key={i} on={b} tint="bg-sky-600" />)}
          <span className="col-span-8 text-center text-[10px] mt-1 text-sky-700 dark:text-sky-300 font-medium">B {color.b}</span>
        </div>
      </div>
    </div>
  );
}

const ModelViewer = dynamic(()=>import('./ModelViewer'), { ssr:false, loading: () => <div className="h-[420px] flex items-center justify-center text-xs text-neutral-500">Loading 3D Model...</div> });

export default function ShowInfo(){
  const [openKey,setOpenKey] = useState<string | null>('leds');
  return (
    <div className="space-y-12">
      {/* Community / family intro card */}
      <section className="relative rounded-2xl overflow-hidden ring-1 ring-brand-maroon/20 dark:ring-brand-pine/40 bg-gradient-to-br from-brand-cream/80 via-white/70 to-brand-gold/40 dark:from-brand-pine/60 dark:via-neutral-900/70 dark:to-brand-green/30 p-6 md:p-9">
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_25%_35%,white,transparent_70%)]" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-5">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-maroon dark:text-brand-gold">A Family Light Show For Beacon</h3>
          <p className="text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            Jackson Lights is a family-run holiday light show right here in Beacon. 2025 marks our <strong>3rd season</strong> sharing synchronized music and pixels with neighbors, friends, and anyone who stops by. The show is completely <strong>free</strong>—it’s simply our way to add a little more sparkle, joy, and togetherness to the community during the holiday season.
          </p>
          <p className="text-xs md:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Stop, enjoy a few songs, request what plays next, and snap some photos. Thanks for being part of the Beacon holiday magic.
          </p>
        </div>
      </section>
      {/* Hero intro section */}
      <section className="relative rounded-2xl overflow-hidden ring-1 ring-brand-maroon/20 dark:ring-brand-pine/40 bg-gradient-to-br from-brand-cream/70 via-white/60 to-brand-gold/40 dark:from-brand-pine/50 dark:via-neutral-900/60 dark:to-brand-green/30 p-6 md:p-9">
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_30%_30%,white,transparent_75%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-red via-brand-gold to-brand-green bg-clip-text text-transparent">Tech Stuff About The Show</h3>
            <p className="text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
              Jackson Lights is a fully synchronized holiday light experience in Beacon, NY combining music,
              RGB pixels, wireless Twinkly strands, and custom-built props all driven by Falcon & Kulp controllers.
            </p>
            <PixelChainDemo />
            <PixelFrameBits />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {techFacts.map(f => (
              <motion.div key={f.title} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="rounded-lg bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 ring-1 ring-brand-maroon/20 dark:ring-brand-pine/40">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold">{f.title}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-400">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Model + Build Process */}
      <section className="relative rounded-2xl overflow-hidden ring-1 ring-brand-maroon/15 dark:ring-brand-pine/30 bg-gradient-to-br from-white/70 via-brand-cream/50 to-brand-gold/30 dark:from-neutral-900/60 dark:via-brand-pine/40 dark:to-brand-green/25 p-6 md:p-10 space-y-12">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2 items-start">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-tight bg-gradient-to-r from-brand-red via-brand-gold to-brand-green bg-clip-text text-transparent">House Layout (3D)</h3>
            <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-3">The model used in sequencing to visualize effects before any real pixels turn on.</p>
            <Suspense fallback={<div className="h-[420px] flex items-center justify-center text-xs text-neutral-500">Loading 3D...</div>}>
              <ModelViewer />
            </Suspense>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-6 tracking-tight bg-gradient-to-r from-brand-red via-brand-gold to-brand-green bg-clip-text text-transparent">How A Holiday Light Show Gets Built</h3>
            <ol className="relative border-l border-neutral-300 dark:border-neutral-700 ml-3 space-y-10">
              {buildSteps.map(step => (
                <li key={step.id} className="pl-6 group">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-brand-green ring-4 ring-white dark:ring-neutral-950 shadow" />
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand-green text-white shadow-sm">{step.id}</span>
                    {step.title}
                  </h4>
                  <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-prose">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Network diagram */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-brand-maroon dark:text-brand-gold">Network & Data Flow</h3>
        <NetworkDiagram />
      </section>

      {/* Expandable explainers */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-brand-maroon dark:text-brand-gold">Deep Dives</h3>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur">
          {explainerSections.map(sec => {
            const open = openKey === sec.key;
            return (
              <div key={sec.key} className="">
                <button onClick={()=> setOpenKey(open? null: sec.key)} className="w-full flex items-center justify-between text-left px-5 py-4 focus-ring">
                  <span className="font-medium text-sm md:text-base text-brand-maroon dark:text-brand-gold">{sec.title}</span>
                  <motion.span animate={{rotate: open? 90: 0}} className="text-neutral-500 dark:text-neutral-400 ml-4">▶</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{type:'tween',duration:0.35}} className="px-5 pb-5">
                      <p className="text-xs md:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{sec.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Placeholder stats for future customization */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label:'Total Pixels', value:'~42 thousand' },
          { label:'Songs', value:'~40' },
          { label:'Controllers', value:'Falcon + Kulp + (Wireless Twinkly)' },
          { label:'Voltage', value:'12V Pixels + 24V Twinkly' }
        ].map(stat => (
          <div key={stat.label} className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{stat.label}</span>
            <span className="mt-2 text-lg font-bold text-brand-maroon dark:text-brand-gold">{stat.value}</span>
          </div>
        ))}
      </section>

    </div>
  );
}
