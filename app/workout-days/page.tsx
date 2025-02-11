'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface WorkoutDay {
  _id: string;
  name: string;
}

export default function WorkoutDays() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [newWorkoutDay, setNewWorkoutDay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkoutDays();
  }, []);

  const fetchWorkoutDays = async () => {
    try {
      const response = await fetch('/api/workout-days');
      const data = await response.json();

      if (data.success) {
        setWorkoutDays(data.workoutDays);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching workout days:', error);
      setError('Failed to load workout days');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkoutDay.trim()) {
      setError('Please enter a workout day name');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/workout-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newWorkoutDay.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setNewWorkoutDay('');
        fetchWorkoutDays();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating workout day:', error);
      setError('Failed to create workout day');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workout day? This will also delete all associated exercises.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workout-days/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchWorkoutDays();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting workout day:', error);
      setError('Failed to delete workout day');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Workout Days</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Add New Workout Day</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name" className="text-white">Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={newWorkoutDay}
                  onChange={(e) => setNewWorkoutDay(e.target.value)}
                  placeholder="e.g., Push Day A"
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workoutDays.map((day) => (
          <Card key={day._id} className="group relative">
            <Link href={`/exercises?workoutDayId=${day._id}`} className="absolute inset-0 z-10" aria-label={`Manage exercises for ${day.name}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-white">{day.name}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(day._id);
                }}
                className="relative z-20 text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-sm text-white/70 group-hover:text-blue-400">
                Click to manage exercises for this workout day
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 