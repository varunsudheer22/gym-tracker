'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Set {
  weight: number;
  reps: number;
  rir: string;
}

interface Exercise {
  exerciseId: string;
  exerciseName: string;
  sets: Set[];
  notes?: string;
}

interface Workout {
  _id: string;
  date: string;
  workoutDayId: string;
  workoutDayName: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export default function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedWorkouts, setExpandedWorkouts] = useState<string[]>([]);

  useEffect(() => {
    fetchWorkouts();
  }, [startDate, endDate]);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/workouts/history?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();

      if (data.success) {
        setWorkouts(data.workouts);
      } else {
        throw new Error(data.error || 'Failed to fetch workouts');
      }
    } catch (error: any) {
      console.error('Error fetching workouts:', error);
      setError(error.message || 'Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setWorkouts(workouts.filter(w => w._id !== workoutId));
      } else {
        throw new Error(data.error || 'Failed to delete workout');
      }
    } catch (error: any) {
      console.error('Error deleting workout:', error);
      setError(error.message || 'Failed to delete workout');
    }
  };

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts(prev => 
      prev.includes(workoutId) 
        ? prev.filter(id => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Workout History</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-white/70">Loading workouts...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-8 text-white/70">
          No workouts found for the selected date range.
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <Card key={workout._id} className="overflow-hidden hover:bg-slate-800/50 transition-colors">
              <div 
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => toggleWorkout(workout._id)}
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {workout.workoutDayName}
                    <span className="text-sm font-normal text-white/60">
                      {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </h3>
                  <p className="text-sm text-white/60">
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(workout._id);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                  {expandedWorkouts.includes(workout._id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-white/60" />
                  )}
                </div>
              </div>
              
              {expandedWorkouts.includes(workout._id) && (
                <CardContent className="border-t border-slate-800/50 bg-slate-800/25">
                  <div className="space-y-6">
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="font-medium text-white flex items-center justify-between">
                          {exercise.exerciseName}
                          {exercise.notes && (
                            <span className="text-sm font-normal text-white/60 italic">
                              {exercise.notes}
                            </span>
                          )}
                        </h4>
                        <div className="grid gap-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div 
                              key={setIndex} 
                              className="flex items-center gap-4 text-sm bg-slate-800/50 p-2 rounded-lg"
                            >
                              <span className="text-white/60 w-16">Set {setIndex + 1}</span>
                              <span className="text-white font-medium">{set.weight} kg</span>
                              <span className="text-white/60">×</span>
                              <span className="text-white font-medium">{set.reps} reps</span>
                              {set.rir && (
                                <span className="text-white/60">RIR: {set.rir}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 