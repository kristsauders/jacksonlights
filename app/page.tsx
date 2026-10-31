import { Suspense } from 'react';
import ShowStatus from '../src/components/ShowStatus';
import TabbedSections from '../src/components/TabbedSections';
import HeroHeader from '../src/components/HeroHeader';
import PreseasonBanner from '../src/components/PreseasonBanner';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
    </div>
  );
}

export default function HomePage() {
  return (
    // overflow-x-clip rather than -hidden: hidden turns <main> into a scroll
    // container, which stops the tab bar from sticking to the viewport.
    <main className="relative overflow-x-clip">
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
        <HeroHeader />

        <PreseasonBanner />

        <ShowStatus />

        <div className="pt-4 sm:pt-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabbedSections />
          </Suspense>
        </div>

        <footer className="pt-12 pb-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Jackson Lights. Built with love & LEDs.</p>
        </footer>
      </div>
    </main>
  );
}
