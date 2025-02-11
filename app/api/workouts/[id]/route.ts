import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Workout } from '@/models';
import mongoose from 'mongoose';
import { requireAuth } from '../../auth/auth-utils';
import { Session } from 'next-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if ('status' in authResult) return authResult;
    const session = authResult as Session;

    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Workout ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    const workout = await Workout.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: session.user.email
    });

    if (!workout) {
      return NextResponse.json(
        { success: false, error: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
} 