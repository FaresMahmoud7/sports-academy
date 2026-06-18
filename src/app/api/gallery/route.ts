import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';
import { verifyAuth } from '@/lib/auth';

// GET all gallery items (public)
export async function GET() {
  try {
    await dbConnect();
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: add new gallery item
export async function POST(request: Request) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const { imageUrl, caption } = body;
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    const item = new GalleryItem({ imageUrl, caption });
    await item.save();
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
