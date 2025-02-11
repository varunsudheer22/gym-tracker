import mongoose from 'mongoose';

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

// Add indexes
workoutTemplateSchema.index({ userId: 1, templateName: 1 }, { unique: true });

// Export the model
export const WorkoutTemplate = mongoose.models.WorkoutTemplate || mongoose.model('WorkoutTemplate', workoutTemplateSchema);

// TypeScript interface
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