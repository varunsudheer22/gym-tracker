import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Achievement } from '@/models';
import mongoose from 'mongoose';
import { requireAuth } from '../auth/auth-utils';
import { Session } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('status' in authResult) return authResult;
    const session = authResult as Session;

    await connectDB();
    
    const achievements = await Achievement.find({ userId: session.user.email })
      .sort({ earnedAt: -1 });
      
    return NextResponse.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// This endpoint is internal only - achievements are created by the system
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('status' in authResult) return authResult;
    const session = authResult as Session;

    const body = await request.json();
    const { type, name, description, value, exerciseId, exerciseName } = body;
    
    if (!type || !name || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const achievement = await Achievement.create({
      userId: session.user.email,
      type,
      name,
      description,
      value,
      exerciseId: exerciseId ? new mongoose.Types.ObjectId(exerciseId) : undefined,
      exerciseName
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error: any) {
    console.error('Error creating achievement:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid achievement data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
} 