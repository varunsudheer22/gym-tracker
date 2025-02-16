import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PersonalRecord } from '@/models/PersonalRecord';
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

    const records = await PersonalRecord.find({ userId: session.user.id })
      .sort({ date: -1 });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error in GET /api/records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const data = await req.json();
    const { exerciseId, exerciseName, weight, reps, date, notes } = data;

    const record = new PersonalRecord({
      userId: session.user.id,
      exerciseId: new mongoose.Types.ObjectId(exerciseId),
      exerciseName,
      weight,
      reps,
      date: new Date(date),
      notes: notes || ''
    });

    await record.save();

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error in POST /api/records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create record' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('id');

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const record = await PersonalRecord.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(recordId),
      userId: session.user.id
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    );
  }
} 