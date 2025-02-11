import mongoose from 'mongoose';

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

// Add indexes
goalSchema.index({ userId: 1, exerciseId: 1, type: 1 });

// Export the model
export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

// TypeScript interface
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