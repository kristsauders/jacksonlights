"use client";
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading screen after a brief delay once React has hydrated
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-neutral-950 transition-opacity duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-200 dark:border-green-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-green-700 dark:border-t-green-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 animate-pulse">
          Loading Jackson Lights...
        </p>
      </div>
    </div>
  );
}

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
      <LoadingScreen />
      {children}
    </ThemeProvider>
  );
}
