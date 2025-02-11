import mongoose from 'mongoose';

export interface IPersonalRecord {
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  type: 'weight' | 'reps' | 'time' | 'distance';
  value: number;
  unit: string;
  date: Date;
  notes?: string;
  userId: string;
}

const personalRecordSchema = new mongoose.Schema<IPersonalRecord>({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Exercise' },
  exerciseName: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['weight', 'reps', 'time', 'distance']
  },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: Date, required: true },
  notes: String,
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

// Create compound index for unique records per exercise, type, and user
personalRecordSchema.index({ exerciseId: 1, type: 1, userId: 1 }, { unique: true });

// Create index for querying records by date
personalRecordSchema.index({ date: -1, userId: 1 });

export const PersonalRecord = mongoose.models.PersonalRecord || mongoose.model<IPersonalRecord>('PersonalRecord', personalRecordSchema); 