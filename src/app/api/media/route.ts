import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';
import Champion from '@/models/Champion';
import { verifyAuth } from '@/lib/auth';

// GET: fetch all gallery items and champions for the CMS
export async function GET() {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const gallery = await GalleryItem.find().sort({ createdAt: -1 });
    const champions = await Champion.find().sort({ createdAt: -1 });
    return NextResponse.json({ gallery, champions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
