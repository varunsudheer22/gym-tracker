import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Workout, IExerciseLog, ISet } from '@/models';
import mongoose from 'mongoose';
import { requireAuth } from '../../auth/auth-utils';
import { Session } from 'next-auth';
import { startOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('status' in authResult) return authResult;
    const session = authResult as Session;

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');
    const timeRange = searchParams.get('timeRange');

    if (!exerciseId) {
      return NextResponse.json(
        { success: false, error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

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
    const query = {
      userId: session.user.email,
      date: { $gte: startDate, $lte: endDate },
      'exercises.exerciseId': new mongoose.Types.ObjectId(exerciseId)
    };

    const workouts = await Workout.find(query).sort({ date: 1 });

    // Process workouts to extract exercise data
    const exerciseData = workouts.map(workout => {
      const exercise = workout.exercises.find(
        (e: IExerciseLog) => e.exerciseId.toString() === exerciseId
      );

      if (!exercise) return null;

      // Calculate max weight and total volume for the exercise
      const maxWeight = Math.max(...exercise.sets.map((set: ISet) => Number(set.weight) || 0));
      const totalVolume = exercise.sets.reduce((sum: number, set: ISet) => 
        sum + (Number(set.weight) || 0) * (Number(set.reps) || 0)
      , 0);

      return {
        date: workout.date.toISOString().split('T')[0],
        maxWeight,
        totalVolume
      };
    }).filter(Boolean);

    return NextResponse.json({ success: true, data: exerciseData });
  } catch (error: any) {
    console.error('Error fetching progress data:', error);

    // Handle invalid ObjectId
    if (error.name === 'BSONError') {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
} 
