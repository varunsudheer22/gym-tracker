import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Goal } from '@/models/Goal';
import mongoose from 'mongoose';
import { Session } from 'next-auth';
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

    const goals = await Goal.find({ userId: session.user.id })
      .sort({ targetDate: 1 });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error('Error in GET /api/goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const data = await req.json();
    const { exerciseId, exerciseName, targetWeight, targetReps, targetDate, notes } = data;

    const goal = new Goal({
      userId: session.user.id,
      exerciseId: new mongoose.Types.ObjectId(exerciseId),
      exerciseName,
      targetWeight,
      targetReps,
      targetDate: new Date(targetDate),
      notes: notes || ''
    });

    await goal.save();

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('Error in POST /api/goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('id');

    if (!goalId) {
      return NextResponse.json(
        { success: false, error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const goal = await Goal.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(goalId),
      userId: session.user.id
    });

    if (!goal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
} 