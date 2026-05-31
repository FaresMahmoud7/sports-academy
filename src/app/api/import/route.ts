import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';
import { BELTS, calculateAgeAndCategory } from '@/lib/constants';
import Coach from '@/models/Coach';
import { verifyAuth } from '@/lib/auth';

interface RawImportRow {
  name?: string;
  birthYear?: any;
  belt?: string;
  parentPhone?: string;
  registered?: any;
  coachName?: string;
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { action, players } = body;

    if (!Array.isArray(players)) {
      return NextResponse.json(
        { error: 'Players must be a valid array' },
        { status: 400 }
      );
    }

    if (action === 'validate') {
      const validatedPlayers = [];

      for (const row of players as RawImportRow[]) {
        const errors: string[] = [];
        let isDuplicate = false;

        const name = row.name?.trim() || '';
        const rawBirthYear = parseInt(row.birthYear, 10);
        const parentPhone = row.parentPhone?.trim() || '';
        let belt = (row.belt?.trim() || 'White') as any;
        
        // Normalize belt spelling if possible
        const foundBelt = BELTS.find(
          (b) => b.toLowerCase() === belt.toLowerCase()
        );
        if (foundBelt) {
          belt = foundBelt;
        } else {
          errors.push(`حزام غير معروف: "${belt}". تم تعيين الأبيض تلقائياً.`);
          belt = 'White';
        }

        if (!name) {
          errors.push('الاسم الكامل مطلوب.');
        }

        if (isNaN(rawBirthYear) || rawBirthYear < 1930 || rawBirthYear > 2026) {
          errors.push('سنة الميلاد غير صالحة.');
        }

        if (!parentPhone) {
          errors.push('رقم هاتف ولي الأمر مطلوب.');
        }

        // Normalize registered
        let registered = false;
        if (row.registered !== undefined) {
          if (typeof row.registered === 'boolean') {
            registered = row.registered;
          } else {
            const regStr = String(row.registered).trim().toLowerCase();
            registered =
              regStr === 'نعم' ||
              regStr === 'true' ||
              regStr === 'yes' ||
              regStr === '1' ||
              regStr === 'مسجل';
          }
        }

        // Automatic categorization helper
        let age = 0;
        let category = 'Unknown';
        if (!isNaN(rawBirthYear)) {
          const stats = calculateAgeAndCategory(rawBirthYear);
          age = stats.age;
          category = stats.category;
        }

        // Duplicate checks
        if (name && !isNaN(rawBirthYear)) {
          const existing = await Player.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            birthYear: rawBirthYear,
          });
          if (existing) {
            isDuplicate = true;
          }
        }

        validatedPlayers.push({
          name,
          birthYear: isNaN(rawBirthYear) ? '' : rawBirthYear,
          age,
          belt,
          parentPhone,
          registered,
          category,
          errors,
          isDuplicate,
        });
      }

      return NextResponse.json({ success: true, validatedPlayers });
    }

    if (action === 'commit') {
      const results = {
        successCount: 0,
        failCount: 0,
        duplicatesSkipped: 0,
        errors: [] as string[],
      };

      for (const row of players) {
        try {
          const { name, birthYear, belt, parentPhone, registered, coachId, notes, trainingDays } = row;

          // Double check database duplicates to avoid races
          const existing = await Player.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            birthYear: Number(birthYear),
          });

          if (existing) {
            results.duplicatesSkipped++;
            continue;
          }

          const newPlayer = new Player({
            name: name.trim(),
            birthYear: Number(birthYear),
            belt,
            parentPhone: parentPhone.trim(),
            registered: registered === true,
            coachId: coachId && mongoose.Types.ObjectId.isValid(coachId) ? coachId : null,
            notes: notes || '',
            trainingDays: Array.isArray(trainingDays) ? trainingDays : [],
          });

          await newPlayer.save();

          if (newPlayer.coachId) {
            await Coach.findByIdAndUpdate(newPlayer.coachId, {
              $addToSet: { players: newPlayer._id },
            });
          }

          results.successCount++;
        } catch (err: any) {
          results.failCount++;
          results.errors.push(`خطأ في استيراد ${row.name || 'لاعب غير معروف'}: ${err.message}`);
        }
      }

      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
