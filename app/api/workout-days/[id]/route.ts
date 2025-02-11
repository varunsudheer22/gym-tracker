import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WorkoutDay } from '@/models/WorkoutDay';
import mongoose from 'mongoose';
import { requireAuth } from '../../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Reference to the in-memory storage from the parent route
// TODO: Replace with MongoDB queries
declare const workoutDays: { id: string; name: string; }[];

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const workoutDay = await WorkoutDay.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(params.id),
        userId: session.user.id
      },
      { name },
      { new: true, runValidators: true }
    );

    if (!workoutDay) {
      return NextResponse.json(
        { success: false, error: 'Workout day not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, workoutDay });
  } catch (error: any) {
    console.error('Error in PUT /api/workout-days/[id]:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A workout day with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update workout day' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Workout day ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout day ID format' },
        { status: 400 }
      );
    }

    const workoutDay = await WorkoutDay.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: session.user.id
    });

    if (!workoutDay) {
      return NextResponse.json(
        { success: false, error: 'Workout day not found' },
        { status: 404 }
      );
    }

    // Also delete associated exercises
    // TODO: Add this when implementing exercise deletion
    // await Exercise.deleteMany({ workoutDayId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/workout-days/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workout day' },
      { status: 500 }
    );
  }
} 