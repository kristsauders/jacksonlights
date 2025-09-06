"use client";
import useSWR from 'swr';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function VoteChart() {
  const { data, error } = useSWR('/api/status', fetcher, { refreshInterval: 30000 });
  const votes: any[] = data?.votes || [];

  const chartData = useMemo(() => {
    return votes
      .map(v => ({
        name: v.sequence?.displayName || v.sequence?.name || '—',
        votes: v.votes || 0
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);
  }, [votes]);

  if (error) return <div role="alert" className="text-red-600 text-sm">Error loading votes</div>;
  if (!chartData.length) return <p className="text-xs text-neutral-600 dark:text-neutral-400">No votes yet.</p>;

  const colors = ['#BF2C31', '#008B6B', '#E2C044', '#4b5563', '#9333ea'];

  return (
    <div className="h-64" aria-label="Top voted songs bar chart" role="figure">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="votes" radius={[4,4,0,0]}> {
            chartData.map((entry, idx) => <Cell key={entry.name} fill={colors[idx % colors.length]} />)
          } </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="sr-only">Bar chart of top voted songs</p>
    </div>
  );
}
