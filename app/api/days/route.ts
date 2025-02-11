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
    console.error('Error in GET /api/days:', error);
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

    const data = await req.json();
    const { name, notes } = data;

    const workoutDay = new WorkoutDay({
      userId: session.user.id,
      name,
      notes: notes || ''
    });

    await workoutDay.save();

    return NextResponse.json({ success: true, workoutDay });
  } catch (error) {
    console.error('Error in POST /api/days:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workout day' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const workoutDayId = searchParams.get('id');

    if (!workoutDayId) {
      return NextResponse.json(
        { success: false, error: 'Workout day ID is required' },
        { status: 400 }
      );
    }

    const workoutDay = await WorkoutDay.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(workoutDayId),
      userId: session.user.id
    });

    if (!workoutDay) {
      return NextResponse.json(
        { success: false, error: 'Workout day not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/days:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workout day' },
      { status: 500 }
    );
  }
} 