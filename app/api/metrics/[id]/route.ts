import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Metric } from '@/models/Metric';
import { requireAuth } from '../../auth/auth-utils';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const deletedMetric = await Metric.findOneAndDelete({
      _id: params.id,
      userId: session.user.id
    });

    if (!deletedMetric) {
      return NextResponse.json(
        { success: false, error: 'Metric not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
} 