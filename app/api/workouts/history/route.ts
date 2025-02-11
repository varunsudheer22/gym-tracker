import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Workout } from '@/models';
import { requireAuth } from '../../auth/auth-utils';
import { Session } from 'next-auth';
import mongoose from 'mongoose';

interface IExercise {
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  sets: Array<{
    weight: number;
    reps: number;
    notes?: string;
  }>;
}

interface IWorkout {
  _id: mongoose.Types.ObjectId;
  date: Date;
  workoutDayId: mongoose.Types.ObjectId;
  exercises: IExercise[];
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('status' in authResult) return authResult;
    const session = authResult as Session;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const workoutDayId = searchParams.get('workoutDayId');
    const exerciseId = searchParams.get('exerciseId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const query: any = {
      userId: session.user.email,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Add workout day filter if provided
    if (workoutDayId && mongoose.Types.ObjectId.isValid(workoutDayId)) {
      query.workoutDayId = new mongoose.Types.ObjectId(workoutDayId);
    }

    // Add exercise filter if provided
    if (exerciseId && mongoose.Types.ObjectId.isValid(exerciseId)) {
      query['exercises.exerciseId'] = new mongoose.Types.ObjectId(exerciseId);
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .lean() as IWorkout[];

    return NextResponse.json({ 
      success: true, 
      workouts: workouts.map(workout => ({
        ...workout,
        _id: workout._id?.toString(),
        workoutDayId: workout.workoutDayId?.toString(),
        date: new Date(workout.date).toISOString().split('T')[0],
        createdAt: new Date(workout.createdAt).toISOString(),
        updatedAt: new Date(workout.updatedAt).toISOString(),
        exercises: workout.exercises?.map((exercise: IExercise) => ({
          ...exercise,
          exerciseId: exercise.exerciseId?.toString()
        })) || []
      }))
    });
  } catch (error: any) {
    console.error('Error fetching workout history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workout history' },
      { status: 500 }
    );
  }
} 