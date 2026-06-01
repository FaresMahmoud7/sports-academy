import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';
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
    const { name, profileImageUrl, reviewText, rating } = body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    if (name !== undefined) testimonial.name = name;
    if (profileImageUrl !== undefined) testimonial.profileImageUrl = profileImageUrl;
    if (reviewText !== undefined) testimonial.reviewText = reviewText;
    if (rating !== undefined) testimonial.rating = rating;

    await testimonial.save();
    return NextResponse.json(testimonial);
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
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

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    await Testimonial.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
