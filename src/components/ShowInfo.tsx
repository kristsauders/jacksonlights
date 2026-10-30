"use client";
// About Us tab: who we are, how a song becomes a light show, and the basic
// hardware. Deliberately non-technical; numbers come from the 2026 xLights
// layout (7 active Falcon/Kulp controllers, ~50k pixels).

const stats = [
  { value: '~50,000', label: 'Lights' },
  { value: '7', label: 'Controllers' },
  { value: '4th', label: 'Season' },
  { value: '87.9 FM', label: 'Tune in' },
];

const steps = [
  {
    icon: '🏠',
    title: 'Build the house in software',
    body: 'We recreate our house and every decoration in a free program called xLights, so it knows exactly where each of the lights sits.',
  },
  {
    icon: '🎵',
    title: 'Choreograph to the music',
    body: 'Song by song, we place effects on a timeline (sweeps, sparkles, spirals, color washes) and line them up with the beat. One song can take weeks.',
  },
  {
    icon: '💾',
    title: 'Turn it into a light file',
    body: 'xLights works out the color of every light for every split second of the song and saves it all into one file, ready to play back.',
  },
  {
    icon: '✨',
    title: 'Play it back each night',
    body: 'A small show computer plays the music and streams those colors to the lights, perfectly in sync, while the audio goes out on 87.9 FM.',
  },
];

const hardware = [
  {
    title: 'Smart pixels',
    body: 'Every bulb is a tiny red, green and blue LED with its own chip, so each one can show any color on its own.',
  },
  {
    title: 'Controllers',
    body: 'Falcon and Kulp boards hidden around the yard. Each one takes data from the network and drives thousands of lights.',
  },
  {
    title: 'Power supplies',
    body: 'Weatherproof boxes of 12-volt supplies feed the strings, with extra power added along long runs so colors stay bright.',
  },
  {
    title: 'Show computer',
    body: 'Runs the schedule, takes your song requests from this website, and sends the music to the FM transmitter.',
  },
];

const props = ['Mega tree', 'Light tunnel', 'Spheres', 'Snowflakes', 'Window matrices', 'Fence matrix', 'Mini trees', 'Spinners', 'Floodlights'];

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red dark:text-brand-gold">{eyebrow}</p>
      <h3 className="mt-1 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h3>
    </div>
  );
}

const card = 'rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur';

// Diagram 1: the path from the show computer to the lights.
function SignalFlow() {
  const nodes = [
    { icon: '💻', title: 'Show computer', note: 'Plays the song & light file' },
    { icon: '📡', title: 'Network', note: 'Carries the colors' },
    { icon: '🎛️', title: 'Controllers', note: 'Falcon & Kulp boards' },
    { icon: '🎄', title: 'Lights', note: '~50,000 smart pixels' },
  ];
  return (
    <figure className={`${card} p-5 sm:p-6`}>
      <ol className="flex flex-col sm:flex-row sm:items-stretch">
        {nodes.map((n, i) => (
          <li key={n.title} className="flex flex-col sm:flex-row items-center sm:flex-1 min-w-0">
            <div className="w-full h-full flex sm:block items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/70 px-4 sm:px-2 py-2.5 sm:py-3 sm:text-center">
              <div className="text-2xl" aria-hidden="true">{n.icon}</div>
              <div>
                <div className="sm:mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{n.title}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{n.note}</div>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <span aria-hidden="true" className="shrink-0 py-1 sm:py-0 sm:px-1.5 text-brand-green dark:text-brand-gold text-lg leading-none">
                <span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span>
              </span>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
        The music goes out to your car radio while the colors go out to the lights, both perfectly in time.
      </figcaption>
    </figure>
  );
}

// Diagram 2: how a string of smart pixels passes color down the line.
function PixelChain() {
  const colors = ['#BF2C31', '#E2C044', '#008B6B', '#3B82F6', '#A855F7', '#BF2C31', '#E2C044', '#008B6B', '#3B82F6', '#A855F7', '#BF2C31', '#E2C044'];
  return (
    <figure className={`${card} p-5 sm:p-6 flex flex-col justify-center`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-neutral-900 dark:bg-neutral-800 text-white text-[11px] font-semibold px-2.5 py-2 text-center leading-tight">
          Controller
        </div>
        <div className="relative flex-1 min-w-0 flex items-center justify-between">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
          {colors.map((c, i) => (
            <span
              key={i}
              className={`pixel relative h-3.5 w-3.5 sm:h-5 sm:w-5 rounded-full ring-2 ring-white dark:ring-neutral-900 ${i >= 8 ? 'hidden sm:block' : ''}`}
              style={{ backgroundColor: c, ['--i' as any]: i }}
            />
          ))}
        </div>
      </div>
      <figcaption className="mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
        The controller sends a list of colors down the wire. Each light keeps the first color for itself and passes the rest along, dozens of times a second.
      </figcaption>
      {/* Opacity/transform only, so it stays on the compositor and doesn't
          make scrolling stutter on phones. */}
      <style jsx>{`
        @keyframes pixelPulse {
          0%, 60%, 100% { opacity: .3; transform: scale(.85); }
          10% { opacity: 1; transform: scale(1.1); }
        }
        .pixel { animation: pixelPulse 2.4s ease-in-out infinite; animation-delay: calc(var(--i) * 0.12s); }
        @media (prefers-reduced-motion: reduce) { .pixel { animation: none; opacity: 1; } }
      `}</style>
    </figure>
  );
}

export default function ShowInfo() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Intro */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-gold/50 bg-gradient-to-br from-brand-cream/80 via-white/80 to-brand-gold/25 dark:from-brand-pine/60 dark:via-neutral-900/80 dark:to-brand-maroon/30 p-6 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red dark:text-brand-gold">About Jackson Lights</p>
        <h3 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-2xl">
          A family light show for Beacon
        </h3>
        <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          Jackson Lights is a family-run holiday light show right here in Beacon. 2026 is our <strong>4th season</strong> of
          lights synchronized to music, and it's always <strong>free</strong>. It's simply our way of adding a little extra
          sparkle and togetherness to the neighborhood.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Pull up, tune your radio to 87.9 FM, request a song from this site, and enjoy.
        </p>
        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white/70 dark:bg-neutral-950/40 border border-white/60 dark:border-neutral-800 px-4 py-3">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</dt>
              <dd className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-brand-maroon dark:text-brand-gold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* From song to show */}
      <section>
        <SectionHeading eyebrow="How it works" title="From a song to a light show" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className={`${card} p-4 sm:p-5 flex sm:flex-col gap-4 sm:gap-3`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green/10 dark:bg-brand-gold/10 text-lg" aria-hidden="true">{s.icon}</span>
              <div>
                <p className="text-xs font-semibold text-neutral-400">Step {i + 1}</p>
                <h4 className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">{s.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Hardware */}
      <section>
        <SectionHeading eyebrow="The hardware" title="What's out in the yard" />
        <div className="grid gap-4">
          <SignalFlow />
          <PixelChain />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hardware.map((h) => (
            <div key={h.title} className={`${card} p-5`}>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{h.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{h.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Look for these around the house:</p>
          <ul className="flex flex-wrap gap-2">
            {props.map((p) => (
              <li key={p} className="rounded-full border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300">{p}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
