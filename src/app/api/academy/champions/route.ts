import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Champion from '@/models/Champion';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const champions = await Champion.find({}).sort({ createdAt: -1 });
    return NextResponse.json(champions);
  } catch (error: any) {
    console.error('Error fetching champions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { name, photoUrl, ageCategory, sportCategory, achievements, socialLinks } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const champion = await Champion.create({
      name,
      photoUrl: photoUrl || '/logo.jpg',
      ageCategory: ageCategory || '',
      sportCategory: sportCategory || '',
      achievements: achievements || '',
      socialLinks: socialLinks || { facebook: '', instagram: '' },
    });

    return NextResponse.json(champion, { status: 201 });
  } catch (error: any) {
    console.error('Error creating champion:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
