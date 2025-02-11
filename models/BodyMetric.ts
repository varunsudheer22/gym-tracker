import mongoose from 'mongoose';

export interface IBodyMetric {
  date: Date;
  weight: number;
  notes?: string;
  photos?: {
    front?: string;
    back?: string;
    side?: string;
  };
  userId: string;
}

const bodyMetricSchema = new mongoose.Schema<IBodyMetric>({
  date: { type: Date, required: true },
  weight: { type: Number, required: true },
  notes: String,
  photos: {
    front: String,
    back: String,
    side: String,
  },
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

// Create compound index for unique metrics per date and user
bodyMetricSchema.index({ date: 1, userId: 1 }, { unique: true });

export const BodyMetric = mongoose.models.BodyMetric || mongoose.model<IBodyMetric>('BodyMetric', bodyMetricSchema); 