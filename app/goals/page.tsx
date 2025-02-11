'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { PlusIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface Exercise {
  _id: string;
  name: string;
}

interface Goal {
  _id: string;
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'volume' | 'frequency';
  target: number;
  deadline?: string;
  startValue: number;
  currentValue: number;
  status: 'in_progress' | 'achieved' | 'missed';
  achievedDate?: string;
}

interface Achievement {
  _id: string;
  type: string;
  name: string;
  description: string;
  value?: number;
  exerciseId?: string;
  exerciseName?: string;
  earnedAt: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newGoal, setNewGoal] = useState({
    exerciseId: '',
    type: 'weight',
    target: '',
    deadline: '',
    startValue: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
    fetchAchievements();
    fetchExercises();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();

      if (data.success) {
        setGoals(data.goals);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to load achievements');
    }
  };

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
    }
  };

  const handleSubmit = async () => {
    if (!newGoal.exerciseId || !newGoal.type || !newGoal.target || !newGoal.startValue) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const exercise = exercises.find(ex => ex._id === newGoal.exerciseId);
      if (!exercise) throw new Error('Invalid exercise');

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: newGoal.exerciseId,
          exerciseName: exercise.name,
          type: newGoal.type,
          target: Number(newGoal.target),
          deadline: newGoal.deadline || undefined,
          startValue: Number(newGoal.startValue)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGoals([...goals, data.goal]);
        setNewGoal({
          exerciseId: '',
          type: 'weight',
          target: '',
          deadline: '',
          startValue: ''
        });
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error saving goal:', error);
      setError(error.message || 'Failed to save goal');
    }
  };

  const calculateProgress = (goal: Goal) => {
    const progress = ((goal.currentValue - goal.startValue) / (goal.target - goal.startValue)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Goals & Achievements</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Goals Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Set New Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-white">Exercise</Label>
                  <Select
                    value={newGoal.exerciseId}
                    onChange={e => setNewGoal({ ...newGoal, exerciseId: e.target.value })}
                  >
                    <SelectItem value="">Select exercise</SelectItem>
                    {exercises.map(exercise => (
                      <SelectItem key={exercise._id} value={exercise._id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Goal Type</Label>
                  <Select
                    value={newGoal.type}
                    onChange={e => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                  >
                    <SelectItem value="weight">Max Weight</SelectItem>
                    <SelectItem value="volume">Total Volume</SelectItem>
                    <SelectItem value="frequency">Workout Frequency</SelectItem>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Starting Value</Label>
                  <Input
                    type="number"
                    value={newGoal.startValue}
                    onChange={e => setNewGoal({ ...newGoal, startValue: e.target.value })}
                    placeholder="Current value"
                  />
                </div>
                <div>
                  <Label className="text-white">Target Value</Label>
                  <Input
                    type="number"
                    value={newGoal.target}
                    onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                    placeholder="Target to achieve"
                  />
                </div>
                <div>
                  <Label className="text-white">Deadline (Optional)</Label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                className="mt-4"
                disabled={!newGoal.exerciseId || !newGoal.target || !newGoal.startValue}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Set Goal
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Active Goals</h2>
            {goals.filter(goal => goal.status === 'in_progress').map(goal => (
              <Card key={goal._id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{goal.exerciseName}</h3>
                        <p className="text-sm text-white/70">
                          {goal.type === 'weight' ? 'Max Weight' :
                           goal.type === 'volume' ? 'Total Volume' : 'Workout Frequency'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {goal.currentValue} / {goal.target}
                          {goal.type === 'weight' ? ' kg' :
                           goal.type === 'volume' ? ' kg (volume)' : ' workouts'}
                        </p>
                        {goal.deadline && (
                          <p className="text-sm text-white/70">
                            Due by {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${calculateProgress(goal)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Achievements</h2>
          <div className="grid gap-4">
            {achievements.map(achievement => (
              <Card key={achievement._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrophyIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{achievement.name}</h3>
                      <p className="text-sm text-white/70">{achievement.description}</p>
                      {achievement.value && (
                        <p className="text-sm text-white/70">Value: {achievement.value}</p>
                      )}
                      <p className="text-xs text-white/50 mt-1">
                        Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 