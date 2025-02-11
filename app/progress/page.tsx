'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ProgressData {
  date: string;
  maxWeight: number;
  totalVolume: number;
}

// Helper function to format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export default function Progress() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('1m');
  const [data, setData] = useState<ProgressData[]>([]);
  const [exercises, setExercises] = useState<Array<{ _id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExerciseChange = (e: ChangeEvent<HTMLSelectElement>) => setSelectedExercise(e.target.value);
  const handleTimeRangeChange = (e: ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value);

  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        const result = await response.json();
        
        if (result.success) {
          setExercises(result.exercises);
          // Set the first exercise as default if available
          if (result.exercises.length > 0) {
            setSelectedExercise(result.exercises[0]._id);
          }
        } else {
          throw new Error(result.error || 'Failed to fetch exercises');
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to load exercises');
      }
    };

    fetchExercises();
  }, []);

  // Fetch progress data when exercise or time range changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedExercise || !timeRange) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/workouts/progress?exerciseId=${selectedExercise}&timeRange=${timeRange}`
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch progress data');
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedExercise, timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Progress Tracking</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Exercise Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-white">Exercise</Label>
              <Select 
                value={selectedExercise} 
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
              <Label className="text-white">Time Range</Label>
              <Select 
                value={timeRange} 
                onChange={handleTimeRangeChange}
              >
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-white/70">Loading progress data...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-white/70">
                {selectedExercise 
                  ? "No workout data found for this exercise in the selected time range" 
                  : "Select an exercise to view progress"}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Max Weight Progress Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      label={{ 
                        value: 'Weight (kg)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#9CA3AF' }
                      }} 
                    />
                    <Tooltip 
                      labelFormatter={formatDate}
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#F9FAFB' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="maxWeight"
                      stroke="#3B82F6"
                      name="Max Weight"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalVolume"
                      stroke="#10B981"
                      name="Total Volume"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 