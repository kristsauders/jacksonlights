import type { Metadata } from 'next';
import AdminArea from '../../src/components/AdminArea';

// Family-only page, moved out of the public tabs. Not linked from the site and
// kept out of search results; the API behind it still requires the password.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">Admin</h1>
        <a href="/" className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline">← Back to site</a>
      </div>
      <AdminArea />
    </main>
  );
}
