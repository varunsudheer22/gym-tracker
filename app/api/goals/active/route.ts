import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Goal } from '@/models/Goal';
import { Workout } from '@/models/Workout';
import mongoose from 'mongoose';
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

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    // Get all active goals
    const goals = await Goal.find({
      userId: session.user.id,
      targetDate: { $gte: new Date() }
    }).sort({ targetDate: 1 });

    // For each goal, calculate progress
    const goalsWithProgress = await Promise.all(goals.map(async goal => {
      // Get the latest workout for this exercise
      const latestWorkout = await Workout.findOne({
        userId: session.user.id,
        'exercises.exerciseId': goal.exerciseId
      }).sort({ date: -1 });

      if (!latestWorkout) {
        return {
          ...goal.toObject(),
          currentWeight: 0,
          currentReps: 0,
          progress: 0
        };
      }

      // Find the exercise in the workout
      const exercise = latestWorkout.exercises.find(
        (e: IExerciseLog) => e.exerciseId.toString() === goal.exerciseId.toString()
      );

      if (!exercise) {
        return {
          ...goal.toObject(),
          currentWeight: 0,
          currentReps: 0,
          progress: 0
        };
      }

      // Get the best set (highest weight with target reps or higher)
      const bestSet = exercise.sets
        .filter((set: ISet) => set.reps >= goal.targetReps)
        .reduce((best: ISet | null, set: ISet) => {
          if (!best || set.weight > best.weight) {
            return set;
          }
          return best;
        }, null);

      if (!bestSet) {
        return {
          ...goal.toObject(),
          currentWeight: 0,
          currentReps: 0,
          progress: 0
        };
      }

      // Calculate progress as a percentage
      const progress = Math.min(100, (bestSet.weight / goal.targetWeight) * 100);

      return {
        ...goal.toObject(),
        currentWeight: bestSet.weight,
        currentReps: bestSet.reps,
        progress
      };
    }));

    return NextResponse.json({ success: true, goals: goalsWithProgress });
  } catch (error) {
    console.error('Error in GET /api/goals/active:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active goals' },
      { status: 500 }
    );
  }
} 