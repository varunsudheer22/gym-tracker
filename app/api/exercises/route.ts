import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Exercise, IExercise } from '@/models';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get workoutDayId from query params if provided
    const { searchParams } = new URL(request.url);
    const workoutDayId = searchParams.get('workoutDayId');
    
    // Build query based on whether workoutDayId is provided
    let query: any = { userId: session.user.email };
    
    if (workoutDayId) {
      try {
        query.workoutDayId = new mongoose.Types.ObjectId(workoutDayId);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid workout day ID format' },
          { status: 400 }
        );
      }
    }
    
    const exercises = await Exercise.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, category, workoutDayId, defaultSets, defaultReps, notes } = body;
    
    if (!name || !workoutDayId) {
      return NextResponse.json(
        { success: false, error: 'Name and workout day are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = session.user.email;

    // Convert workoutDayId to ObjectId and validate
    let workoutDayObjectId;
    try {
      workoutDayObjectId = new mongoose.Types.ObjectId(workoutDayId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout day ID format' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const exerciseData: Partial<IExercise> = {
      name: name.trim(),
      workoutDayId: workoutDayObjectId,
      category: category?.trim() || 'Other',
      userId
    };

    // Only add optional numeric fields if they are valid numbers
    if (typeof defaultSets === 'number' && !isNaN(defaultSets)) {
      exerciseData.defaultSets = defaultSets;
    }
    if (typeof defaultReps === 'number' && !isNaN(defaultReps)) {
      exerciseData.defaultReps = defaultReps;
    }
    if (notes?.trim()) {
      exerciseData.notes = notes.trim();
    }

    const exercise = await Exercise.create(exerciseData);

    return NextResponse.json({ 
      success: true, 
      exercise: {
        _id: exercise._id,
        name: exercise.name,
        category: exercise.category,
        workoutDayId: exercise.workoutDayId.toString(),
        defaultSets: exercise.defaultSets,
        defaultReps: exercise.defaultReps,
        notes: exercise.notes
      }
    });
  } catch (error: any) {
    console.error('Error creating exercise:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An exercise with this name already exists for this user' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
} 