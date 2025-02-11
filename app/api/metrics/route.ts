import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Metric } from '@/models/Metric';
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

    const metrics = await Metric.find({ userId: session.user.id })
      .sort({ date: -1 });

    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Error in GET /api/metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const data = await req.json();
    const { date, weight, bodyFat, notes } = data;

    const metric = new Metric({
      userId: session.user.id,
      date: new Date(date),
      weight,
      bodyFat,
      notes: notes || ''
    });

    await metric.save();

    return NextResponse.json({ success: true, metric });
  } catch (error) {
    console.error('Error in POST /api/metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth() as AuthSession;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const metricId = searchParams.get('id');

    if (!metricId) {
      return NextResponse.json(
        { success: false, error: 'Metric ID is required' },
        { status: 400 }
      );
    }

    const metric = await Metric.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(metricId),
      userId: session.user.id
    });

    if (!metric) {
      return NextResponse.json(
        { success: false, error: 'Metric not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
} 