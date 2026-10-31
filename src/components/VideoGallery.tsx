"use client";
interface Video { id: string; title: string; description?: string; }

const videos: Video[] = [
  { id: '6GcqgGBDs8w', title: '2025 Show' },
  { id: 'y-hlHrKudu4', title: '2024 Main Show' },
  { id: 'MYDBp6gIzjg', title: '2024 Kids Show' }
];

export default function VideoGallery() {
  return (
    <ul className="grid gap-5 sm:gap-6 md:grid-cols-2" aria-label="Show videos">
      {videos.map((v, i) => (
        // The newest show gets the full width; older ones sit two to a row.
        <li key={v.id} className={`space-y-2 ${i === 0 ? 'md:col-span-2' : ''}`}>
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-200 dark:bg-white/5">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="px-0.5">
            <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">{v.title}</h3>
            {v.description && <p className="meta-text">{v.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
