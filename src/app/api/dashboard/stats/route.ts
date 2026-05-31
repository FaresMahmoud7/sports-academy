import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';
import { BELTS } from '@/lib/constants';
import Coach from '@/models/Coach';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const totalPlayers = await Player.countDocuments();
    const totalCoaches = await Coach.countDocuments();
    const registeredCount = await Player.countDocuments({ registered: true });
    const nonRegisteredCount = totalPlayers - registeredCount;

    // Group players by belt, preserving ranking order and showing 0 counts
    const beltCounts: Record<string, number> = {};
    BELTS.forEach((belt) => {
      beltCounts[belt] = 0;
    });

    const players = await Player.find({});
    players.forEach((p) => {
      if (p.belt && beltCounts[p.belt] !== undefined) {
        beltCounts[p.belt]++;
      }
    });

    const beltGroups = BELTS.map((belt) => ({
      name: belt,
      count: beltCounts[belt],
    }));

    // Group players by age category
    const defaultCategories = [
      'Under 6',
      'Under 8',
      'Under 10',
      'Under 12',
      'Teens',
      'Adults',
    ];
    const categoryCounts: Record<string, number> = {};
    defaultCategories.forEach((cat) => {
      categoryCounts[cat] = 0;
    });

    players.forEach((p) => {
      const cat = p.category || 'Adults';
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts[cat] = 1;
      }
    });

    const categoryGroups = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      count: categoryCounts[cat],
    }));

    return NextResponse.json({
      totalPlayers,
      totalCoaches,
      registeredCount,
      nonRegisteredCount,
      beltGroups,
      categoryGroups,
    });
  } catch (error: any) {
    console.error('Stats aggregation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
