import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coach from '@/models/Coach';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const coaches = await Coach.find({})
      .populate({
        path: 'players',
        select: 'name birthYear age belt registered parentPhone fileNumber',
      })
      .sort({ name: 1 });

    return NextResponse.json(coaches);
  } catch (error: any) {
    console.error('Error fetching coaches:', error);
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
    const { name, phone, trainingDays, trainingTime } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Coach name is required' },
        { status: 400 }
      );
    }

    const newCoach = new Coach({
      name,
      phone,
      trainingDays: Array.isArray(trainingDays) ? trainingDays : [],
      trainingTime,
      players: [],
    });

    await newCoach.save();

    return NextResponse.json(newCoach, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coach:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
