import mongoose from 'mongoose';

export interface IWorkoutDay {
  name: string;
  userId: string;
}

const workoutDaySchema = new mongoose.Schema<IWorkoutDay>({
  name: { type: String, required: true },
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

// Create compound index for unique workout days per user
workoutDaySchema.index({ name: 1, userId: 1 }, { unique: true });

export const WorkoutDay = mongoose.models.WorkoutDay || mongoose.model<IWorkoutDay>('WorkoutDay', workoutDaySchema); 