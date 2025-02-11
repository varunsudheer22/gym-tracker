import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Goal } from '@/models/Goal';
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

    // Fetch active goals
    const goals = await Goal.find({
      userId: session.user.id,
      status: 'in_progress'
    })
      .sort({ createdAt: -1 })
      .select('exerciseName type target startValue currentValue')
      .lean();

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => {
      const progress = ((goal.currentValue - goal.startValue) / (goal.target - goal.startValue)) * 100;
      return {
        ...goal,
        progress: Math.min(Math.max(progress, 0), 100) // Clamp between 0 and 100
      };
    });

    return Response.json({
      success: true,
      data: goalsWithProgress
    });
  } catch (error) {
    console.error('Error fetching active goals:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch active goals' },
      { status: 500 }
    );
  }
} 