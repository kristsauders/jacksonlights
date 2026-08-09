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
    <main className="relative overflow-x-hidden">
      <div className="twinkle-layer" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 pt-5 sm:pt-7 pb-6 sm:pb-8 space-y-3 sm:space-y-14">
        <HeroHeader />

        <PreseasonBanner />

        <section aria-labelledby="status-heading" className="space-y-7 sm:space-y-9 -mt-4 sm:-mt-2">
          <h2 id="status-heading" className="sr-only">Current Show Status</h2>
          <Suspense fallback={<LoadingSkeleton />}>
            <ShowStatus />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <TabbedSections />
          </Suspense>
        </section>

        <footer className="pt-12 pb-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Jackson Lights. Built with love & LEDs.</p>
        </footer>
      </div>
    </main>
  );
}
