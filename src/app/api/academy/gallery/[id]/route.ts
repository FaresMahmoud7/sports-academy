import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';
import { verifyAuth } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { imageUrl, caption } = body;

    const item = await GalleryItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (caption !== undefined) item.caption = caption;

    await item.save();
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const item = await GalleryItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    await GalleryItem.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
