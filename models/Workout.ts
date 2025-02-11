import mongoose from 'mongoose';

export interface ISet {
  weight: number;
  reps: number;
  notes?: string;
}

export interface IExerciseLog {
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  sets: ISet[];
}

export interface IWorkout {
  date: Date;
  workoutDayId: mongoose.Types.ObjectId;
  workoutDayName: string;
  exercises: IExerciseLog[];
  notes?: string;
  userId: string;
}

const setSchema = new mongoose.Schema<ISet>({
  weight: { type: Number, required: true },
  reps: { type: Number, required: true },
  notes: String,
});

const exerciseLogSchema = new mongoose.Schema<IExerciseLog>({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Exercise' },
  exerciseName: { type: String, required: true },
  sets: [setSchema],
});

const workoutSchema = new mongoose.Schema<IWorkout>({
  date: { type: Date, required: true },
  workoutDayId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'WorkoutDay' },
  workoutDayName: { type: String, required: true },
  exercises: [exerciseLogSchema],
  notes: String,
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

// Create index for querying workouts by date range and user
workoutSchema.index({ date: -1, userId: 1 });

export const Workout = mongoose.models.Workout || mongoose.model<IWorkout>('Workout', workoutSchema); 