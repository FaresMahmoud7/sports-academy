import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AcademyContent from '@/models/AcademyContent';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    let content = await AcademyContent.findOne({ key: 'academy_data' });
    if (!content) {
      // Create default singleton settings if none exists
      content = await AcademyContent.create({ key: 'academy_data' });
    }
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error fetching academy content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const updatedContent = await AcademyContent.findOneAndUpdate(
      { key: 'academy_data' },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(updatedContent);
  } catch (error: any) {
    console.error('Error updating academy content:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
