"use client";
interface Video { id: string; title: string; description?: string; }

const videos: Video[] = [
  { id: 'y-hlHrKudu4', title: '2024 Main Show' },
  { id: 'MYDBp6gIzjg', title: '2024 Kids Show' }
];

export default function VideoGallery() {
  return (
    <div className="grid gap-6" aria-label="Video gallery feed">
      {videos.map(v => (
        <div key={v.id} className="space-y-2">
          <div className="aspect-video w-full rounded-xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 bg-neutral-200 dark:bg-neutral-800">
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
        </div>
      ))}
    </div>
  );
}
