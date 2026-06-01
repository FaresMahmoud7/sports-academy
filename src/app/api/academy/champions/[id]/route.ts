import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Champion from '@/models/Champion';
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
    const { name, photoUrl, ageCategory, sportCategory, achievements, socialLinks } = body;

    const champion = await Champion.findById(id);
    if (!champion) {
      return NextResponse.json({ error: 'Champion not found' }, { status: 404 });
    }

    if (name !== undefined) champion.name = name;
    if (photoUrl !== undefined) champion.photoUrl = photoUrl;
    if (ageCategory !== undefined) champion.ageCategory = ageCategory;
    if (sportCategory !== undefined) champion.sportCategory = sportCategory;
    if (achievements !== undefined) champion.achievements = achievements;
    if (socialLinks !== undefined) champion.socialLinks = socialLinks;

    await champion.save();
    return NextResponse.json(champion);
  } catch (error: any) {
    console.error('Error updating champion:', error);
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

    const champion = await Champion.findById(id);
    if (!champion) {
      return NextResponse.json({ error: 'Champion not found' }, { status: 404 });
    }

    await Champion.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting champion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
