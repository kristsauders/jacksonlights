import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Metrics { visits:number; lastVisitAt?:string; }

const metricsPath = path.join(process.cwd(), 'data', 'metrics.json');
async function readMetrics(): Promise<Metrics> { try { return JSON.parse(await fs.readFile(metricsPath,'utf8')); } catch { return { visits:0 }; } }
async function writeMetrics(m:Metrics){ await fs.writeFile(metricsPath, JSON.stringify(m,null,2),'utf8'); }

export async function POST(){
  const metrics = await readMetrics();
  metrics.visits += 1;
  metrics.lastVisitAt = new Date().toISOString();
  await writeMetrics(metrics);
  return NextResponse.json({ ok:true });
}
