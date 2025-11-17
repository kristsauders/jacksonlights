"use client";
import useSWR from 'swr';
import { useState, useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Category mapping: add new sequences here as they're created
const CATEGORY_MAP: Record<string, 'Christmas' | 'Pop & Electronic' | 'Kids' | 'Other'> = {
  // Christmas
  "Alxxa - It's the Most Wonderful Time of the Year": 'Christmas',
  "Alxxa - It's the Most Wonderful Time of the Year PPD 2025 40fps": 'Christmas',
  "Alicia Moffett - Winter Wonderland": 'Christmas',
  "Alicia Moffett - Winter Wonderland 2025 40fps": 'Christmas',
  "Biometrix - Silent Night": 'Christmas',
  "Crowder - The Elf Song": 'Christmas',
  "Kaskade - Jingle Bells": 'Christmas',
  "Kaskade - Christmas is Here": 'Christmas',
  "Mariah Carey - All I Want For Christmas Is You": 'Christmas',
  "Megan Trainor - My Kind Of Present": 'Christmas',
  "Meghan Trainor - Holidays": 'Christmas',
  "Meghan Trainor - I Believe In Santa": 'Christmas',
  "Polar Express - Hot Chocolate": 'Christmas',
  "Pop Christmas Song Mashup": 'Christmas',
  "Samuel Kim - Imperial March x Carol of the Bells": 'Christmas',
  "Sia - Candy Cane Lane": 'Christmas',
  "Sia - Candy Cane Lane 2025 40fps": 'Christmas',
  "Small Town Titans - You're a Mean One, Mr": 'Christmas',
  "Snoop Dogg - Doggy Dogg Christmas": 'Christmas',
  
  // Pop & Electronic
  "Ajr - Bang!": 'Pop & Electronic',
  "Chappell Roan - Pink Pony Club": 'Pop & Electronic',
  "Chappell Roan - Pink Pony Club 2025 40fps": 'Pop & Electronic',
  "Coldplay - A Sky Full Of Stars": 'Pop & Electronic',
  "Daft Punk - Pentatonix 2025 40fps": 'Pop & Electronic',
  "Dua Lipa - Dance The Night": 'Pop & Electronic',
  "Dua Lipa - Dance The Night 2025 40fps": 'Pop & Electronic',
  "Dua Lipa - Levitating": 'Pop & Electronic',
  "Elton John and Dua Lipa - Cold Heart (PNAU Remix)": 'Pop & Electronic',
  "Flo Rida - My House": 'Pop & Electronic',
  "Imagine Dragons - Believer": 'Pop & Electronic',
  "Imagine Dragons - Believer (Long)": 'Pop & Electronic',
  "Journey - Don't Stop Believin": 'Pop & Electronic',
  "Jung Kook - Standing Next to You": 'Pop & Electronic',
  "Jung Kook - Standing Next to You 2025 40fps": 'Pop & Electronic',
  "Lindsey Stirling - Magic": 'Pop & Electronic',
  "Majestic x Boney M - Rasputin": 'Pop & Electronic',
  "Mark Ronson - Uptown Funk": 'Pop & Electronic',
  "Muse - Supermassive Black Hole": 'Pop & Electronic',
  "Ruelle - Mad World 2025 40fps": 'Pop & Electronic',
  "Sabrina Carpenter - Espresso": 'Pop & Electronic',
  "Sabrina Carpenter - Espresso [Clean] 2025 40fps": 'Pop & Electronic',
  "Tai Verdes - AOK": 'Pop & Electronic',
  "The Weeknd - Blinding Lights": 'Pop & Electronic',
  "The Weeknd feat Ariana Grande - Save Your Tears (Remix) 2025 40fps": 'Pop & Electronic',
  "Tiesto - The Business": 'Pop & Electronic',
  
  // Kids
  "Frozen -  Let It Go": 'Kids',
  "Frozen 2 - Into the Unknown (Panic! At The Disco Version)": 'Kids',
  "I Am A Gummy Bear": 'Kids',
  "It's Raining Tacos": 'Kids',
  "Jack Hartmann - Tooty Ta": 'Kids',
  "KPop Demon Hunters - Golden 2025 40fps": 'Kids',
  "Kpop Demon Hunters Movie Version 2025 40fps": 'Kids',
};

function categorize(displayName: string): 'Christmas' | 'Pop & Electronic' | 'Kids' | 'Other' {
  // Try exact match first
  if (CATEGORY_MAP[displayName]) {
    return CATEGORY_MAP[displayName];
  }
  
  // Try with "2025 40fps" removed for backward compatibility
  const normalized = displayName.replace(/\s*2025\s*40fps\s*$/i, '').trim();
  return CATEGORY_MAP[normalized] || 'Other';
}

export default function Playlist() {
  // Hooks must always run in consistent order – keep all before any conditional returns
  const { data, error, isLoading } = useSWR('/api/status', fetcher, { refreshInterval: 30000 });
  const [query, setQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([]));
  const [requestingSeq, setRequestingSeq] = useState<string | null>(null);
  const [successSeq, setSuccessSeq] = useState<string | null>(null);

  const sequences = (data?.sequences || []) as any[];
  const viewerControlEnabled = data?.preferences?.viewerControlEnabled ?? false;
  
  // Group by category and filter by search
  const grouped = useMemo(() => {
    const categories: Record<string, any[]> = {
      'Christmas': [],
      'Pop & Electronic': [],
      'Kids': [],
      'Other': []
    };
    
    sequences.forEach(s => {
      const cat = categorize(s.displayName);
      const matchesQuery = !query || s.displayName?.toLowerCase().includes(query.toLowerCase());
      if (matchesQuery) {
        categories[cat].push(s);
      }
    });
    
    return categories;
  }, [sequences, query]);

  const totalFiltered = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  async function handleRequest(sequence: string) {
    // Check if viewer control is enabled before sending request
    if (!viewerControlEnabled) {
      alert('Song requests are currently disabled. Please try again when the show is active!');
      return;
    }
    
    setRequestingSeq(sequence);
    try {
      const res = await fetch('/api/request', { method: 'POST', body: JSON.stringify({ sequence }) });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      // If response is OK (200), treat it as success
      // Remote Falcon API returns 200 when request is accepted
      setSuccessSeq(sequence);
      setTimeout(() => setSuccessSeq(null), 2000);
    } catch (e: any) {
      alert(e.message || 'Unable to request the song right now.');
    } finally {
      setRequestingSeq(null);
    }
  }

  function toggleCategory(cat: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {!viewerControlEnabled && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/50 p-3 sm:p-4">
          <p className="text-sm text-amber-900 dark:text-amber-200 font-medium mb-1">
            ⚠️ Requests Currently Disabled
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Song requests are disabled right now. Check back when the show is running to request your favorites!
          </p>
        </div>
      )}
      {viewerControlEnabled && (
        <div className="rounded-lg bg-brand-green/10 dark:bg-brand-green/15 border border-brand-green/30 dark:border-brand-green/40 p-3 sm:p-4">
          <p className="text-sm text-neutral-800 dark:text-neutral-200 font-medium mb-1">
            🎵 Choose a Song
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Browse our song list below and click "Play Next" on any song to hear it right away. You can request multiple songs and they will be queued up too!
          </p>
        </div>
      )}
      {error && <div role="alert" className="text-red-600">Error loading playlist</div>}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-xs font-medium" htmlFor="filter">Search:</label>
          <input id="filter" aria-label="Search songs" value={query} onChange={e => setQuery(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" placeholder="Type to filter" />
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-500">{totalFiltered} songs</p>
      </div>
      
      {(isLoading && !sequences.length) ? (
        <div className="space-y-4">
          {['Christmas', 'Pop & Electronic', 'Kids', 'Other'].map(cat => (
            <div key={cat} className="animate-pulse">
              <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-2" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(['Christmas', 'Pop & Electronic', 'Kids', 'Other'] as const).map(cat => {
            const songs = grouped[cat];
            const isExpanded = expandedCategories.has(cat);
            if (songs.length === 0) return null;
            
            return (
              <div key={cat} className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-brand-cream/40 via-white/50 to-brand-gold/30 dark:from-brand-pine/30 dark:via-neutral-900/50 dark:to-brand-green/20 hover:from-brand-cream/60 hover:via-white/70 hover:to-brand-gold/50 dark:hover:from-brand-pine/40 dark:hover:via-neutral-900/70 dark:hover:to-brand-green/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-maroon dark:text-brand-gold">{cat}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">({songs.length})</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-brand-maroon dark:text-brand-gold transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {songs.map(seq => {
                        const cleanDisplayName = seq.displayName.replace(/\s*2025\s*40fps\s*$/i, '').trim();
                        const isRequesting = requestingSeq === seq.name;
                        const isSuccess = successSeq === seq.name;
                        return (
                          <div key={seq.name} className="p-3 sm:p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col shadow-sm">
                            <h3 className="font-medium text-sm" aria-label={`Song ${cleanDisplayName}`}>{cleanDisplayName}</h3>
                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                              {seq.duration ? `${Math.floor(seq.duration/60)}m ${seq.duration%60}s` : 'Duration unknown'}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button 
                                onClick={() => handleRequest(seq.name)} 
                                disabled={isRequesting || !viewerControlEnabled}
                                className={`focus-ring flex-1 text-[11px] sm:text-xs rounded border font-medium py-1.5 transition-all ${
                                  isSuccess 
                                    ? 'border-green-500 bg-green-500 text-white' 
                                    : 'border-brand-green/40 bg-brand-green/10 dark:bg-brand-green/15 text-brand-green dark:text-brand-gold hover:bg-brand-green/20 dark:hover:bg-brand-green/25'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isRequesting ? 'Requesting...' : isSuccess ? '✓ Requested!' : 'Play Next'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {totalFiltered === 0 && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center py-8">No songs match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
