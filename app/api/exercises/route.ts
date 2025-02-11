import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models/Exercise';
import mongoose from 'mongoose';
import { requireAuth } from '../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface IExercise {
  name: string;
  category: string;
  workoutDayId?: string;
  defaultSets?: number;
  defaultReps?: number;
  notes?: string;
}

interface IExerciseDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  workoutDayId?: mongoose.Types.ObjectId;
  defaultSets?: number;
  defaultReps?: number;
  notes?: string;
  userId: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const exercises = await Exercise.find({ userId: session.user.id })
      .sort({ name: 1 })
      .lean() as IExerciseDocument[];

    return NextResponse.json({ 
      success: true, 
      exercises: exercises.map(exercise => ({
        ...exercise,
        _id: exercise._id.toString(),
        workoutDayId: exercise.workoutDayId?.toString()
      }))
    });
  } catch (error) {
    console.error('Error in GET /api/exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const data = await req.json() as IExercise;
    const { name, category, workoutDayId, defaultSets, defaultReps, notes } = data;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Validate workoutDayId if provided
    if (workoutDayId && !mongoose.Types.ObjectId.isValid(workoutDayId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout day ID format' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (defaultSets && (!Number.isInteger(defaultSets) || defaultSets < 1)) {
      return NextResponse.json(
        { success: false, error: 'Default sets must be a positive integer' },
        { status: 400 }
      );
    }

    if (defaultReps && (!Number.isInteger(defaultReps) || defaultReps < 1)) {
      return NextResponse.json(
        { success: false, error: 'Default reps must be a positive integer' },
        { status: 400 }
      );
    }

    const exercise = new Exercise({
      userId: session.user.id,
      name,
      category,
      workoutDayId: workoutDayId ? new mongoose.Types.ObjectId(workoutDayId) : undefined,
      defaultSets,
      defaultReps,
      notes: notes || ''
    });

    await exercise.save();

    return NextResponse.json({ 
      success: true, 
      exercise: {
        ...exercise.toObject(),
        _id: exercise._id.toString(),
        workoutDayId: exercise.workoutDayId?.toString()
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/exercises:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An exercise with this name already exists' },
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const exerciseId = searchParams.get('id');

    if (!exerciseId) {
      return NextResponse.json(
        { success: false, error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }

    const exercise = await Exercise.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(exerciseId),
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
    console.error('Error in DELETE /api/exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
} 