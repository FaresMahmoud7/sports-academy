import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';
import Coach from '@/models/Coach';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const belt = searchParams.get('belt') || '';
    const category = searchParams.get('category') || '';
    const coachId = searchParams.get('coachId') || '';
    const registered = searchParams.get('registered') || '';

    const filterQuery: any = {};

    if (search) {
      filterQuery.name = { $regex: search, $options: 'i' };
    }
    if (belt) {
      filterQuery.belt = belt;
    }
    if (category) {
      filterQuery.category = category;
    }
    if (coachId) {
      filterQuery.coachId = coachId === 'null' ? null : coachId;
    }
    if (registered) {
      filterQuery.registered = registered === 'true';
    }

    const players = await Player.find(filterQuery)
      .populate('coachId', 'name phone')
      .sort({ name: 1 });

    return NextResponse.json(players);
  } catch (error: any) {
    console.error('Error fetching players:', error);
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
    const {
      name,
      birthYear,
      belt,
      danDegree,
      parentPhone,
      registered,
      coachId,
      notes,
      trainingDays,
    } = body;

    if (!name || !birthYear || !parentPhone) {
      return NextResponse.json(
        { error: 'Name, birth year, and parent phone number are required' },
        { status: 400 }
      );
    }

    const newPlayer = new Player({
      name,
      birthYear: Number(birthYear),
      belt,
      danDegree: belt === 'Black Belt' ? Number(danDegree || 1) : undefined,
      parentPhone,
      registered: registered === true || registered === 'true',
      coachId: coachId && coachId !== 'null' ? coachId : null,
      notes,
      trainingDays: Array.isArray(trainingDays) ? trainingDays : [],
    });

    await newPlayer.save();

    // If a coach was assigned, add player to coach's players list
    if (newPlayer.coachId) {
      await Coach.findByIdAndUpdate(newPlayer.coachId, {
        $addToSet: { players: newPlayer._id },
      });
    }

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
