import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'donations.json');

interface DonationData { total:number; }

async function readData(): Promise<DonationData> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { total: 0 };
  }
}

async function writeData(data: DonationData) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return NextResponse.json({ message:'Invalid amount' }, { status:400 });
    const data = await readData();
    data.total += amt;
    await writeData(data);
    return NextResponse.json(data, { status:201 });
  } catch (e:any) {
    console.error('Donation error', e);
    return NextResponse.json({ message:'Server error' }, { status:500 });
  }
}
