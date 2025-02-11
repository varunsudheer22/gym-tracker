import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models/Exercise';
import mongoose from 'mongoose';
import { requireAuth } from '../../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { name, category, workoutDayId, defaultSets, defaultReps, notes } = await req.json();
    
    if (!name || !workoutDayId) {
      return NextResponse.json(
        { success: false, error: 'Name and workout day are required' },
        { status: 400 }
      );
    }

    const exercise = await Exercise.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(params.id),
        userId: session.user.id
      },
      { 
        name, 
        workoutDayId: new mongoose.Types.ObjectId(workoutDayId),
        category: category || 'Other',
        defaultSets,
        defaultReps,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, exercise });
  } catch (error: any) {
    console.error('Error in PUT /api/exercises/[id]:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An exercise with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update exercise' },
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
        { success: false, error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }

    const exercise = await Exercise.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: session.user.id
    });

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/exercises/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
} 