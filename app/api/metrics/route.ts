import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: Add MongoDB connection and models
// For now, we'll use in-memory storage
let metrics: {
  id: string;
  date: string;
  weight: number;
  notes: string;
  photos?: {
    front?: string;
    back?: string;
    side?: string;
  };
}[] = [];

export async function GET() {
  try {
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    if (!metric.weight || !metric.date) {
      return NextResponse.json(
        { success: false, error: 'Weight and date are required' },
        { status: 400 }
      );
    }

    const newMetric = {
      id: Date.now().toString(),
      date: metric.date,
      weight: metric.weight,
      notes: metric.notes || '',
      photos: metric.photos || {}
    };

    metrics.push(newMetric);

    return NextResponse.json({ 
      success: true, 
      metric: newMetric 
    });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create metric' },
      { status: 500 }
    );
  }
} 