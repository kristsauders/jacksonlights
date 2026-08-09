"use client";
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// NOTE: there used to be a full-screen "Loading Jackson Lights..." overlay here.
// It rendered during SSR too, so the very first paint was a spinner covering
// real, already-delivered content, and the page stayed hidden until React had
// downloaded, hydrated and run a 100ms timer. Removing it means the server-
// rendered page is visible immediately.

export function Providers({ children }: { children: ReactNode }) {
  // For now: force dark. To re-enable system detection later, set enableSystem
  // and defaultTheme="system".
  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="dark"
      storageKey="jl-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
