import { NextRequest } from 'next/server';
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

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    // Get current date
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all workouts for calculations
    const workouts = await Workout.find({
      userId: session.user.id,
      date: { $exists: true }
    })
      .sort({ date: -1 })
      .select('date')
      .lean();

    // Calculate total workouts
    const totalWorkouts = workouts.length;

    // Calculate workouts this week and month
    const thisWeek = workouts.filter(w => new Date(w.date) >= startOfWeek).length;
    const thisMonth = workouts.filter(w => new Date(w.date) >= startOfMonth).length;

    // Calculate current streak
    let currentStreak = 0;
    let lastWorkoutDate = startOfToday;

    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      const daysDifference = Math.floor(
        (lastWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference <= 1) {
        currentStreak++;
        lastWorkoutDate = workoutDate;
      } else {
        break;
      }
    }

    return Response.json({
      success: true,
      data: {
        totalWorkouts,
        currentStreak,
        thisWeek,
        thisMonth
      }
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch workout statistics' },
      { status: 500 }
    );
  }
} 