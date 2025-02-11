'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FireIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  TrophyIcon,
  PlusCircleIcon,
  BoltIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Start Workout',
    href: '/start-workout',
    icon: PlusCircleIcon,
    color: 'text-orange-500',
    description: 'Begin a new workout session'
  },
  {
    label: 'Log Workout',
    href: '/log-workout',
    icon: ClockIcon,
    color: 'text-blue-500',
    description: 'Record your workout details'
  },
  {
    label: 'Track Progress',
    href: '/goals',
    icon: ArrowTrendingUpIcon,
    color: 'text-green-500',
    description: 'View and update your goals'
  },
  {
    label: 'Body Metrics',
    href: '/body-metrics',
    icon: UserIcon,
    color: 'text-purple-500',
    description: 'Update your measurements'
  },
];

interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  thisWeek: number;
  thisMonth: number;
}

export default function Dashboard() {
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    currentStreak: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all dashboard data
    Promise.all([
      fetch('/api/workouts/recent').then(res => res.json()),
      fetch('/api/goals/active').then(res => res.json()),
      fetch('/api/workouts/stats').then(res => res.json())
    ])
      .then(([workouts, goals, stats]) => {
        setRecentWorkouts(workouts.data || []);
        setActiveGoals(goals.data || []);
        setWorkoutStats(stats.data || {
          totalWorkouts: 0,
          currentStreak: 0,
          thisWeek: 0,
          thisMonth: 0
        });
      })
      .catch(error => console.error('Error fetching dashboard data:', error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
        <p className="text-slate-400">Track your fitness journey and achieve your goals.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-slate-800 text-orange-500">
                <BoltIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Streak</p>
                <h3 className="text-2xl font-bold text-white">
                  {workoutStats.currentStreak} days
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-slate-800 text-green-500">
                <HeartIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">This Week</p>
                <h3 className="text-2xl font-bold text-white">
                  {workoutStats.thisWeek} workouts
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-slate-800 text-blue-500">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">This Month</p>
                <h3 className="text-2xl font-bold text-white">
                  {workoutStats.thisMonth} workouts
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-slate-800 text-purple-500">
                <TrophyIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Workouts</p>
                <h3 className="text-2xl font-bold text-white">
                  {workoutStats.totalWorkouts}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="hover:bg-slate-800/50 transition-colors cursor-pointer border-slate-800 bg-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg bg-slate-800 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{action.label}</h3>
                    <p className="text-sm text-slate-400">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Workouts */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="border-b border-slate-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                Recent Workouts
              </CardTitle>
              <Link 
                href="/history" 
                className="text-sm text-orange-500 hover:text-orange-400"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-4 text-slate-400">Loading...</div>
            ) : recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout: any) => (
                  <div
                    key={workout._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-white">{workout.workoutDayName}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-slate-400">
                          {new Date(workout.date).toLocaleDateString()}
                        </p>
                        <span className="text-slate-600">•</span>
                        <p className="text-sm text-slate-400">
                          {workout.exerciseCount} exercises
                        </p>
                        <span className="text-slate-600">•</span>
                        <p className="text-sm text-slate-400">
                          {Math.round(workout.totalVolume).toLocaleString()} kg total
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/workouts/${workout._id}`}
                      className="text-orange-500 hover:text-orange-400"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400">
                No recent workouts found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="border-b border-slate-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
                Active Goals
              </CardTitle>
              <Link 
                href="/goals" 
                className="text-sm text-yellow-500 hover:text-yellow-400"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-4 text-slate-400">Loading...</div>
            ) : activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map((goal: any) => (
                  <div
                    key={goal._id}
                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{goal.exerciseName}</h4>
                      <span className="text-sm px-2 py-1 rounded bg-slate-700 text-slate-300">
                        {goal.type}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${goal.progress}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-sm">
                        <span className="text-slate-400">Current: </span>
                        <span className="text-white">{goal.currentValue}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Target: </span>
                        <span className="text-white">{goal.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400">
                No active goals found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
