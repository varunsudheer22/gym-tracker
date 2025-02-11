'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { PlusIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WorkoutDay {
  _id: string;
  dayName: string;
  userId: string;
}

interface Exercise {
  _id: string;
  exerciseName: string;
  category: string;
  workoutDayId: string;
  defaultSets?: number;
  defaultReps?: number;
  notes?: string;
  userId: string;
}

interface Template {
  _id: string;
  templateName: string;
  workoutDayId: string;
  workoutDayName: string;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    defaultSets: Array<{
      weight: number;
      reps: number;
      rir: string;
    }>;
    notes?: string;
  }>;
  userId: string;
}

export default function Templates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    templateName: '',
    workoutDayId: '',
    workoutDayName: '',
    exercises: [] as Template['exercises']
  });

  useEffect(() => {
    fetchTemplates();
    fetchWorkoutDays();
  }, []);

  useEffect(() => {
    if (selectedWorkoutDay) {
      fetchExercises(selectedWorkoutDay);
    }
  }, [selectedWorkoutDay]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates');
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
        setExercises(data.exercises);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: newTemplate.templateName.trim(),
          workoutDayId: newTemplate.workoutDayId,
          workoutDayName: newTemplate.workoutDayName,
          exercises: newTemplate.exercises
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => [...prev, data.template]);
        setNewTemplate({
          templateName: '',
          workoutDayId: '',
          workoutDayName: '',
          exercises: []
        });
        setSelectedWorkoutDay('');
        setSelectedExercise('');
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(templates.filter(template => template._id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template');
    }
  };

  const startWorkout = async (template: Template) => {
    try {
      // Create a new workout from the template
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutDayId: template.workoutDayId,
          workoutDayName: template.workoutDayName,
          date: new Date().toISOString().split('T')[0],
          exercises: template.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: exercise.defaultSets,
            notes: exercise.notes
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update template's lastUsed date
        await fetch(`/api/templates/${template._id}/use`, {
          method: 'POST'
        });
        
        // Redirect to the workout logging page
        router.push('/log-workout');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error starting workout:', error);
      setError(error.message || 'Failed to start workout');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Workout Templates</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Create New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label className="text-white">Template Name</Label>
              <Input
                type="text"
                value={newTemplate.templateName}
                onChange={e => setNewTemplate({ ...newTemplate, templateName: e.target.value })}
                placeholder="Enter template name"
                className="bg-slate-900 text-white border-slate-700"
              />
            </div>
            <div>
              <Label className="text-white">Workout Day</Label>
              <Select
                value={newTemplate.workoutDayId}
                onChange={e => {
                  const selectedId = e.target.value;
                  const selectedDay = workoutDays.find(day => day._id === selectedId);
                  setNewTemplate({
                    ...newTemplate,
                    workoutDayId: selectedId,
                    workoutDayName: selectedDay?.dayName || '',
                    exercises: []
                  });
                  setSelectedWorkoutDay(selectedId);
                  setSelectedExercise('');
                }}
              >
                <SelectItem value="">Select workout day</SelectItem>
                {workoutDays.map(day => (
                  <SelectItem key={day._id} value={day._id}>
                    {day.dayName}
                  </SelectItem>
                ))}
              </Select>
            </div>
            {selectedWorkoutDay && (
              <div>
                <Label className="text-white">Add Exercise</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <select
                      value={selectedExercise}
                      onChange={e => setSelectedExercise(e.target.value)}
                      className="block w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-600 appearance-none"
                    >
                      <option value="" className="bg-slate-900 text-white">Select exercise</option>
                      {exercises
                        .filter(exercise => !newTemplate.exercises.some(e => e.exerciseId === exercise._id))
                        .map(exercise => (
                          <option 
                            key={exercise._id} 
                            value={exercise._id}
                            className="bg-slate-900 text-white"
                          >
                            {exercise.exerciseName}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <Button
                    onClick={() => {
                      if (!selectedExercise) return;

                      const exercise = exercises.find(ex => ex._id === selectedExercise);
                      if (!exercise) return;

                      const defaultSets = Array(exercise.defaultSets || 3).fill({}).map(() => ({
                        weight: 0,
                        reps: exercise.defaultReps || 10,
                        rir: '2'
                      }));

                      setNewTemplate(prev => ({
                        ...prev,
                        exercises: [
                          ...prev.exercises,
                          {
                            exerciseId: exercise._id,
                            exerciseName: exercise.exerciseName,
                            defaultSets,
                            notes: ''
                          }
                        ]
                      }));

                      setSelectedExercise('');
                    }}
                    disabled={!selectedExercise}
                    size="sm"
                    variant="outline"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            {newTemplate.exercises.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white">Selected Exercises</Label>
                {newTemplate.exercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                    <span className="text-white">{exercise.exerciseName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewTemplate(prev => ({
                          ...prev,
                          exercises: prev.exercises.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            className="mt-4"
            disabled={!newTemplate.templateName || !newTemplate.workoutDayId || newTemplate.exercises.length === 0}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Template
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <Card key={template._id} className="group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-white">{template.templateName}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(template._id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-white/70">
                  {template.workoutDayName}
                </div>
                <div className="text-sm text-white/70">
                  {template.exercises.length} exercises
                </div>
                {template.exercises.length > 0 && (
                  <div className="text-sm text-white/70">
                    Exercises: {template.exercises.map(e => e.exerciseName).join(', ')}
                  </div>
                )}
                <Button
                  onClick={() => startWorkout(template)}
                  className="w-full mt-2"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Start Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 