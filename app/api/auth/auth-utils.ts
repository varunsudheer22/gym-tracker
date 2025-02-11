import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './config';
import { Session } from 'next-auth';

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  return session;
}

export async function requireAuth(): Promise<Session | NextResponse> {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return session;
} 
