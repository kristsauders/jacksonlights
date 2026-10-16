"use client";
import { Activity, Fragment, ViewTransition, useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Tabs from './Tabs';
import Playlist from './Playlist';
import AdminPanel from './AdminPanel';

// Only the default tab (see DEFAULT_TAB) is part of the initial bundle. Everything
// else is fetched when its tab is first opened.
//
// This matters most for AdminDashboard: it imports recharts, so every visitor
// was downloading a charting library to render a dashboard only the family can
// see. ShowInfo, PostsFeed and the gallery panels are similarly large.
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
const AdminDashboard = dynamic(
  () => import('./AdminDashboard').then((m) => m.AdminDashboard),
  { loading: panelLoading, ssr: false }
);

// The tab shown when the site loads.
const DEFAULT_TAB = 'posts';

const TABS = [
  { id: 'playlist', label: 'Song List' },
  { id: 'gallery', label: 'Gallery' }, // Combined Photos + Videos
  { id: 'info', label: 'About Us' },
  { id: 'requests', label: 'Requests & Feedback' }, // Combined Requests + Feedback
  { id: 'posts', label: 'Behind the Scenes' },
  { id: 'admin', label: 'Admin' },
];

const PANELS: Record<string, () => ReactNode> = {
  playlist: () => <Playlist />,
  gallery: () => (
    <div className="space-y-12">
      <PhotoCarousel />
      <VideoGallery />
    </div>
  ),
  info: () => <ShowInfo />,
  requests: () => (
    <div className="space-y-12">
      <SongRequests />
      <FeedbackForm />
    </div>
  ),
  posts: () => <PostsFeed />,
  admin: () => (
    <AdminPanel>
      <AdminDashboard />
    </AdminPanel>
  ),
};

// Panels that keep their state (search text, expanded categories, half-typed
// forms, admin session) when you switch away, using <Activity> to hide rather
// than unmount them. Deliberately NOT the media panels: a hidden panel's DOM
// stays alive, so a playing YouTube embed or <video> would keep making sound
// after you left the tab.
const KEEP_ALIVE = new Set(['playlist', 'requests', 'admin']);

export default function TabbedSections() {
  const [active, setActive] = useState(DEFAULT_TAB);
  // A keep-alive panel is only mounted once it has been opened, so its lazy
  // chunk (and recharts, for admin) still isn't downloaded until needed.
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([DEFAULT_TAB]));

  function changeTab(id: string) {
    setActive(id);
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  // ping visits endpoint once per mount (fire and forget)
  useEffect(() => {
    fetch('/api/metrics/visit', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <div>
      <Tabs tabs={TABS} initial={active} onChange={changeTab} />
      <div className="mt-3 sm:mt-4">
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
