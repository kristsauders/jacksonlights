"use client";
import { useEffect, useState } from 'react';

const ADDRESS = '4 Jackson Street Beacon NY';
const ENCODED = encodeURIComponent(ADDRESS);
const WEB_HREF = `https://maps.google.com/?daddr=${ENCODED}`;

/**
 * The "Visit" card. Split out of HeroHeader so the header itself can stay a
 * server component — this is the only part that needs to look at the user
 * agent to pick a native maps deep link.
 */
export default function MapLink({ className, children }: { className: string; children: React.ReactNode }) {
  // Start on the universal web link so SSR and first paint agree, then upgrade
  // to a native deep link after mount.
  const [href, setHref] = useState(WEB_HREF);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/iP(hone|ad|od)/i.test(ua)) setHref(`maps://?daddr=${ENCODED}`);
    else if (/Android/i.test(ua)) setHref(`geo:0,0?q=${ENCODED}`);
  }, []);

  const isWeb = href.startsWith('http');

  return (
    <a
      href={href}
      {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={className}
      aria-label={`Open directions to ${ADDRESS} in maps`}
    >
      {children}
    </a>
  );
}
