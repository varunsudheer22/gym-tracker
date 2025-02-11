import mongoose from 'mongoose';

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
achievementSchema.index({ userId: 1, type: 1 });

// Export the model
export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

// TypeScript interface
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