import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), 'public', 'Players and Coaches');
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(dirPath);
    const result = files.map(file => ({
      name: file,
      url: `/Players and Coaches/${encodeURIComponent(file)}`,
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
