import mongoose from 'mongoose';

// Workout Template Schema
const workoutTemplateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  templateName: { type: String, required: true },
  workoutDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutDay', required: true },
  workoutDayName: { type: String, required: true },
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    exerciseName: { type: String, required: true },
    defaultSets: [{
      weight: { type: Number, default: 0 },
      reps: { type: Number, default: 0 },
      rir: { type: String, default: '2' }
    }],
    notes: String
  }],
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  category: { type: String, required: true },
  workoutDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutDay', required: true },
  defaultSets: { type: Number },
  defaultReps: { type: Number },
  notes: String,
  userId: { type: String, required: true }
}, {
  timestamps: true
});

// Workout Day Schema
const workoutDaySchema = new mongoose.Schema({
  dayName: { type: String, required: true },
  userId: { type: String, required: true }
}, {
  timestamps: true
});

// Goal Schema
const goalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['weight', 'volume', 'frequency'],
    required: true 
  },
  target: { type: Number, required: true },
  deadline: { type: Date },
  startValue: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['in_progress', 'achieved', 'missed'],
    default: 'in_progress'
  },
  achievedDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'first_workout',
      'workout_streak',
      'weight_milestone',
      'volume_milestone',
      'goal_achieved',
      'pr_streak'
    ],
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  value: { type: Number }, // e.g., streak count or milestone value
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  exerciseName: { type: String },
  earnedAt: { type: Date, default: Date.now }
});

// Add indexes
workoutTemplateSchema.index({ userId: 1, templateName: 1 }, { unique: true });
exerciseSchema.index({ exerciseName: 1, userId: 1 }, { unique: true });
exerciseSchema.index({ workoutDayId: 1, userId: 1 });
workoutDaySchema.index({ dayName: 1, userId: 1 }, { unique: true });
goalSchema.index({ userId: 1, exerciseId: 1, type: 1 });
achievementSchema.index({ userId: 1, type: 1 });

// Create models
export const WorkoutTemplate = mongoose.models.WorkoutTemplate || mongoose.model('WorkoutTemplate', workoutTemplateSchema);
export const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', exerciseSchema);
export const WorkoutDay = mongoose.models.WorkoutDay || mongoose.model('WorkoutDay', workoutDaySchema);
export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

// TypeScript interfaces
export interface IWorkoutTemplate {
  _id: mongoose.Types.ObjectId;
  userId: string;
  templateName: string;
  workoutDayId: mongoose.Types.ObjectId;
  workoutDayName: string;
  exercises: Array<{
    exerciseId: mongoose.Types.ObjectId;
    exerciseName: string;
    defaultSets: Array<{
      weight: number;
      reps: number;
      rir: string;
    }>;
    notes?: string;
  }>;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExercise {
  _id: mongoose.Types.ObjectId;
  exerciseName: string;
  category: string;
  workoutDayId: mongoose.Types.ObjectId;
  defaultSets?: number;
  defaultReps?: number;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkoutDay {
  _id: mongoose.Types.ObjectId;
  dayName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  userId: string;
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  type: 'weight' | 'volume' | 'frequency';
  target: number;
  deadline?: Date;
  startValue: number;
  currentValue: number;
  status: 'in_progress' | 'achieved' | 'missed';
  achievedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAchievement {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: 'first_workout' | 'workout_streak' | 'weight_milestone' | 'volume_milestone' | 'goal_achieved' | 'pr_streak';
  name: string;
  description: string;
  value?: number;
  exerciseId?: mongoose.Types.ObjectId;
  exerciseName?: string;
  earnedAt: Date;
} 