import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, username: admin.username });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
