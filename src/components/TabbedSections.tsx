"use client";
import { Activity, Fragment, ViewTransition, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Tabs from './Tabs';
import Playlist from './Playlist';

// Only the default tab (see DEFAULT_TAB) is part of the initial bundle. Everything
// else is fetched when its tab is first opened. The admin dashboard lives on its
// own page (/admin) so visitors never see or download it.
const panelLoading = () => (
  <div className="animate-pulse space-y-3 py-4" aria-hidden="true">
    <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
    <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
    <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
  </div>
);

const PhotoCarousel = dynamic(() => import('./PhotoCarousel'), { loading: panelLoading });
const VideoGallery = dynamic(() => import('./VideoGallery'), { loading: panelLoading });
const ShowInfo = dynamic(() => import('./ShowInfo'), { loading: panelLoading });
const PostsFeed = dynamic(() => import('./PostsFeed'), { loading: panelLoading });
const SongRequests = dynamic(() => import('./SongRequests'), { loading: panelLoading });
const FeedbackForm = dynamic(() => import('./FeedbackForm'), { loading: panelLoading });

// The tab shown when the site loads. While the show is running, picking the
// next song is the main thing people do. Before the season it was 'photos', for
// the behind-the-scenes posts people followed along with.
const DEFAULT_TAB = 'songs';

// Tab ids double as URL hashes (#songs, #photos, ...), so any link on the page
// pointing at one switches to that tab.
const TABS = [
  { id: 'songs', label: 'Songs' },
  { id: 'photos', label: 'Photos & Videos', short: 'Photos' },
  { id: 'about', label: 'About' },
  { id: 'feedback', label: 'Feedback' },
];
const TAB_IDS = new Set(TABS.map((t) => t.id));

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-1">{title}</h2>
    </div>
  );
}

const PANELS: Record<string, () => ReactNode> = {
  songs: () => <Playlist />,
  photos: () => (
    <div className="space-y-14">
      <section>
        <PanelHeading eyebrow="Behind the scenes" title="Getting ready for the season" />
        <PostsFeed />
      </section>
      <section>
        <PanelHeading eyebrow="From past shows" title="Photos & videos" />
        <div className="space-y-8">
          <PhotoCarousel />
          <VideoGallery />
        </div>
      </section>
    </div>
  ),
  about: () => <ShowInfo />,
  feedback: () => (
    <div className="grid gap-5 lg:grid-cols-2 items-start">
      <SongRequests />
      <FeedbackForm />
    </div>
  ),
};

// Panels that keep their state (search text, expanded categories, half-typed
// forms) when you switch away, using <Activity> to hide rather than unmount
// them. Deliberately NOT the media panel: a hidden panel's DOM stays alive, so
// a playing YouTube embed or <video> would keep making sound after you left.
const KEEP_ALIVE = new Set(['songs', 'feedback']);

export default function TabbedSections() {
  const [active, setActive] = useState(DEFAULT_TAB);
  // A keep-alive panel is only mounted once it has been opened, so its lazy
  // chunk still isn't downloaded until needed.
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([DEFAULT_TAB]));
  const rootRef = useRef<HTMLDivElement>(null);

  const changeTab = useCallback((id: string, { scroll = 'ifPast' }: { scroll?: 'always' | 'ifPast' } = {}) => {
    setActive(id);
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    // The tab bar sticks to the top while scrolling, so a switch made from far
    // down a long panel would otherwise land mid-way through the new one.
    const root = rootRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    if (scroll === 'always' || top < 0) window.scrollTo({ top: top + window.scrollY - 8, behavior: 'smooth' });
  }, []);

  // Open the tab named in the URL hash, and let any in-page link to a tab
  // (href="#songs" etc.) switch to it rather than jump to a missing anchor.
  useEffect(() => {
    function fromHash() {
      const id = location.hash.slice(1);
      if (TAB_IDS.has(id)) changeTab(id, { scroll: 'always' });
    }
    fromHash();

    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (!id || !TAB_IDS.has(id)) return;
      e.preventDefault();
      changeTab(id, { scroll: 'always' });
    }
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', fromHash);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', fromHash);
    };
  }, [changeTab]);

  // ping visits endpoint once per mount (fire and forget)
  useEffect(() => {
    fetch('/api/metrics/visit', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <div ref={rootRef}>
      <div className="sticky top-2 z-30 mb-5 sm:mb-6">
        <Tabs tabs={TABS} active={active} onChange={changeTab} />
      </div>
      <div>
        {TABS.map(({ id }) => {
          const keepAlive = KEEP_ALIVE.has(id);
          if (active !== id && !(keepAlive && visited.has(id))) return null;
          const panel = (
            <ViewTransition enter="auto" exit="auto" default="none">
              <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
                {PANELS[id]()}
              </div>
            </ViewTransition>
          );
          return keepAlive ? (
            <Activity key={id} mode={active === id ? 'visible' : 'hidden'}>
              {panel}
            </Activity>
          ) : (
            <Fragment key={id}>{panel}</Fragment>
          );
        })}
      </div>
    </div>
  );
}
