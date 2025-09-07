import ShowStatus from '../src/components/ShowStatus';
import TabbedSections from '../src/components/TabbedSections';
import HeroHeader from '../src/components/HeroHeader';
import PreseasonBanner from '../src/components/PreseasonBanner';

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="absolute inset-0 opacity-15 dark:opacity-30 bg-twinkle bg-[length:24px_24px] motion-safe:dark:animate-[twinkleShift_40s_linear_infinite]" aria-hidden="true" />
  <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 pt-5 sm:pt-7 pb-6 sm:pb-8 space-y-3 sm:space-y-14">
  <HeroHeader />

  <PreseasonBanner />

  <section aria-labelledby="status-heading" className="space-y-7 sm:space-y-9 -mt-4 sm:-mt-2">
          <h2 id="status-heading" className="sr-only">Current Show Status</h2>
          <ShowStatus />
          <TabbedSections />
        </section>

        <footer className="pt-12 pb-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Jackson Lights. Built with love & LEDs.</p>
        </footer>
      </div>
    </main>
  );
}
