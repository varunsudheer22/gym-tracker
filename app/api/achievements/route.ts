import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Achievement } from '@/models/Achievement';
import mongoose from 'mongoose';
import { requireAuth } from '../auth/auth-utils';

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
    
    const achievements = await Achievement.find({ userId: session.user.id })
      .sort({ earnedAt: -1 });
      
    return NextResponse.json({ 
      success: true, 
      achievements: achievements.map(achievement => ({
        ...achievement.toObject(),
        _id: achievement._id.toString(),
        exerciseId: achievement.exerciseId?.toString(),
        earnedAt: achievement.earnedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error in GET /api/achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// This endpoint is internal only - achievements are created by the system
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const body = await req.json();
    const { type, name, description, value, exerciseId, exerciseName } = body;
    
    if (!type || !name || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type is one of the allowed values
    const validTypes = [
      'first_workout',
      'workout_streak',
      'weight_milestone',
      'volume_milestone',
      'goal_achieved',
      'pr_streak'
    ];
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid achievement type' },
        { status: 400 }
      );
    }

    // Validate exerciseId if provided
    if (exerciseId && !mongoose.Types.ObjectId.isValid(exerciseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }

    const achievement = new Achievement({
      userId: session.user.id,
      type,
      name,
      description,
      value,
      exerciseId: exerciseId ? new mongoose.Types.ObjectId(exerciseId) : undefined,
      exerciseName,
      earnedAt: new Date()
    });

    await achievement.save();

    return NextResponse.json({ 
      success: true, 
      achievement: {
        ...achievement.toObject(),
        _id: achievement._id.toString(),
        exerciseId: achievement.exerciseId?.toString(),
        earnedAt: achievement.earnedAt.toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/achievements:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid achievement data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
} 