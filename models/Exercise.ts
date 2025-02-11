import mongoose from 'mongoose';

export interface IExercise {
  name: string;
  category: string;
  workoutDayId: mongoose.Types.ObjectId;
  defaultSets?: number;
  defaultReps?: number;
  notes?: string;
  userId: string;
}

const exerciseSchema = new mongoose.Schema<IExercise>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  workoutDayId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'WorkoutDay' },
  defaultSets: { type: Number },
  defaultReps: { type: Number },
  notes: { type: String },
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

// Create compound index for unique exercises per user
exerciseSchema.index({ name: 1, userId: 1 }, { unique: true });

// Create index for querying exercises by workout day
exerciseSchema.index({ workoutDayId: 1, userId: 1 });

export const Exercise = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', exerciseSchema); 