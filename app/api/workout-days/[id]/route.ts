import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WorkoutDay } from '@/models';
import mongoose from 'mongoose';

// Reference to the in-memory storage from the parent route
// TODO: Replace with MongoDB queries
declare const workoutDays: { id: string; name: string; }[];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const workoutDay = await WorkoutDay.findByIdAndUpdate(
      params.id,
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
    console.error('Error updating workout day:', error);

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    await connectDB();

    const workoutDay = await WorkoutDay.findByIdAndDelete(params.id);

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
    console.error('Error deleting workout day:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workout day' },
      { status: 500 }
    );
  }
} 