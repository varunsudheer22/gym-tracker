import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WorkoutDay } from '@/models/WorkoutDay';
import mongoose from 'mongoose';
import { requireAuth } from '../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const workoutDays = await WorkoutDay.find({ userId: session.user.id })
      .sort({ name: 1 });

    return NextResponse.json({ success: true, workoutDays });
  } catch (error) {
    console.error('Error in GET /api/workout-days:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workout days' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const workoutDay = await WorkoutDay.create({
      name,
      userId: session.user.id
    });

    return NextResponse.json({ 
      success: true, 
      workoutDay 
    });
  } catch (error: any) {
    console.error('Error in POST /api/workout-days:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A workout day with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create workout day' },
      { status: 500 }
    );
  }
} 