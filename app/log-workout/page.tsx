'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Set {
  weight: number;
  reps: number;
  rir: string;
}

interface Exercise {
  id: string;
  exerciseId: string; // MongoDB _id of the exercise
  name: string;
  sets: Set[];
  notes: string;
}

interface WorkoutDay {
  _id: string;  // Changed from id to _id to match MongoDB
  name: string;
}

interface AvailableExercise {
  _id: string;
  name: string;
  defaultSets?: number;
  defaultReps?: number;
}

const DEFAULT_SET: Set = { weight: 0, reps: 0, rir: '2' };

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function LogWorkout() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [workoutDay, setWorkoutDay] = useState('');
  const [workoutDate, setWorkoutDate] = useState(formatDate(new Date())); // Today's date by default
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<AvailableExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkoutDays();
  }, []);

  // Fetch exercises when workout day changes
  useEffect(() => {
    if (workoutDay) {
      fetchExercises(workoutDay);
    } else {
      setAvailableExercises([]);
    }
  }, [workoutDay]);

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

  const fetchExercises = async (workoutDayId: string) => {
    try {
      const response = await fetch(`/api/exercises?workoutDayId=${workoutDayId}`);
      const data = await response.json();

      if (data.success) {
        setAvailableExercises(data.exercises);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises');
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      exerciseId: '', // Add empty exerciseId that will be set when exercise is selected
      name: '',
      sets: [{ ...DEFAULT_SET }],
      notes: ''
    };
    setExercises([...exercises, newExercise]);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, { ...DEFAULT_SET }]
        };
      }
      return exercise;
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSets = [...exercise.sets];
        newSets.splice(setIndex, 1);
        return {
          ...exercise,
          sets: newSets
        };
      }
      return exercise;
    }));
  };

  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof Set) => 
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value: string | number = e.target.value;
      if (field !== 'rir') {
        value = parseFloat(e.target.value) || 0;
      }
      setExercises(exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          const newSets = exercise.sets.map((set, idx) => {
            if (idx === setIndex) {
              return { ...set, [field]: value } as Set;
            }
            return set;
          });
          return { ...exercise, sets: newSets };
        }
        return exercise;
      }));
    };

  const handleExerciseSelect = (exerciseId: string, selectedExerciseId: string) => {
    const selectedExercise = availableExercises.find(e => e._id === selectedExerciseId);
    if (!selectedExercise) return;

    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        // Create default sets based on exercise settings
        const defaultSets = Array(selectedExercise.defaultSets || 3).fill(null).map(() => ({
          ...DEFAULT_SET,
          reps: selectedExercise.defaultReps || 8
        }));

        return {
          ...exercise,
          exerciseId: selectedExercise._id, // Store the MongoDB _id
          name: selectedExercise.name,
          sets: defaultSets
        };
      }
      return exercise;
    }));
  };

  const handleWorkoutDayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setWorkoutDay(selectedId);
    setExercises([]); // Clear exercises when workout day changes
  };

  const handleNotesChange = (exerciseId: string) => (e: ChangeEvent<HTMLInputElement>) => 
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, notes: e.target.value }
        : exercise
    ));

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkoutDate(e.target.value);
  };

  const handleSubmit = async () => {
    // Validation
    if (!workoutDay) {
      setError('Please select a workout day');
      return;
    }

    if (!workoutDate) {
      setError('Please select a workout date');
      return;
    }

    if (exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    const hasInvalidExercises = exercises.some(exercise => 
      !exercise.name || exercise.sets.length === 0 || 
      exercise.sets.some(set => set.weight === 0 || set.reps === 0)
    );

    if (hasInvalidExercises) {
      setError('Please fill in all exercise details (weight and reps must be greater than 0)');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const selectedDay = workoutDays.find(day => day._id === workoutDay);
      if (!selectedDay) throw new Error('Invalid workout day');

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutDayId: workoutDay,
          workoutDayName: selectedDay.name,
          date: workoutDate,
          exercises: exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.name,
            sets: exercise.sets.map(set => ({
              weight: set.weight,
              reps: set.reps,
              rir: set.rir
            })),
            notes: exercise.notes
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setWorkoutDay('');
        setWorkoutDate(formatDate(new Date()));
        setExercises([]);
        alert('Workout saved successfully!');
      } else {
        throw new Error(data.error || 'Failed to save workout');
      }
    } catch (error: any) {
      console.error('Error saving workout:', error);
      setError(error.message || 'Failed to save workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Log Workout</h1>
        <Button 
          onClick={handleSubmit} 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid w-full items-center gap-1.5">
              <Label className="text-white">Workout Day</Label>
              <Select 
                value={workoutDay} 
                onChange={handleWorkoutDayChange}
              >
                <SelectItem value="">Select workout day</SelectItem>
                {workoutDays.map(day => (
                  <SelectItem key={day._id} value={day._id}>
                    {day.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label className="text-white">Date</Label>
              <Input
                id="workoutDate"
                type="date"
                value={workoutDate}
                onChange={handleDateChange}
                max={formatDate(new Date())} // Can't log workouts in the future
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Exercises</h2>
          <Button onClick={addExercise} disabled={!workoutDay}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Exercise
          </Button>
        </div>

        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Select
                  value={exercise.exerciseId || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                    handleExerciseSelect(exercise.id, e.target.value)
                  }
                  className="flex-1 mr-4"
                >
                  <SelectItem value="">Select exercise</SelectItem>
                  {availableExercises.map(e => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sets */}
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex gap-4 items-center">
                      <span className="w-8 text-sm text-white/70">#{setIndex + 1}</span>
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <div>
                          <Label className="text-white">Weight (kg)</Label>
                          <Input
                            type="number"
                            value={set.weight || ''}
                            onChange={handleSetChange(exercise.id, setIndex, 'weight')}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Reps</Label>
                          <Input
                            type="number"
                            value={set.reps || ''}
                            onChange={handleSetChange(exercise.id, setIndex, 'reps')}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-white">RIR</Label>
                          <Select 
                            value={set.rir}
                            onChange={handleSetChange(exercise.id, setIndex, 'rir')}
                          >
                            {[0,1,2,3,4].map((value) => (
                              <SelectItem key={value} value={value.toString()}>
                                {value}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSet(exercise.id, setIndex)}
                        className="text-red-500"
                        disabled={exercise.sets.length === 1}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Set controls */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => addSet(exercise.id)}
                    disabled={!exercise.name}
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Set
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-white">Notes</Label>
                  <Input
                    value={exercise.notes}
                    onChange={handleNotesChange(exercise.id)}
                    placeholder="Optional notes about this exercise..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 