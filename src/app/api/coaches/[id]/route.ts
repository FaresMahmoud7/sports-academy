import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Coach from '@/models/Coach';
import Player from '@/models/Player';
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
    const { name, phone, trainingDays, trainingTime, players } = body;

    const coach = await Coach.findById(id);
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    coach.name = name ?? coach.name;
    coach.phone = phone ?? coach.phone;
    coach.trainingDays = Array.isArray(trainingDays) ? trainingDays : coach.trainingDays;
    coach.trainingTime = trainingTime ?? coach.trainingTime;

    if (Array.isArray(players)) {
      // 1. Set coachId to null for players previously assigned to this coach
      await Player.updateMany({ coachId: id }, { coachId: null });

      // 2. Set coachId to this coach for the newly assigned players
      const validObjectIds = players.filter((pid: string) => mongoose.Types.ObjectId.isValid(pid));
      if (validObjectIds.length > 0) {
        await Player.updateMany(
          { _id: { $in: validObjectIds } },
          { coachId: id }
        );
      }

      // 3. Update the coach's players list field
      coach.players = validObjectIds.map((pid: string) => new mongoose.Types.ObjectId(pid));
    }

    await coach.save();

    // Re-populate players to return the updated record
    const updatedCoach = await Coach.findById(id).populate({
      path: 'players',
      select: 'name birthYear age belt registered parentPhone',
    });

    return NextResponse.json(updatedCoach);
  } catch (error: any) {
    console.error('Error updating coach:', error);
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

    const coach = await Coach.findById(id);
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Unassign this coach from all associated players
    await Player.updateMany({ coachId: id }, { coachId: null });

    await Coach.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coach:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
