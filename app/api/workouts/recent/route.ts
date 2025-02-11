import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Workout } from '@/models/Workout';
import { requireAuth } from '../../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface ISet {
  weight: number;
  reps: number;
}

interface IExercise {
  sets: ISet[];
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    // Fetch the 5 most recent workouts
    const workouts = await Workout.find({ userId: session.user.id })
      .sort({ date: -1 })
      .limit(5)
      .select('workoutDayName date exercises')
      .lean();

    // Calculate some basic stats for each workout
    const workoutsWithStats = workouts.map(workout => ({
      ...workout,
      exerciseCount: workout.exercises.length,
      totalVolume: workout.exercises.reduce((total: number, exercise: IExercise) => {
        return total + exercise.sets.reduce((setTotal: number, set: ISet) => {
          return setTotal + (set.weight * set.reps);
        }, 0);
      }, 0),
    }));

    return NextResponse.json({
      success: true,
      data: workoutsWithStats
    });
  } catch (error) {
    console.error('Error fetching recent workouts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent workouts' },
      { status: 500 }
    );
  }
} 
