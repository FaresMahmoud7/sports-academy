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

    // Flatten nested object into dot-notation so $set updates individual paths
    // e.g. { about: { imageUrl: '...' } } => { 'about.imageUrl': '...' }
    function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
      return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const val = obj[key];
        if (
          val !== null &&
          typeof val === 'object' &&
          !Array.isArray(val) &&
          !(val instanceof Date)
        ) {
          Object.assign(acc, flattenObject(val, fullKey));
        } else {
          acc[fullKey] = val;
        }
        return acc;
      }, {});
    }

    const flatBody = flattenObject(body);

    const updatedContent = await AcademyContent.findOneAndUpdate(
      { key: 'academy_data' },
      { $set: flatBody },
      { new: true, upsert: true, runValidators: false, strict: false }
    );

    return NextResponse.json(updatedContent);
  } catch (error: any) {
    console.error('Error updating academy content:', error?.message, error?.stack);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
