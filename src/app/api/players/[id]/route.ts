import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';
import Coach from '@/models/Coach';
import { verifyAuth } from '@/lib/auth';

export async function GET(
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

    const player = await Player.findById(id).populate('coachId', 'name phone');
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error: any) {
    console.error('Error fetching player details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const oldPlayer = await Player.findById(id);
    if (!oldPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

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
      trainingType,
    } = body;

    // Use findOneAndUpdate to trigger the pre-update hooks for age/category calculation
    const updatedPlayer = await Player.findOneAndUpdate(
      { _id: id },
      {
        name,
        birthYear: Number(birthYear),
        belt,
        danDegree: belt === 'Black Belt' ? Number(danDegree || 1) : undefined,
        parentPhone,
        registered: registered === true || registered === 'true',
        coachId: coachId && coachId !== 'null' ? coachId : null,
        notes,
        trainingDays: Array.isArray(trainingDays) ? trainingDays : [],
        trainingType: trainingType || '',
      },
      { new: true, runValidators: true }
    );

    if (!updatedPlayer) {
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
    }

    // Synchronize coach references
    const oldCoachId = oldPlayer.coachId?.toString();
    const newCoachId = updatedPlayer.coachId?.toString();

    if (oldCoachId !== newCoachId) {
      // Remove from old coach
      if (oldCoachId) {
        await Coach.findByIdAndUpdate(oldCoachId, {
          $pull: { players: id },
        });
      }
      // Add to new coach
      if (newCoachId) {
        await Coach.findByIdAndUpdate(newCoachId, {
          $addToSet: { players: id },
        });
      }
    }

    return NextResponse.json(updatedPlayer);
  } catch (error: any) {
    console.error('Error updating player:', error);
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

    const player = await Player.findById(id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Remove from assigned coach
    if (player.coachId) {
      await Coach.findByIdAndUpdate(player.coachId, {
        $pull: { players: id },
      });
    }

    await Player.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
