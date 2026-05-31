import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { verifyAuth, setAuthCookie } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const adminDoc = await Admin.findById(admin.id);
    if (!adminDoc) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ username: adminDoc.username });
  } catch (error: any) {
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
    const { username, currentPassword, newPassword } = body;

    const adminDoc = await Admin.findById(admin.id);
    if (!adminDoc) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify current password first if changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'كلمة المرور الحالية مطلوبة لتحديث كلمة المرور الجديدة.' },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, adminDoc.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'كلمة المرور الحالية غير صحيحة.' },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      adminDoc.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    if (username && username.trim() !== adminDoc.username) {
      // Check if username is already taken
      const existing = await Admin.findOne({ username: username.trim() });
      if (existing && String(existing._id) !== String(adminDoc._id)) {
        return NextResponse.json(
          { error: 'اسم المستخدم هذا مستخدم بالفعل.' },
          { status: 400 }
        );
      }
      adminDoc.username = username.trim();
    }

    await adminDoc.save();

    // Re-issue the auth cookie with the updated username
    await setAuthCookie({ id: adminDoc.id || String(adminDoc._id), username: adminDoc.username });

    return NextResponse.json({ success: true, username: adminDoc.username });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
