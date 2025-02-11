'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';

interface Exercise {
  _id: string;
  name: string;
  category: string;
  workoutDayId: string;
  defaultSets?: number;
  defaultReps?: number;
  notes?: string;
}

interface WorkoutDay {
  _id: string;
  name: string;
}

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    category: 'Other'
  });

  useEffect(() => {
    Promise.all([
      fetchExercises(),
      fetchWorkoutDays()
    ]);
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();

      if (data.success) {
        setExercises(data.exercises);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutDays = async () => {
    try {
      const response = await fetch('/api/workout-days');
      const data = await response.json();

      if (data.success) {
        setWorkoutDays(data.workoutDays);
        if (data.workoutDays.length > 0) {
          setSelectedWorkoutDay(data.workoutDays[0]._id);
          setNewExercise(prev => ({ ...prev, workoutDayId: data.workoutDays[0]._id }));
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching workout days:', error);
      setError('Failed to load workout days');
    }
  };

  const handleSubmit = async () => {
    if (!newExercise.name || !newExercise.workoutDayId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newExercise.name,
          workoutDayId: newExercise.workoutDayId,
          category: newExercise.category || 'Other',
          defaultSets: newExercise.defaultSets ? Number(newExercise.defaultSets) : undefined,
          defaultReps: newExercise.defaultReps ? Number(newExercise.defaultReps) : undefined,
          notes: newExercise.notes
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExercises([...exercises, data.exercise]);
        setNewExercise({
          category: 'Other',
          workoutDayId: selectedWorkoutDay
        });
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error saving exercise:', error);
      setError(error.message || 'Failed to save exercise');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setExercises(exercises.filter(exercise => exercise._id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setError('Failed to delete exercise');
    }
  };

  const filteredExercises = exercises.filter(
    exercise => !selectedWorkoutDay || exercise.workoutDayId === selectedWorkoutDay
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Exercise Management</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Add New Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-white">Exercise Name</Label>
              <Input
                value={newExercise.name || ''}
                onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="Exercise name"
              />
            </div>
            <div>
              <Label className="text-white">Workout Day</Label>
              <Select
                value={newExercise.workoutDayId || ''}
                onChange={e => setNewExercise({ ...newExercise, workoutDayId: e.target.value })}
              >
                <SelectItem value="">Select workout day</SelectItem>
                {workoutDays.map(day => (
                  <SelectItem key={day._id} value={day._id}>
                    {day.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-white">Category</Label>
              <Input
                value={newExercise.category || ''}
                onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                placeholder="Exercise category"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white">Default Sets</Label>
                <Input
                  type="number"
                  value={newExercise.defaultSets || ''}
                  onChange={e => setNewExercise({ ...newExercise, defaultSets: parseInt(e.target.value) })}
                  placeholder="3"
                />
              </div>
              <div>
                <Label className="text-white">Default Reps</Label>
                <Input
                  type="number"
                  value={newExercise.defaultReps || ''}
                  onChange={e => setNewExercise({ ...newExercise, defaultReps: parseInt(e.target.value) })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white">Notes</Label>
              <Input
                value={newExercise.notes || ''}
                onChange={e => setNewExercise({ ...newExercise, notes: e.target.value })}
                placeholder="Any notes about form, tips, etc."
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            className="mt-4"
          >
            Add Exercise
          </Button>
        </CardContent>
      </Card>

      {/* Filter by Workout Day */}
      <div className="flex gap-4 items-center">
        <Label className="whitespace-nowrap text-white">Filter by Workout Day:</Label>
        <Select
          value={selectedWorkoutDay}
          onChange={e => setSelectedWorkoutDay(e.target.value)}
        >
          <SelectItem value="">All Workout Days</SelectItem>
          {workoutDays.map(day => (
            <SelectItem key={day._id} value={day._id}>
              {day.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Exercise List */}
      {isLoading ? (
        <div className="text-gray-500">Loading exercises...</div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-gray-500">No exercises yet</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map(exercise => (
            <Card key={exercise._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-white">{exercise.name}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(exercise._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-white">Category:</span>{' '}
                    <span className="text-white/70">{exercise.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-white">Workout Day:</span>{' '}
                    <span className="text-white/70">
                      {workoutDays.find(day => day._id === exercise.workoutDayId)?.name}
                    </span>
                  </div>
                  {exercise.defaultSets && (
                    <div>
                      <span className="font-medium text-white">Default Sets:</span>{' '}
                      <span className="text-white/70">{exercise.defaultSets}</span>
                    </div>
                  )}
                  {exercise.defaultReps && (
                    <div>
                      <span className="font-medium text-white">Default Reps:</span>{' '}
                      <span className="text-white/70">{exercise.defaultReps}</span>
                    </div>
                  )}
                  {exercise.notes && (
                    <div>
                      <span className="font-medium text-white">Notes:</span>{' '}
                      <span className="text-white/70">{exercise.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 