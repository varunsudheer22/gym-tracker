import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WorkoutDay } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const workoutDays = await WorkoutDay.find({ userId: session.user.email }).sort({ name: 1 });
    return NextResponse.json({ success: true, workoutDays });
  } catch (error) {
    console.error('Error fetching workout days:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workout days' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = session.user.email;

    const workoutDay = await WorkoutDay.create({
      name,
      userId
    });

    return NextResponse.json({ 
      success: true, 
      workoutDay 
    });
  } catch (error: any) {
    console.error('Error creating workout day:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A workout day with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create workout day' },
      { status: 500 }
    );
  }
} 