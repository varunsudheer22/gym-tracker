'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';

interface PersonalRecord {
  _id: string;
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'reps' | 'time' | 'distance';
  value: number;
  unit: string;
  date: string;
  notes: string;
}

interface Exercise {
  _id: string;
  name: string;
  category: string;
}

const RECORD_TYPES = [
  { value: 'weight', label: 'Weight', defaultUnit: 'kg' },
  { value: 'reps', label: 'Repetitions', defaultUnit: 'reps' },
  { value: 'time', label: 'Time', defaultUnit: 'seconds' },
  { value: 'distance', label: 'Distance', defaultUnit: 'meters' }
];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export default function Records() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<PersonalRecord>>({
    date: new Date().toISOString().split('T')[0],
    type: 'weight',
    unit: 'kg'
  });

  useEffect(() => {
    Promise.all([
      fetchRecords(),
      fetchExercises()
    ]);
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();

      if (data.success) {
        setRecords(data.records);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to load records');
    } finally {
      setIsLoading(false);
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

  const handleExerciseChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const exercise = exercises.find(ex => ex._id === e.target.value);
    if (exercise) {
      setNewRecord({
        ...newRecord,
        exerciseId: exercise._id,
        exerciseName: exercise.name
      });
    }
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'weight' | 'reps' | 'time' | 'distance';
    const recordType = RECORD_TYPES.find(rt => rt.value === type);
    setNewRecord({
      ...newRecord,
      type,
      unit: recordType?.defaultUnit || ''
    });
  };

  const handleSubmit = async () => {
    if (!newRecord.exerciseId || !newRecord.value || !newRecord.type) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      const data = await response.json();

      if (data.success) {
        setRecords([...records, data.record]);
        setNewRecord({
          date: new Date().toISOString().split('T')[0],
          type: 'weight',
          unit: 'kg'
        });
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setError('Failed to save record');
    }
  };

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.exerciseName]) {
      acc[record.exerciseName] = [];
    }
    acc[record.exerciseName].push(record);
    return acc;
  }, {} as { [key: string]: PersonalRecord[] });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Personal Records</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Add New Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-white">Exercise</Label>
              <Select
                value={newRecord.exerciseId || ''}
                onChange={handleExerciseChange}
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
              <Label className="text-white">Date</Label>
              <Input
                type="date"
                value={newRecord.date}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setNewRecord({ ...newRecord, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label className="text-white">Record Type</Label>
              <Select
                value={newRecord.type || 'weight'}
                onChange={handleTypeChange}
              >
                {RECORD_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white">Value</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newRecord.value || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setNewRecord({ ...newRecord, value: parseFloat(e.target.value) })}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label className="text-white">Unit</Label>
                <Input
                  value={newRecord.unit || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setNewRecord({ ...newRecord, unit: e.target.value })}
                  placeholder="kg, reps, etc."
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white">Notes</Label>
              <Input
                value={newRecord.notes || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="Any details about the record"
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            className="mt-4"
          >
            Save Record
          </Button>
        </CardContent>
      </Card>

      {/* Records Display */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedRecords).map(([exerciseName, records]) => (
          <Card key={exerciseName}>
            <CardHeader>
              <CardTitle className="text-white">{exerciseName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {records.map(record => (
                  <div key={record._id} className="text-sm">
                    <div className="font-medium text-white">
                      {record.value} {record.unit} ({record.type})
                    </div>
                    <div className="text-white/70">
                      {formatDate(record.date)}
                      {record.notes && (
                        <div className="text-xs italic text-white/60">{record.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 