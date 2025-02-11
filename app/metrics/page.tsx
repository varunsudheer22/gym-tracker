'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { TrashIcon } from 'lucide-react';

interface BodyMetric {
  id: string;
  date: string;
  weight: number;
  notes: string;
  photos?: {
    front?: string;
    back?: string;
    side?: string;
  };
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

export default function Metrics() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState<Partial<BodyMetric>>({
    date: new Date().toISOString().split('T')[0],
    weight: undefined,
    notes: '',
    photos: {}
  });
  const [selectedPhotos, setSelectedPhotos] = useState<{
    front?: File;
    back?: File;
    side?: File;
  }>({});

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (type: 'front' | 'back' | 'side') => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPhotos(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleSubmit = async () => {
    if (!newMetric.weight) {
      setError('Please enter your weight');
      return;
    }

    try {
      // First, upload any photos
      const photoUrls: { [key: string]: string } = {};
      
      for (const [type, file] of Object.entries(selectedPhotos)) {
        if (file) {
          const formData = new FormData();
          formData.append('photo', file);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            photoUrls[type] = uploadData.url;
          }
        }
      }

      // Then save the metric with photo URLs
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMetric,
          photos: photoUrls
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMetrics([...metrics, data.metric]);
        setNewMetric({
          date: new Date().toISOString().split('T')[0],
          weight: undefined,
          notes: '',
          photos: {}
        });
        setSelectedPhotos({});
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving metric:', error);
      setError('Failed to save metric');
    }
  };

  const handleDelete = async (metricId: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/metrics/${metricId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setMetrics(metrics.filter(metric => metric.id !== metricId));
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting metric:', error);
      setError('Failed to delete measurement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Body Metrics</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Log New Measurement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-white">Date</Label>
              <Input
                type="date"
                value={newMetric.date}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setNewMetric({ ...newMetric, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label className="text-white">Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={newMetric.weight || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setNewMetric({ ...newMetric, weight: parseFloat(e.target.value) })}
                placeholder="0.0"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white">Notes</Label>
              <Input
                value={newMetric.notes}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setNewMetric({ ...newMetric, notes: e.target.value })}
                placeholder="How are you feeling? Any changes in diet/routine?"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white">Progress Photos</Label>
              <div className="grid gap-4 sm:grid-cols-3 mt-2">
                <div>
                  <Label className="text-sm text-white/70">Front View</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange('front')}
                  />
                </div>
                <div>
                  <Label className="text-sm text-white/70">Back View</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange('back')}
                  />
                </div>
                <div>
                  <Label className="text-sm text-white/70">Side View</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange('side')}
                  />
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            className="mt-4"
          >
            Save Measurement
          </Button>
        </CardContent>
      </Card>

      {/* Weight Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value) => [`${value} kg`, 'Weight']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                name="Weight (kg)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.slice().reverse().map(metric => (
              <Card key={metric.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-white">{formatDate(metric.date)}</div>
                      <div className="text-lg text-white">{metric.weight} kg</div>
                      {metric.notes && (
                        <div className="text-white/70 mt-1">{metric.notes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {metric.photos && Object.keys(metric.photos).length > 0 && (
                        <div className="flex gap-2">
                          {Object.entries(metric.photos).map(([type, url]) => (
                            <img
                              key={type}
                              src={url}
                              alt={`${type} view`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(metric.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 