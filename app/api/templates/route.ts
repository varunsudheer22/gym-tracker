import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WorkoutTemplate } from '@/models/WorkoutTemplate';
import mongoose from 'mongoose';
import { Session } from 'next-auth';
import { requireAuth } from '../auth/auth-utils';

interface AuthSession extends Session {
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

    const templates = await WorkoutTemplate.find({ userId: session.user.id })
      .sort({ lastUsed: -1 });

    return Response.json({ success: true, templates });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const data = await req.json();
    const { templateName, workoutDayId, workoutDayName, exercises } = data;

    const template = new WorkoutTemplate({
      userId: session.user.id,
      templateName,
      workoutDayId: new mongoose.Types.ObjectId(workoutDayId),
      workoutDayName,
      exercises: exercises.map((exercise: any) => ({
        exerciseId: new mongoose.Types.ObjectId(exercise.exerciseId),
        exerciseName: exercise.exerciseName,
        defaultSets: exercise.defaultSets,
        notes: exercise.notes || ''
      }))
    });

    await template.save();

    return Response.json({ success: true, template });
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    return Response.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return Response.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = await WorkoutTemplate.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(templateId),
      userId: session.user.id
    });

    if (!template) {
      return Response.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/templates:', error);
    return Response.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 