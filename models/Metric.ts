import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  photos: {
    front: String,
    back: String,
    side: String,
  },
}, {
  timestamps: true,
});

export const Metric = mongoose.models.Metric || mongoose.model('Metric', metricSchema); 