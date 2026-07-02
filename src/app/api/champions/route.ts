import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Champion from '@/models/Champion';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all champions (public)
export async function GET() {
  try {
    await dbConnect();
    const items = await Champion.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: add new champion
export async function POST(request: Request) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const { name, photoUrl, ageCategory, sportCategory, achievements, socialLinks } = body;
    if (!name || !photoUrl) return NextResponse.json({ error: 'name and photoUrl are required' }, { status: 400 });
    const item = new Champion({ name, photoUrl, ageCategory: ageCategory || '', sportCategory: sportCategory || '', achievements: achievements || '', socialLinks: socialLinks || {} });
    await item.save();
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
