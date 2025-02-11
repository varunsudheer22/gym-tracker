import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Workout } from '@/models/Workout';
import mongoose from 'mongoose';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { requireAuth } from '../../auth/auth-utils';

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

interface IExerciseLog {
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  sets: ISet[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');
    const timeRange = searchParams.get('timeRange');

    if (!exerciseId) {
      return NextResponse.json(
        { success: false, error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    // Calculate date range based on timeRange parameter
    let startDate = new Date(0); // Default to earliest possible date
    const endDate = new Date(); // Current date

    switch (timeRange) {
      case '1m':
        startDate = startOfMonth(subMonths(new Date(), 1));
        break;
      case '3m':
        startDate = startOfMonth(subMonths(new Date(), 3));
        break;
      case '6m':
        startDate = startOfMonth(subMonths(new Date(), 6));
        break;
      case '1y':
        startDate = startOfMonth(subMonths(new Date(), 12));
        break;
      // Default to all time if no valid timeRange is provided
    }

    // Find all workouts that contain the specified exercise within the date range
    interface WorkoutQuery {
      userId: string;
      date: { $gte: Date; $lte: Date };
      'exercises.exerciseId'?: mongoose.Types.ObjectId;
      'exercises.exerciseName'?: string;
    }

    let query: WorkoutQuery = {
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate }
    };

    // Only add exerciseId to query if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(exerciseId)) {
      query['exercises.exerciseId'] = new mongoose.Types.ObjectId(exerciseId);
    } else {
      // If not a valid ObjectId, try matching by exercise name
      query['exercises.exerciseName'] = exerciseId;
    }

    const workouts = await Workout.find(query).sort({ date: 1 });

    // Process workouts to extract exercise data
    const exerciseData = workouts.map(workout => {
      const exercise = workout.exercises.find(
        (e: IExerciseLog) => 
          (mongoose.Types.ObjectId.isValid(exerciseId) && e.exerciseId.toString() === exerciseId) ||
          e.exerciseName === exerciseId
      );

      if (!exercise) return null;

      // Calculate max weight and total volume for the exercise
      const maxWeight = Math.max(...exercise.sets.map((set: ISet) => Number(set.weight) || 0));
      const totalVolume = exercise.sets.reduce((sum: number, set: ISet) => 
        sum + (Number(set.weight) || 0) * (Number(set.reps) || 0)
      , 0);

      return {
        date: workout.date.toISOString().split('T')[0],
        maxWeight: maxWeight.toString(),
        totalVolume: totalVolume.toString(),
        sets: exercise.sets
      };
    }).filter(Boolean);

    return NextResponse.json({ success: true, data: exerciseData });
  } catch (error: any) {
    console.error('Error fetching exercise data:', error);

    // Handle invalid ObjectId
    if (error.name === 'BSONError') {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercise data' },
      { status: 500 }
    );
  }
} 