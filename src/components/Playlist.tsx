"use client";
import useSWR, { useSWRConfig } from 'swr';
import { useState, useMemo } from 'react';
import { fetcher, statusSwrConfig } from '../lib/swr';

// Category mapping: add new sequences here as they're created
const CATEGORY_MAP: Record<string, 'Christmas' | 'Pop' | 'Electronic' | 'Kids' | 'Other'> = {
  // Christmas
  "Alxxa - It's the Most Wonderful Time of the Year": 'Christmas',
  "Alxxa - It's the Most Wonderful Time of the Year PPD 2025 40fps": 'Christmas',
  "Alicia Moffett - Winter Wonderland": 'Christmas',
  "Alicia Moffett - Winter Wonderland 2025 40fps": 'Christmas',
  "Biometrix - Silent Night": 'Christmas',
  "Kaskade - Jingle Bells": 'Christmas',
  "Kaskade - Christmas is Here": 'Christmas',
  "Mariah Carey - All I Want For Christmas Is You": 'Christmas',
  "Megan Trainor - My Kind Of Present": 'Christmas',
  "Meghan Trainor - Holidays": 'Christmas',
  "Meghan Trainor - I Believe In Santa": 'Christmas',
  "Polar Express - Hot Chocolate": 'Christmas',
  "Pop Christmas Song Mashup": 'Christmas',
  "Sia - Candy Cane Lane": 'Christmas',
  "Sia - Candy Cane Lane 2025 40fps": 'Christmas',
  "Small Town Titans - You're a Mean One, Mr": 'Christmas',
  "Snoop Dogg - Doggy Dogg Christmas": 'Christmas',
  "Sia - Santa's Coming For Us": 'Christmas',
  "The Pretty Reckless - Where Are You Christmas": 'Christmas',
  "Alicia Moffet - Winter Wonderland": 'Christmas',
  "Jack Johnson - Rudolph The Red Nosed Reindeer": 'Christmas',
  "Kaskade - Christmas Is Here": 'Christmas',
  "LalalaGirl - Christmas Mashup 2016": 'Christmas',
  "Meghan Trainor - My Kind of Present": 'Christmas',
  "Pentatonix - Pure Imagination Christmas Time Is Here": 'Christmas',
  "Samuel Kim - Imperial March x Carol of the Bells": 'Christmas',
  "The Waitresses - Christmas Wrapping": 'Christmas',
  "The Waitresses - Christmas Wrapping (v1)": 'Christmas',
  "Tommee Profitt - We Three Kings": 'Christmas',
  
  // Pop
  "Ajr - Bang!": 'Pop',
  "Chappell Roan - Pink Pony Club": 'Pop',
  "Chappell Roan - Pink Pony Club 2025 40fps": 'Pop',
  "Coldplay - A Sky Full Of Stars": 'Pop',
  "Daft Punk - Pentatonix 2025 40fps": 'Pop',
  "Dua Lipa - Dance The Night": 'Pop',
  "Dua Lipa - Dance The Night 2025 40fps": 'Pop',
  "Dua Lipa - Levitating": 'Pop',
  "Elton John and Dua Lipa - Cold Heart (PNAU Remix)": 'Pop',
  "Flo Rida - My House": 'Pop',
  "Imagine Dragons - Believer": 'Pop',
  "Imagine Dragons - Believer (Long)": 'Pop',
  "Journey - Don't Stop Believin": 'Pop',
  "Jung Kook - Standing Next to You": 'Pop',
  "Jung Kook - Standing Next to You 2025 40fps": 'Pop',
  "Lindsey Stirling - Magic": 'Pop',
  "Mark Ronson - Uptown Funk": 'Pop',
  "Muse - Supermassive Black Hole": 'Pop',
  "Ruelle - Mad World 2025 40fps": 'Pop',
  "Sabrina Carpenter - Espresso": 'Pop',
  "Sabrina Carpenter - Espresso [Clean] 2025 40fps": 'Pop',
  "Tai Verdes - AOK": 'Pop',
  "The Weeknd - Blinding Lights": 'Pop',
  "The Weeknd feat Ariana Grande - Save Your Tears (Remix) 2025 40fps": 'Pop',
  "Alex Warren - Ordinary": 'Pop',
  "AJR - Bang!": 'Pop',
  "Bebe Rexha - New Religion": 'Pop',
  "Beyonce - Texas Hold 'Em": 'Pop',
  "Elton John & Dua Lipa - Cold Heart": 'Pop',
  "Journey - Don't Stop Believin'": 'Pop',
  "Lindsey Stirling ft. David Archuleta - Magic": 'Pop',
  "Mark Ronson ft. Bruno Mars - Uptown Funk": 'Pop',
  "Masked Wolf - Astronaut in the Ocean": 'Pop',
  "Muse - Nightshift Superstar": 'Pop',
  "Pentatonix - Daft Punk": 'Pop',
  "Pink - Get the Party Started": 'Pop',
  "Post Malone - Sunflower": 'Pop',
  "Ruelle - Madness": 'Pop',
  "Tai Verdes - A-O-K": 'Pop',
  "Tommee Profitt - Mad World": 'Pop',
  
  // Electronic
  "Majestic x Boney M - Rasputin": 'Electronic',
  "Tiesto - The Business": 'Electronic',
  "Teddy Swims - Lose Control (Tiesto Remix)": 'Electronic',
  "Major Lazer - Lean On": 'Electronic',
  "Zombic & Felix Schorn - Zombie (Remix)": 'Electronic',
  "Luude - Down Under": 'Electronic',
  "Majestic x Boney M. - Rasputin": 'Electronic',
  
  // Kids
  "Frozen -  Let It Go": 'Kids',
  "Frozen 2 - Into the Unknown (Panic! At The Disco Version)": 'Kids',
  "Frozen - Into the Unknown (Panic! At The Disco Version)": 'Kids',
  "I Am A Gummy Bear": 'Kids',
  "It's Raining Tacos": 'Kids',
  "Jack Hartmann - Tooty Ta": 'Kids',
  "KPop Demon Hunters - Golden 2025 40fps": 'Kids',
  "Kpop Demon Hunters Movie Version 2025 40fps": 'Kids',
  "KPop Demon Hunters - Your Idol": 'Kids',
  "Parry Gripp - It's Raining Tacos On Christmas Eve": 'Kids',
  "Crowder - The Elf Song": 'Kids',
  "Cynthia Erivo & Ariana Grande - Defying Gravity": 'Kids',
  "Griff - Pure Imagination": 'Kids',
  "Gummibar - I Am A Gummy Bear": 'Kids',
  "Idina Menzel - Let It Go": 'Kids',
  "KPop Demon Hunters - Golden": 'Kids',
  "Panic! At The Disco - Into the Unknown": 'Kids',
  "Wicked - Defying Gravity": 'Kids',

};

function categorize(displayName: string): 'Christmas' | 'Pop' | 'Electronic' | 'Kids' | 'Other' {
  // Try exact match first
  if (CATEGORY_MAP[displayName]) {
    return CATEGORY_MAP[displayName];
  }
  
  // Try with "2025 40fps" removed for backward compatibility
  const normalized = displayName.replace(/\s*2025\s*40fps\s*$/i, '').trim();
  return CATEGORY_MAP[normalized] || 'Other';
}

interface VoteRow { name: string; displayName?: string; votes: number; lastVoteTime?: string }

// Most votes first. On a tie the song that reached the count first stays ahead.
function rankVotes(raw: unknown): VoteRow[] {
  if (!Array.isArray(raw)) return [];
  return [...(raw as VoteRow[])].sort((a, b) =>
    b.votes - a.votes || String(a.lastVoteTime ?? '').localeCompare(String(b.lastVoteTime ?? '')));
}

function VoteStandings({ standings }: { standings: VoteRow[] }) {
  const top = standings.slice(0, 10);
  return (
    <section aria-label="Current voting standings" className="rounded-lg border border-brand-gold/50 bg-gradient-to-br from-brand-cream/60 to-white/70 dark:from-brand-pine/40 dark:to-neutral-900/70 p-3 sm:p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-maroon dark:text-brand-gold mb-2">Top Votes</h3>
      {top.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">No votes yet. Be the first to vote!</p>
      ) : (
        <ol className="space-y-1.5">
          {top.map((v, i) => (
            <li key={v.name} className="flex items-center gap-3 text-sm">
              <span className={`w-6 shrink-0 text-center font-bold ${i === 0 ? 'text-brand-maroon dark:text-brand-gold' : 'text-neutral-500'}`}>{i === 0 ? '🏆' : i + 1}</span>
              <span className={`flex-1 min-w-0 truncate ${i === 0 ? 'font-semibold' : ''}`}>{cleanSongName(v.displayName || v.name)}</span>
              <span className="shrink-0 tabular-nums text-xs font-semibold text-brand-green dark:text-brand-gold">{v.votes} {v.votes === 1 ? 'vote' : 'votes'}</span>
            </li>
          ))}
        </ol>
      )}
      {top.length > 0 && <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">The top song plays next. Updates every few seconds.</p>}
    </section>
  );
}

// The season's headline production: its own set of songs mixed into one long
// sequence. It gets its own card above the song list instead of sitting in a
// category, to invite people to watch it all.
const isFullShow = (s: { displayName?: string }) => /full show/i.test(s.displayName ?? '');

function FeaturedShow({ seq, voting, enabled, votes, requesting, success, onPick }: {
  seq: any; voting: boolean; enabled: boolean; votes?: number;
  requesting: boolean; success: boolean; onPick: () => void;
}) {
  const year = seq.displayName.match(/20\d\d/)?.[0];
  const minutes = seq.duration ? Math.floor(seq.duration / 60) : null;
  const label = voting
    ? (requesting ? 'Voting...' : success ? '✓ Voted!' : 'Vote for the Full Show')
    : (requesting ? 'Requesting...' : success ? '✓ Requested!' : 'Play the Full Show');
  return (
    <section aria-label="Featured: the full show" className="relative overflow-hidden rounded-xl border border-brand-gold/60 bg-gradient-to-br from-brand-maroon/10 via-brand-cream/60 to-brand-gold/30 dark:from-brand-maroon/30 dark:via-neutral-900/80 dark:to-brand-green/30 p-4 sm:p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-maroon dark:text-brand-gold">★ The Main Event</p>
      <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100">The Full {year ? `${year} ` : ''}Show 🎄</h3>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            Our big {year ? `${year} ` : ''}production: lots of brand-new songs mixed seamlessly together, with a dramatic intro and more.{minutes ? <> It runs about <strong>{minutes} minutes</strong>, so grab a cocoa and stay for the whole thing!</> : ' Grab a cocoa and stay for the whole thing!'}
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Want something shorter? There are lots of other songs to choose from below.
          </p>
          {voting && !!votes && <p className="mt-1 text-xs font-semibold text-brand-green dark:text-brand-gold">{votes} {votes === 1 ? 'vote' : 'votes'}</p>}
        </div>
        <button
          onClick={onPick}
          disabled={requesting || !enabled}
          className={`focus-ring shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold shadow transition ${success ? 'bg-green-600 text-white' : 'bg-brand-green text-white hover:bg-brand-pine'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >{label}</button>
      </div>
    </section>
  );
}

const cleanSongName = (name: string) => name.replace(/\s*2025\s*40fps\s*$/i, '').trim();

export default function Playlist() {
  // Hooks must always run in consistent order – keep all before any conditional returns
  const { data, error, isLoading } = useSWR('/api/status', fetcher, statusSwrConfig);
  const { mutate } = useSWRConfig();
  const [query, setQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([]));
  const [requestingSeq, setRequestingSeq] = useState<string | null>(null);
  const [successSeq, setSuccessSeq] = useState<string | null>(null);

  const sequences = (data?.sequences || []) as any[];
  const viewerControlEnabled = data?.preferences?.viewerControlEnabled ?? false;
  // Remote Falcon runs the show in one of two modes: JUKEBOX (a request plays
  // next, in order) or VOTING (everyone votes and the leader plays next).
  const voting = data?.preferences?.viewerControlMode === 'VOTING';
  const standings = useMemo(() => rankVotes(data?.votes), [data?.votes]);
  const voteCounts = useMemo(() => new Map(standings.map(v => [v.name, v.votes])), [standings]);
  
  // Group by category and filter by search
  const grouped = useMemo(() => {
    const categories: Record<string, any[]> = {
      'Christmas': [],
      'Pop': [],
      'Electronic': [],
      'Kids': [],
      'Other': []
    };
    
    sequences.forEach(s => {
      if (isFullShow(s)) return; // shown on its own card
      const cat = categorize(s.displayName);
      const matchesQuery = !query || s.displayName?.toLowerCase().includes(query.toLowerCase());
      if (matchesQuery) {
        categories[cat].push(s);
      }
    });
    
    return categories;
  }, [sequences, query]);

  const fullShow = useMemo(() => sequences.find(isFullShow), [sequences]);

  const totalFiltered = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  async function handleRequest(sequence: string) {
    // Check if viewer control is enabled before sending request
    if (!viewerControlEnabled) {
      alert(voting ? 'Voting is closed right now. Please try again when the show is active!' : 'Song requests are currently disabled. Please try again when the show is active!');
      return;
    }
    
    setRequestingSeq(sequence);
    try {
      const res = await fetch(voting ? '/api/vote' : '/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || (voting ? 'Vote failed' : 'Request failed'));
      }
      
      // If response is OK (200), treat it as success
      // Remote Falcon API returns 200 when request is accepted
      setSuccessSeq(sequence);
      setTimeout(() => setSuccessSeq(null), 2000);
      // Show the new tally right away instead of waiting for the next poll.
      if (voting) mutate('/api/status');
    } catch (e: any) {
      alert(e.message || (voting ? 'Unable to cast your vote right now.' : 'Unable to request the song right now.'));
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
            {voting ? '⚠️ Voting Currently Closed' : '⚠️ Requests Currently Disabled'}
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {voting
              ? 'Voting is closed right now. Check back when the show is running to vote for your favorites!'
              : 'Song requests are disabled right now. Check back when the show is running to request your favorites!'}
          </p>
        </div>
      )}
      {viewerControlEnabled && (
        <div className="rounded-lg bg-brand-green/10 dark:bg-brand-green/15 border border-brand-green/30 dark:border-brand-green/40 p-3 sm:p-4">
          <p className="text-sm text-neutral-800 dark:text-neutral-200 font-medium mb-1">
            {voting ? '🗳️ Vote for the Next Song' : '🎵 Choose a Song'}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {voting
              ? 'Browse our song list below and tap "Vote" on your favorite. The song with the most votes plays next, then the next most popular, and so on. Rally your friends to push your song to the top!'
              : 'Browse our song list below and click "Play Next" on any song to hear it right away. You can request multiple songs and they will be queued up too!'}
          </p>
        </div>
      )}
      {voting && viewerControlEnabled && <VoteStandings standings={standings} />}
      {fullShow && (
        <FeaturedShow
          seq={fullShow}
          voting={voting}
          enabled={viewerControlEnabled}
          votes={voteCounts.get(fullShow.name)}
          requesting={requestingSeq === fullShow.name}
          success={successSeq === fullShow.name}
          onPick={() => handleRequest(fullShow.name)}
        />
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
          {['Christmas', 'Pop', 'Electronic', 'Kids', 'Other'].map(cat => (
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
          {(['Christmas', 'Pop', 'Electronic', 'Kids', 'Other'] as const).map(cat => {
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
                              {voting && voteCounts.has(seq.name) && <span className="ml-2 font-semibold text-brand-green dark:text-brand-gold">· {voteCounts.get(seq.name)} {voteCounts.get(seq.name) === 1 ? 'vote' : 'votes'}</span>}
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
                                {voting
                                  ? (isRequesting ? 'Voting...' : isSuccess ? '✓ Voted!' : 'Vote')
                                  : (isRequesting ? 'Requesting...' : isSuccess ? '✓ Requested!' : 'Play Next')}
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
