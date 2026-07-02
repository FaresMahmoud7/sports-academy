import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const items = await GalleryItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching gallery items:', error);
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
    const { imageUrl, caption } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const item = await GalleryItem.create({
      imageUrl,
      caption: caption || 'أبطال الأكاديمية أثناء التدريبات الجماعية',
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
