"use client";
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect } from 'react';

// Wrapper to ensure system theme respected even if an old localStorage key existed.
export function Providers({ children }: { children: ReactNode }) {
  // For now: force dark. To re-enable system detection later, set enableSystem and defaultTheme="system".
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
