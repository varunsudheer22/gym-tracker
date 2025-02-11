import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, category, workoutDayId, defaultSets, defaultReps, notes } = await request.json();
    
    if (!name || !workoutDayId) {
      return NextResponse.json(
        { success: false, error: 'Name and workout day are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const exercise = await Exercise.findByIdAndUpdate(
      params.id,
      { 
        name, 
        workoutDayId,
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
    console.error('Error updating exercise:', error);

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const exercise = await Exercise.findByIdAndDelete(params.id);

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
} 