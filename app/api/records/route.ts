import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PersonalRecord, IPersonalRecord } from '@/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // For now, using a placeholder userId until auth is implemented
    const userId = 'temp-user-id';
    
    const records = await PersonalRecord.find({ userId })
      .sort({ date: -1, exerciseName: 1 });
      
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId, exerciseName, type, value, unit, date, notes } = body;
    
    if (!exerciseId || !exerciseName || !type || typeof value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Exercise, value, and type are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // For now, we'll use a placeholder userId until auth is implemented
    const userId = 'temp-user-id';

    // Convert exerciseId to ObjectId and validate
    let exerciseObjectId;
    try {
      exerciseObjectId = new mongoose.Types.ObjectId(exerciseId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }

    // Check if this is a new PR for this exercise and type
    const existingRecord = await PersonalRecord.findOne({
      userId,
      exerciseId: exerciseObjectId,
      type
    }).sort({ value: -1 });

    if (existingRecord && existingRecord.value >= value) {
      return NextResponse.json(
        { success: false, error: 'Not a personal record' },
        { status: 400 }
      );
    }

    // Create the new record
    const record = await PersonalRecord.create({
      exerciseId: exerciseObjectId,
      exerciseName,
      type,
      value,
      unit: unit || '',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      userId
    });

    return NextResponse.json({ 
      success: true, 
      record: {
        _id: record._id,
        exerciseId: record.exerciseId.toString(),
        exerciseName: record.exerciseName,
        type: record.type,
        value: record.value,
        unit: record.unit,
        date: record.date.toISOString().split('T')[0],
        notes: record.notes
      }
    });
  } catch (error: any) {
    console.error('Error creating record:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid record data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create record' },
      { status: 500 }
    );
  }
} 