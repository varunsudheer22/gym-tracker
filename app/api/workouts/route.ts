import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Workout } from '@/models/Workout';
import mongoose from 'mongoose';
import { requireAuth } from '../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface ISet {
  reps: number;
  weight: number;
  notes?: string;
}

interface IExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ISet[];
}

interface IWorkout {
  workoutDayId: string;
  workoutDayName: string;
  date: string;
  exercises: IExercise[];
}

interface IWorkoutDocument {
  _id: mongoose.Types.ObjectId;
  workoutDayId: mongoose.Types.ObjectId;
  exercises: Array<{
    exerciseId: mongoose.Types.ObjectId;
    exerciseName: string;
    sets: ISet[];
  }>;
  date: Date;
  [key: string]: any;
}

interface IWorkoutExercise {
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  sets: ISet[];
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Cap at 50
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1); // Minimum page 1
    const skip = (page - 1) * limit;

    const workouts = await Workout.find({ userId: session.user.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as IWorkoutDocument[];

    const total = await Workout.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      workouts: workouts.map((workout: IWorkoutDocument) => ({
        ...workout,
        _id: workout._id.toString(),
        workoutDayId: workout.workoutDayId.toString(),
        exercises: workout.exercises.map(exercise => ({
          ...exercise,
          exerciseId: exercise.exerciseId.toString()
        })),
        date: new Date(workout.date).toISOString()
      })),
      total,
      hasMore: total > skip + limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in GET /api/workouts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const data = await req.json() as IWorkout;
    const { workoutDayId, workoutDayName, date, exercises } = data;

    // Validate required fields
    if (!workoutDayId || !workoutDayName || !date || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate workoutDayId format
    if (!mongoose.Types.ObjectId.isValid(workoutDayId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout day ID format' },
        { status: 400 }
      );
    }

    // Validate exercises array
    for (const exercise of exercises) {
      if (!exercise.exerciseId || !exercise.exerciseName || !Array.isArray(exercise.sets)) {
        return NextResponse.json(
          { success: false, error: 'Invalid exercise data format' },
          { status: 400 }
        );
      }

      if (!mongoose.Types.ObjectId.isValid(exercise.exerciseId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid exercise ID format' },
          { status: 400 }
        );
      }

      for (const set of exercise.sets) {
        if (typeof set.reps !== 'number' || typeof set.weight !== 'number') {
          return NextResponse.json(
            { success: false, error: 'Invalid set data format' },
            { status: 400 }
          );
        }
      }
    }

    const workout = new Workout({
      userId: session.user.id,
      workoutDayId: new mongoose.Types.ObjectId(workoutDayId),
      workoutDayName,
      date: new Date(date),
      exercises: exercises.map((exercise: IExercise) => ({
        exerciseId: new mongoose.Types.ObjectId(exercise.exerciseId),
        exerciseName: exercise.exerciseName,
        sets: exercise.sets.map((set: ISet) => ({
          reps: set.reps,
          weight: set.weight,
          notes: set.notes || ''
        }))
      }))
    });

    await workout.save();

    return NextResponse.json({ 
      success: true, 
      workout: {
        ...workout.toObject(),
        _id: workout._id.toString(),
        workoutDayId: workout.workoutDayId.toString(),
        exercises: workout.exercises.map((exercise: IWorkoutExercise) => ({
          ...exercise,
          exerciseId: exercise.exerciseId.toString()
        })),
        date: workout.date.toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/workouts:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid workout data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const workoutId = searchParams.get('id');

    if (!workoutId) {
      return NextResponse.json(
        { success: false, error: 'Workout ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout ID format' },
        { status: 400 }
      );
    }

    const workout = await Workout.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(workoutId),
      userId: session.user.id
    });

    if (!workout) {
      return NextResponse.json(
        { success: false, error: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/workouts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
} 